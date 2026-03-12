import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const CONTACTS = [
  {
    icon: '✉️',
    label: 'Email',
    value: 'rishabh.raj12099@gmail.com',
    href: 'mailto:rishabh.raj12099@gmail.com',
    color: '#6c63ff',
    bg: '#6c63ff18',
  },
  {
    icon: '💼',
    label: 'LinkedIn',
    value: 'rishabh-raj-78236b18a',
    href: 'https://www.linkedin.com/in/rishabh-raj-78236b18a/',
    color: '#0077b5',
    bg: '#0077b518',
  },
  {
    icon: '📍',
    label: 'Location',
    value: 'India (Remote-friendly)',
    href: null,
    color: '#ff6584',
    bg: '#ff658418',
  },
]

export default function Contact() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText('rishabh.raj12099@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="section" id="contact" ref={ref}>
      <div className="blob blob-1" style={{ opacity: 0.12, top: '-5%', right: '20%' }} />

      <div className="contact-inner">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Let's <span>Connect</span>
        </motion.h2>

        <motion.p
          className="contact-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
        >
          I'm always open to discussing AI projects, collaboration opportunities,
          or just a great conversation about the future of generative AI. Let's build something amazing together.
        </motion.p>

        <div className="contact-cards">
          {CONTACTS.map((c, i) => (
            <motion.a
              key={c.label}
              className="contact-card glass-card"
              href={c.href ?? undefined}
              target={c.href?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={!c.href ? copyEmail : undefined}
              style={{ cursor: c.href ? 'pointer' : 'copy' }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.04 }}
            >
              <div
                className="contact-card-icon"
                style={{ background: c.bg, color: c.color }}
              >
                {c.icon}
              </div>
              <div className="contact-card-label">{c.label}</div>
              <div className="contact-card-value" style={{ color: c.color }}>
                {c.label === 'Email' && copied ? '✅ Copied!' : c.value}
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          style={{ marginTop: 32 }}
        >
          <a
            href="mailto:rishabh.raj12099@gmail.com"
            className="btn-primary"
            style={{ fontSize: '1rem', padding: '16px 40px', textDecoration: 'none' }}
          >
            📬 Send Me an Email
          </a>
        </motion.div>

        <div className="contact-footer">
          <p>Designed & built by <strong>Rishabh Raj</strong> <span>♥</span></p>
          <p style={{ marginTop: 6, fontSize: '0.78rem', opacity: 0.7 }}>
            Generative AI Engineer · BIT Mesra · 2024
          </p>
        </div>
      </div>
    </section>
  )
}
