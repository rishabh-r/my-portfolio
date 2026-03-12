import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'

const NeuralScene = lazy(() => import('../three/NeuralScene'))

const TITLES = [
  'Generative AI Engineer',
  'LLM Systems Builder',
  'AI Voice Agent Developer',
  'RAG Architect',
  'Prompt Engineering Expert',
]

const BADGES = [
  { text: '🤖 OpenAI GPT', delay: 0.4 },
  { text: '🧠 LangChain', delay: 0.5 },
  { text: '⚡ Groq LLaMA', delay: 0.6 },
  { text: '☁️ Azure AI', delay: 0.7 },
  { text: '🎙 Retell AI', delay: 0.8 },
  { text: '🔍 RAG Systems', delay: 0.9 },
  { text: '🐍 Python', delay: 1.0 },
  { text: '✨ Gemini', delay: 1.1 },
]

function useTypewriter(words, typingSpeed = 70, pause = 1800) {
  const [displayed, setDisplayed] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIdx]
    let timeout

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), typingSpeed)
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), typingSpeed / 2)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setWordIdx(i => (i + 1) % words.length)
    }

    setDisplayed(current.slice(0, charIdx))
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words, typingSpeed, pause])

  return displayed
}

export default function Hero() {
  const title = useTypewriter(TITLES)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      {/* 3D Neural Network Background */}
      <div className="hero-canvas-wrapper">
        <Suspense fallback={null}>
          <NeuralScene />
        </Suspense>
      </div>

      {/* Gradient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-4" />

      {/* Content */}
      <div className="hero-content">
        <motion.div
          className="hero-greeting"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span>👋</span> Hello, I'm
        </motion.div>

        <motion.h1
          className="hero-name"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Rishabh<br />
          <span className="gradient-text">Raj</span>
        </motion.h1>

        <motion.div
          className="hero-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {title}<span className="cursor" />
        </motion.div>

        <motion.p
          className="hero-desc"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          3+ years building LLM solutions — AI voice agents, RAG systems, agentic
          workflows & healthcare AI. Turning complex AI into production-ready applications.
        </motion.p>

        <div className="hero-badges">
          {BADGES.map(({ text, delay }) => (
            <motion.span
              key={text}
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay, type: 'spring', stiffness: 200 }}
            >
              {text}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="hero-btns"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button className="btn-primary" onClick={() => scrollTo('projects')}>
            View Projects ✦
          </button>
          <button className="btn-secondary" onClick={() => scrollTo('contact')}>
            Contact Me
          </button>
        </motion.div>
      </div>

    </section>
  )
}
