'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  StopIcon,
  ExclamationTriangleIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface VoiceCommand {
  intent: string;
  text: string;
  confidence: number;
  entities: Record<string, any>;
}

interface VoiceResponse {
  text: string;
  audioUrl?: string;
  action?: string;
  data?: any;
}

interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const VoiceAssistant: React.FC = () => {
  // State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    text: string;
    timestamp: Date;
  }>>([]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Utility functions - declared first to avoid circular dependencies
  const extractOrderNumber = useCallback((text: string): string | null => {
    const match = text.match(/ORD-\d{8}-\d{3}/i);
    return match ? match[0].toUpperCase() : null;
  }, []);

  const extractStatus = useCallback((text: string): string => {
    const statusKeywords: Record<string, string> = {
      'completed': 'COMPLETED',
      'finished': 'COMPLETED',
      'done': 'COMPLETED',
      'casting': 'CASTING_COMPLETED',
      'polishing': 'POLISHING_COMPLETED',
      'quality': 'QUALITY_CHECK_PENDING',
      'approved': 'QUALITY_APPROVED',
      'delivered': 'DELIVERED'
    };
    
    const lowercaseText = text.toLowerCase();
    for (const [keyword, status] of Object.entries(statusKeywords)) {
      if (lowercaseText.includes(keyword)) {
        return status;
      }
    }
    return 'IN_PROGRESS';
  }, []);

  const extractIssueTitle = useCallback((text: string): string => {
    // Extract meaningful title from voice command
    const words = text.split(' ');
    const titleWords = words.slice(0, 8); // Take first 8 words
    return titleWords.join(' ').replace(/[^\w\s]/gi, '');
  }, []);

  // Process voice command
  const analyzeVoiceCommand = useCallback(async (text: string): Promise<VoiceCommand> => {
    // This would integrate with OpenAI or similar for intent recognition
    // For now, using simple keyword matching
    
    const lowercaseText = text.toLowerCase();
    
    // Issue creation intents
    if (lowercaseText.includes('create issue') || lowercaseText.includes('bug report') || lowercaseText.includes('problem with')) {
      return {
        intent: 'create_issue',
        text,
        confidence: 0.9,
        entities: {
          issueType: lowercaseText.includes('bug') ? 'bug' : 'feature',
          priority: lowercaseText.includes('urgent') || lowercaseText.includes('critical') ? 'high' : 'medium'
        }
      };
    }
    
    // Order management intents
    if (lowercaseText.includes('show orders') || lowercaseText.includes('list orders')) {
      return {
        intent: 'show_orders',
        text,
        confidence: 0.8,
        entities: {
          filter: lowercaseText.includes('delayed') ? 'delayed' : 
                 lowercaseText.includes('urgent') ? 'urgent' : 'all'
        }
      };
    }
    
    // Status update intents
    if (lowercaseText.includes('update status') || lowercaseText.includes('change status')) {
      return {
        intent: 'update_status',
        text,
        confidence: 0.7,
        entities: {
          orderNo: extractOrderNumber(text),
          status: extractStatus(text)
        }
      };
    }
    
    // General query intent
    return {
      intent: 'general_query',
      text,
      confidence: 0.5,
      entities: {}
    };
  }, [extractOrderNumber, extractStatus]);

  // Create GitHub issue
  const createGitHubIssue = async (command: VoiceCommand): Promise<VoiceResponse> => {
    try {
      const issue: GitHubIssue = {
        title: `Voice Report: ${extractIssueTitle(command.text)}`,
        body: `**Voice Command:** ${command.text}\n\n**Reported via Voice Interface**\n\nTimestamp: ${new Date().toISOString()}\n\n**Description:**\n${command.text}\n\n**Priority:** ${command.entities.priority || 'medium'}\n\n**Labels:** voice-report, ${command.entities.issueType || 'general'}`,
        labels: ['voice-report', command.entities.issueType || 'general', command.entities.priority || 'medium'],
        priority: command.entities.priority || 'medium'
      };

      // Create issue via GitHub API
      const response = await fetch('/api/github/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue)
      });

      if (response.ok) {
        const createdIssue = await response.json();
        return {
          text: `I&apos;ve created GitHub issue #${createdIssue.number}: "${issue.title}". The development team will review it shortly.`,
          action: 'issue_created',
          data: createdIssue
        };
      } else {
        throw new Error('Failed to create GitHub issue');
      }
    } catch (error) {
      console.error('GitHub issue creation failed:', error);
      return {
        text: 'I encountered an error creating the GitHub issue. Please try again or create it manually.',
      };
    }
  };

  // Handle order queries
  const handleOrderQuery = async (command: VoiceCommand): Promise<VoiceResponse> => {
    try {
      const filter = command.entities.filter || 'all';
      
      // This would call the actual orders API
      const ordersResponse = await fetch(`/api/orders?voice_query=${filter}`);
      const ordersData = await ordersResponse.json();
      
      if (ordersData.orders && ordersData.orders.length > 0) {
        const orderCount = ordersData.orders.length;
        const summary = filter === 'delayed' 
          ? `You have ${orderCount} delayed orders that need attention.`
          : filter === 'urgent'
          ? `You have ${orderCount} urgent orders to prioritize.`
          : `You have ${orderCount} total orders in the system.`;
        
        return {
          text: summary,
          action: 'orders_fetched',
          data: ordersData.orders
        };
      } else {
        return {
          text: filter === 'all' ? 'No orders found in the system.' : `No ${filter} orders found.`,
        };
      }
    } catch (error) {
      console.error('Order query failed:', error);
      return {
        text: 'I encountered an error fetching the orders. Please try again.',
      };
    }
  };

  // Handle status updates
  const handleStatusUpdate = async (command: VoiceCommand): Promise<VoiceResponse> => {
    const orderNo = command.entities.orderNo;
    const status = command.entities.status;
    
    if (!orderNo) {
      return {
        text: 'I need an order number to update the status. Please say something like "update status for order ORD-20240315-001".',
      };
    }

    try {
      const response = await fetch(`/api/orders/${orderNo}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        return {
          text: `I&apos;ve updated the status of order ${orderNo} to ${status.toLowerCase().replace('_', ' ')}.`,
          action: 'status_updated',
          data: { orderNo, status }
        };
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Status update failed:', error);
      return {
        text: `I couldn&apos;t update the status for order ${orderNo}. Please check the order number and try again.`,
      };
    }
  };

  // Handle general queries
  const handleGeneralQuery = async (command: VoiceCommand): Promise<VoiceResponse> => {
    return {
      text: 'I can help you with creating GitHub issues, showing orders, and updating order status. What would you like to do?',
    };
  };

  // Execute voice command
  const executeVoiceCommand = async (command: VoiceCommand): Promise<VoiceResponse> => {
    switch (command.intent) {
      case 'create_issue':
        return await createGitHubIssue(command);
      
      case 'show_orders':
        return await handleOrderQuery(command);
      
      case 'update_status':
        return await handleStatusUpdate(command);
      
      case 'general_query':
        return await handleGeneralQuery(command);
      
      default:
        return {
          text: 'I didn&apos;t understand that command. Try saying "create issue", "show orders", or "update status".',
        };
    }
  };

  // Play audio response
  const playAudioResponse = async (audioUrl: string) => {
    try {
      setIsPlaying(true);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Generate and play TTS
  const generateAndPlayTTS = async (text: string) => {
    try {
      // This would integrate with ElevenLabs TTS API
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voice_id: 'default', // Replace with actual ElevenLabs voice ID
          model_id: 'eleven_monolingual_v1'
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        await playAudioResponse(audioUrl);
      }
    } catch (error) {
      console.error('TTS generation failed:', error);
    }
  };

  const processVoiceCommand = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    
    // Add user message to history
    const userMessage = {
      type: 'user' as const,
      text,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      // Analyze command intent
      const command = await analyzeVoiceCommand(text);
      
      // Execute command
      const response = await executeVoiceCommand(command);
      
      // Add assistant response to history
      const assistantMessage = {
        type: 'assistant' as const,
        text: response.text,
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, assistantMessage]);
      setLastResponse(response.text);

      // Play audio response if available
      if (response.audioUrl) {
        await playAudioResponse(response.audioUrl);
      } else {
        // Generate TTS response
        await generateAndPlayTTS(response.text);
      }

    } catch (error) {
      console.error('Voice command processing failed:', error);
      const errorMessage = 'Sorry, I couldn&apos;t process that command. Please try again.';
      toast.error(errorMessage);
      await generateAndPlayTTS(errorMessage);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  }, [analyzeVoiceCommand]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };
    }
  }, [transcript, processVoiceCommand]);

  // Start/Stop listening functions
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    setIsListening(true);
    setTranscript('');
    recognitionRef.current.start();
    toast.success('Listening... Speak your command');
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <>
      {/* Sticky Voice Button */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex flex-col items-end gap-2">
          {/* Main Voice Button */}
          <Button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`
              w-14 h-14 rounded-full shadow-lg transition-all duration-200
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : isProcessing 
                  ? 'bg-yellow-500 animate-spin' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }
            `}
          >
            {isListening ? (
              <StopIcon className="h-6 w-6 text-white" />
            ) : isProcessing ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MicrophoneIcon className="h-6 w-6 text-white" />
            )}
          </Button>

          {/* Expand/Collapse Button */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="bg-white shadow-lg"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>

        {/* Expanded Interface */}
        {isExpanded && (
          <Card className="mt-4 w-80 max-h-96 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Voice Assistant</h3>
                <div className="flex gap-2">
                  {isPlaying && (
                    <SpeakerWaveIcon className="h-5 w-5 text-blue-500 animate-pulse" />
                  )}
                  <Button
                    onClick={() => window.open('https://github.com/ravirajzaveri/Mira/issues', '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <BugAntIcon className="h-4 w-4 mr-1" />
                    Issues
                  </Button>
                </div>
              </div>

              {/* Current Status */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Status:</div>
                <div className="text-sm text-gray-600">
                  {isListening 
                    ? 'Listening...' 
                    : isProcessing 
                      ? 'Processing...' 
                      : 'Ready to listen'
                  }
                </div>
                {transcript && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">Current:</div>
                    <div className="text-sm italic">&quot;{transcript}&quot;</div>
                  </div>
                )}
              </div>

              {/* Conversation History */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {conversationHistory.slice(-6).map((message, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-100 text-blue-900 ml-4'
                        : 'bg-green-100 text-green-900 mr-4'
                    }`}
                  >
                    <div className="font-medium">
                      {message.type === 'user' ? 'You' : 'Assistant'}:
                    </div>
                    <div>{message.text}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-gray-500 mb-2">Quick Commands:</div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div>&quot;Create issue: [description]&quot;</div>
                  <div>&quot;Show delayed orders&quot;</div>
                  <div>&quot;Update order [number] status&quot;</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />
    </>
  );
};

// Type declarations for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default VoiceAssistant;