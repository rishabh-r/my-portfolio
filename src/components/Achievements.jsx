import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const ACHIEVEMENTS = [
  {
    emoji: '🎯',
    num: '99.34',
    suffix: '%ile',
    label: 'CAT Percentile',
    sub: 'Common Admission Test — top entrance exam for IIMs in India',
  },
  {
    emoji: '🏆',
    num: '97.11',
    suffix: '%ile',
    label: 'XAT Percentile',
    sub: 'Xavier Aptitude Test — XLRI, SPJIMR qualifier',
  },
  {
    emoji: '⭐',
    num: '705',
    suffix: '',
    label: 'GMAT Focus Score',
    sub: '98th percentile — Executive MBA qualification',
  },
  {
    emoji: '🌟',
    num: '9+',
    suffix: '/10',
    label: 'HCL Appraisal Score',
    sub: 'Outstanding rating with exceptional manager feedback',
  },
  {
    emoji: '⚡',
    num: '2',
    suffix: ' mo',
    label: 'R Systems Full-Time',
    sub: 'Converted in 2 months vs standard 3-month probation',
  },
]

function Counter({ target, suffix, inView }) {
  const [count, setCount] = useState(0)
  const num = parseFloat(target)

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const steps = 60
    const increment = num / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= num) {
        setCount(num)
        clearInterval(timer)
      } else {
        setCount(parseFloat(current.toFixed(2)))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, num])

  const display = Number.isInteger(num) ? count.toFixed(0) : count.toFixed(2)

  return <>{display}{suffix}</>
}

export default function Achievements() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="section" id="achievements" ref={ref}>
      <div className="blob blob-3" style={{ opacity: 0.15, bottom: '0%', left: '10%' }} />

      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Key <span>Achievements</span>
      </motion.h2>

      <div className="achievements-grid">
        {ACHIEVEMENTS.map((a, i) => (
          <motion.div
            key={a.label}
            className="achieve-card glass-card"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, type: 'spring', stiffness: 120 }}
          >
            <span className="achieve-emoji">{a.emoji}</span>
            <div className="achieve-num">
              <Counter target={a.num} suffix={a.suffix} inView={inView} />
            </div>
            <div className="achieve-label">{a.label}</div>
            <div className="achieve-sub">{a.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
