import { motion } from 'framer-motion'

function RomeAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold">R</span>
    </div>
  )
}

function SourceBadge({ source }) {
  const name = source.document?.replace('.md', '').replace(/^\d+-/, '') || 'Source'
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      {name}
    </span>
  )
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
            px-4 py-3 rounded-2xl text-[15px] leading-relaxed
            ${isUser
              ? 'bg-indigo-500 text-white rounded-br-md'
              : message.isError
                ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20 rounded-bl-md'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-white/5 rounded-bl-md'
            }
          `}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
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

        {/* Latency */}
        {message.latency && (
          <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-600">
            {(message.latency / 1000).toFixed(1)}s
          </p>
        )}
      </div>
    </motion.div>
  )
}
