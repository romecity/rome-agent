import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTheme } from './hooks/useTheme'
import Header from './components/Header'
import Landing from './components/Landing'
import Chat from './components/Chat'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState('landing') // 'landing' | 'chat'

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-black">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        view={view}
        onBack={() => setView('landing')}
      />

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <Landing key="landing" onStartChat={() => setView('chat')} />
        ) : (
          <Chat key="chat" />
        )}
      </AnimatePresence>
    </div>
  )
}
