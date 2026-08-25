import { motion } from 'framer-motion'

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3"
    >
      {/* Avatar */}
      <div className="mt-1">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">R</span>
        </div>
      </div>

      {/* Typing dots */}
      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-100 dark:bg-white/[0.06] border border-gray-200/50 dark:border-white/5">
        <div className="flex items-center gap-1 h-5">
          <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
          <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
          <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
        </div>
      </div>
    </motion.div>
  )
}
