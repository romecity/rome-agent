import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { sendQuery } from '../api/client'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ChatInput from './ChatInput'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi, I'm Rome AI. I can answer questions about Rome's services, architecture, and capabilities. What would you like to know?",
  timestamp: new Date(),
}

export default function Chat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (question) => {
    if (!question.trim() || isLoading) return

    setError(null)

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await sendQuery(question.trim())

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        latency: response.latency_ms,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble processing that request right now. Please try again in a moment.",
        isError: true,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="pt-14 flex flex-col h-screen"
    >
      {/* Messages area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-black/80 glass">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 dark:text-red-400 mb-2 text-center"
            >
              {error}
            </motion.p>
          )}
          <ChatInput onSend={handleSend} disabled={isLoading} />
          <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center mt-3">
            Rome AI uses RAG to answer from a curated knowledge base. Responses may not cover all topics.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
