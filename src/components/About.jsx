import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' },
  }),
}

const FLOAT_TAGS = [
  { text: '🧠 LLM Expert',   top: '4%',  left: '-5%'  },
  { text: '⚙️ RAG Systems',  top: '4%',  right: '-5%' },
  { text: '🎙 Voice AI',     top: '42%', left: '-12%' },
  { text: '🤖 AI Agents',    top: '42%', right: '-12%'},
  { text: '🏥 Healthcare AI',bottom: '6%', left: '8%'  },
]

export default function About() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section" id="about" ref={ref}>
      <div className="blob blob-3" style={{ top: '20%', left: '60%', opacity: 0.15 }} />

      <motion.h2
        className="section-title"
        variants={fadeUp}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        About <span>Me</span>
      </motion.h2>

      <div className="about-grid">
        {/* Text side */}
        <div className="about-text">
          <motion.h2
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            Building the future with <span className="highlight">Generative AI</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            I'm a Generative AI Engineer with 3+ years of hands-on experience building
            production LLM applications — from AI voice agents for hospitals to FHIR-compliant
            healthcare chatbots and multi-agent finance automation systems.
          </motion.p>

          <motion.p
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            My expertise spans prompt engineering, agentic workflows, RAG architecture, and
            deploying AI at scale using OpenAI, Gemini, Groq, and Azure AI Foundry. I don't
            just build demos — I ship production-grade AI.
          </motion.p>

          <motion.p
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            Beyond engineering, I topped CAT (99.34%ile), XAT (97.11%ile), and GMAT Focus
            (98%ile / 705) — proving I think as sharply about strategy as I do about systems.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="about-stats"
            variants={fadeUp}
            custom={5}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div className="stat-card">
              <div className="stat-num">3+</div>
              <div className="stat-label">Years of Experience</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">10+</div>
              <div className="stat-label">AI Projects Shipped</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">4</div>
              <div className="stat-label">Companies</div>
            </div>
          </motion.div>

          {/* Education */}
          <motion.div
            className="about-edu glass-card"
            variants={fadeUp}
            custom={6}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ marginTop: 24 }}
          >
            <div className="edu-icon">🎓</div>
            <div className="edu-info">
              <h4>B.E. Computer Science & Engineering</h4>
              <p>Birla Institute of Technology, Mesra &nbsp;•&nbsp; 2016 – 2020</p>
            </div>
          </motion.div>
        </div>

        {/* Photo side */}
        <motion.div
          className="about-visual"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <div className="photo-wrapper">
            {/* Gradient border frame */}
            <motion.div
              className="photo-frame"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="/photo.jpg"
                alt="Rishabh Raj"
                className="profile-photo"
              />
            </motion.div>

            {/* Floating skill tags */}
            {FLOAT_TAGS.map(({ text, ...pos }, i) => (
              <motion.div
                key={text}
                className="photo-float-tag"
                style={{ position: 'absolute', ...pos }}
                animate={{ y: [0, -7, 0] }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              >
                {text}
              </motion.div>
            ))}

            {/* Decorative ring */}
            <div className="photo-ring" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
