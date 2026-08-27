import { motion } from 'framer-motion'

const capabilities = [
  {
    icon: '🧠',
    title: 'AI & RAG Systems',
    description: 'Production-grade retrieval-augmented generation on AWS serverless infrastructure.',
  },
  {
    icon: '☁️',
    title: 'Cloud Architecture',
    description: 'AWS CDK, Lambda, API Gateway, DynamoDB — designed for scale and cost efficiency.',
  },
  {
    icon: '🔒',
    title: 'Security & IAM',
    description: 'Least-privilege policies, access audits, and compliance-ready infrastructure.',
  },
  {
    icon: '⚡',
    title: 'DevOps & CI/CD',
    description: 'Automated pipelines, monitoring, alerting, and zero-downtime deployments.',
  },
]

const suggestedQuestions = [
  'What services does Rome offer?',
  'Tell me about the founder',
  'How does the RAG system work?',
  'What is Context Engineering?',
]

export default function Landing({ onStartChat }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="pt-14"
    >
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500/8 dark:bg-indigo-500/5 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/8 dark:bg-purple-500/5 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite_2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/5 via-purple-400/5 to-pink-400/5 dark:from-indigo-400/3 dark:via-purple-400/3 dark:to-pink-400/3 rounded-full blur-3xl animate-[spin_20s_linear_infinite]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]"
          >
            Meet{' '}
            <span className="gradient-text">Rome AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            An intelligent assistant that knows everything about Rome — our services,
            architecture, and capabilities. Ask anything.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <button
              onClick={() => onStartChat()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-full text-base hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start a conversation</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Capabilities — animate on scroll */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-sm transition-all duration-300"
            >
              <div className="text-2xl mb-3">{cap.icon}</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {cap.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                {cap.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Suggested Questions — pre-fill chat */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Try asking</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onStartChat(q)}
                className="px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Built with Amazon Bedrock, Lambda, CDK, and React
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Rome &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </motion.main>
  )
}
