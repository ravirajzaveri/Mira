import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/Sidebar'
import VoiceAssistant from '@/components/voice/VoiceAssistant'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jewelry ERP - Manufacturing Management',
  description: 'Modern jewelry manufacturing management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-hidden lg:ml-64">
            <div className="h-full overflow-auto">
              {children}
            </div>
          </main>
          <VoiceAssistant />
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}