export default function StatusIndicator({ status }) {
  const config = {
    online: { color: 'bg-emerald-500', text: 'API Online' },
    offline: { color: 'bg-red-500', text: 'API Offline' },
    checking: { color: 'bg-yellow-500 animate-pulse', text: 'Checking...' },
  }

  const { color, text } = config[status] || config.checking

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-[11px] text-gray-400 dark:text-gray-600">{text}</span>
    </div>
  )
}
