# Voice Assistant Setup Guide

This guide explains how to set up the Voice Assistant feature with ElevenLabs TTS and GitHub integration.

## 🎯 **Overview**

The Voice Assistant provides:
- **Speech-to-Text**: Browser-native Web Speech API
- **Text-to-Speech**: ElevenLabs AI voice synthesis
- **Issue Creation**: Direct GitHub Issues API integration
- **Order Management**: Voice commands for order operations
- **Real-time Conversation**: Interactive voice interface

## 🔑 **Required API Keys**

### **1. ElevenLabs API Setup**

1. **Create ElevenLabs Account:**
   - Visit [elevenlabs.io](https://elevenlabs.io)
   - Sign up for an account
   - Navigate to Profile → API Keys
   - Copy your API key

2. **Choose Voice ID:**
   - Go to VoiceLab or use default voices
   - Copy the Voice ID (e.g., `21m00Tcm4TlvDq8ikWAM`)

### **2. GitHub Personal Access Token**

1. **Create GitHub Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate new token (classic)
   - Select scopes: `repo` (full repository access)
   - Copy the generated token

## ⚙️ **Environment Variables**

Add these to your `.env.local` file:

```env
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_REPO=ravirajzaveri/Mira

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚀 **Voice Commands**

### **Issue Creation Commands**
```
"Create issue: The order form is not saving data correctly"
"Bug report: Dashboard charts are overlapping on mobile"
"Problem with the status update functionality"
"Create issue for urgent delivery date calculation bug"
```

### **Order Management Commands**
```
"Show me all orders"
"Show delayed orders"
"Show urgent orders"
"List orders in production"
```

### **Status Update Commands**
```
"Update order ORD-20241201-001 status to completed"
"Change status of order ORD-20241201-002 to quality check"
"Mark order ORD-20241201-003 as delivered"
```

### **General Query Commands**
```
"What can you help me with?"
"Show me system status"
"Help with voice commands"
```

## 🔧 **Technical Architecture**

### **Voice Processing Pipeline**
```
Voice Input → Speech Recognition → Intent Analysis → Action Execution → Response Generation → TTS → Audio Output
```

### **Component Structure**
```
VoiceAssistant
├── Speech Recognition (Web Speech API)
├── Intent Classification (Custom logic)
├── Action Router (Command execution)
├── GitHub API Integration
├── ElevenLabs TTS Integration
└── Audio Playback Management
```

### **API Endpoints**

**GitHub Issues API:**
```
POST /api/github/issues
GET /api/github/issues?state=open&labels=voice-report
```

**ElevenLabs TTS API:**
```
POST /api/elevenlabs/tts
```

## 🎨 **UI Features**

### **Sticky Voice Button**
- **Blue Circle**: Ready to listen
- **Red Pulsing**: Currently listening
- **Yellow Spinning**: Processing command
- **Expandable Interface**: Show conversation history

### **Conversation History**
- User commands in blue bubbles
- Assistant responses in green bubbles
- Timestamps for each interaction
- Quick command suggestions

### **Quick Actions**
- Direct link to GitHub Issues
- Voice status indicators
- Command examples

## 🔒 **Security Considerations**

### **API Key Protection**
- Store all keys in environment variables
- Never expose keys in client-side code
- Use server-side API routes for external calls

### **GitHub Token Permissions**
- Use minimal required scopes
- Consider using GitHub App for production
- Regularly rotate access tokens

### **Speech Data**
- Speech processing uses browser APIs
- No audio data stored on servers
- Privacy-first approach

## 🛠 **Development Setup**

### **Local Development**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### **Testing Voice Features**
1. **Enable Microphone**: Allow browser microphone access
2. **Test Speech Recognition**: Click mic button and speak
3. **Test TTS**: Voice commands should trigger audio responses
4. **Test GitHub Integration**: Create test issues via voice

## 🚀 **Production Deployment**

### **Vercel Configuration**
1. Add environment variables in Vercel dashboard
2. Ensure API routes are properly configured
3. Test voice features in production environment

### **Environment Variables in Vercel**
```
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_VOICE_ID=voice_id
GITHUB_TOKEN=your_token
GITHUB_REPO=your_repo
```

## 🎯 **Usage Analytics**

### **Voice Command Analytics**
- Track command success rates
- Monitor issue creation frequency
- Analyze user interaction patterns
- Voice recognition accuracy metrics

### **GitHub Integration Metrics**
- Issues created via voice
- Issue resolution times
- Label categorization
- Developer response rates

## 🔮 **Future Enhancements**

### **LangChain Integration**
```typescript
// Planned features:
- Advanced intent recognition with OpenAI
- Context-aware conversations
- Multi-turn dialogue support
- Custom voice training
```

### **Enhanced Commands**
```typescript
// Future voice commands:
- "Generate weekly report"
- "Schedule order review meeting"
- "Export order data to Excel"
- "Send status update to client"
```

### **AI-Powered Features**
- Intelligent issue categorization
- Predictive text for voice responses
- Sentiment analysis for voice reports
- Automated issue prioritization

## 🐛 **Troubleshooting**

### **Common Issues**

**Microphone Not Working:**
- Check browser permissions
- Ensure HTTPS in production
- Verify Web Speech API support

**TTS Not Playing:**
- Check ElevenLabs API key
- Verify audio playback permissions
- Check network connectivity

**GitHub Issues Not Creating:**
- Verify GitHub token permissions
- Check repository access
- Validate API endpoint responses

### **Browser Compatibility**

**Supported Browsers:**
- Chrome 25+ (recommended)
- Firefox 44+
- Safari 14.1+
- Edge 79+

**Unsupported:**
- Internet Explorer
- Older mobile browsers

## 📚 **Resources**

- [ElevenLabs API Documentation](https://docs.elevenlabs.io/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Next Update:** After LangChain integration