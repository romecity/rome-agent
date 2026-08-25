import { useState, useRef, useEffect } from 'react'

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [input])

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input)
      setInput('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] focus-within:border-indigo-300 dark:focus-within:border-indigo-500/40 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Rome AI anything..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none disabled:opacity-50"
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 p-2.5 rounded-xl bg-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-600 active:scale-95 transition-all duration-150"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  )
}
