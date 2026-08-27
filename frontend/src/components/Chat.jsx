import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { sendQuery, checkHealth } from '../api/client'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ChatInput from './ChatInput'
import StatusIndicator from './StatusIndicator'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi, I'm Rome AI. I can answer questions about Rome's services, architecture, and capabilities. What would you like to know?",
  timestamp: Date.now(),
}

const STORAGE_KEY = 'rome-chat-history'

function loadMessages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const messages = JSON.parse(stored)
      if (messages.length > 0) return messages
    }
  } catch {}
  return [WELCOME_MESSAGE]
}

function saveMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {}
}

export default function Chat({ initialQuestion }) {
  const [messages, setMessages] = useState(loadMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking') // 'online' | 'offline' | 'checking'
  const messagesEndRef = useRef(null)
  const hasHandledInitialQuestion = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Persist messages to localStorage
  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  // Check API health on mount
  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))
  }, [])

  // Handle pre-filled question from landing page
  const handleSend = useCallback(async (question) => {
    if (!question.trim() || isLoading) return

    setError(null)

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: Date.now(),
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
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setApiStatus('online')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble processing that request right now. Please try again in a moment.",
        isError: true,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  // Auto-send initial question from landing page
  useEffect(() => {
    if (initialQuestion && !hasHandledInitialQuestion.current) {
      hasHandledInitialQuestion.current = true
      // Small delay so the chat UI renders first
      const timer = setTimeout(() => handleSend(initialQuestion), 300)
      return () => clearTimeout(timer)
    }
  }, [initialQuestion, handleSend])

  const clearHistory = () => {
    setMessages([WELCOME_MESSAGE])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="pt-14 flex flex-col h-screen"
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 max-w-3xl mx-auto w-full">
        <StatusIndicator status={apiStatus} />
        {messages.length > 1 && (
          <button
            onClick={clearHistory}
            className="text-[11px] text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            Clear history
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
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
            Enter to send · Shift+Enter for new line · Responses from curated knowledge base
          </p>
        </div>
      </div>
    </motion.div>
  )
}
