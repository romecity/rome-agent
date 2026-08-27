import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function RomeAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold">R</span>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
      aria-label="Copy message"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

function SourceBadge({ source }) {
  const [expanded, setExpanded] = useState(false)
  const name = source.document?.replace('.md', '').replace(/^\d+-/, '') || 'Source'

  return (
    <div className="inline-block">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {name}
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && source.excerpt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="mt-1 px-2 py-1.5 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/5 leading-relaxed">
              {source.excerpt}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)

  if (diffSecs < 5) return 'just now'
  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, isLatest }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={isLatest ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar (assistant only) */}
      {!isUser && (
        <div className="mt-1">
          <RomeAvatar />
        </div>
      )}

      {/* Message content */}
      <div className={`max-w-[80%] sm:max-w-[70%] ${isUser ? 'order-1' : ''}`}>
        <div
          className={`
            group relative px-4 py-3 rounded-2xl text-[15px] leading-relaxed
            ${isUser
              ? 'bg-indigo-500 text-white rounded-br-md'
              : message.isError
                ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20 rounded-bl-md'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-white/5 rounded-bl-md'
            }
          `}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Copy button (assistant messages only) */}
          {!isUser && !message.isError && (
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={message.content} />
            </div>
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 flex flex-wrap gap-1.5"
          >
            {message.sources.map((source, i) => (
              <SourceBadge key={i} source={source} />
            ))}
          </motion.div>
        )}

        {/* Timestamp + Latency */}
        <div className="mt-1.5 flex items-center gap-2">
          <p className="text-[10px] text-gray-400 dark:text-gray-600">
            {formatTime(message.timestamp)}
          </p>
          {message.latency && (
            <p className="text-[10px] text-gray-400 dark:text-gray-600">
              · {(message.latency / 1000).toFixed(1)}s
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
