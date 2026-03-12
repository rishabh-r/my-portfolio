import { useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'

const EXPERIENCE = [
  {
    company: 'R Systems International',
    role: 'Gen AI Engineer (Senior Data Engineer)',
    duration: 'Sept 2025 – Present',
    location: 'Noida',
    emoji: '🏥',
    color: '#6c63ff',
    highlights: [
      'Built fully conversational AI voice agent for hospital inbound calls — handles bed pickup requests, verifies callers, creates backend orders automatically',
      'Engineered dynamic pickup item assembly: detects barcode vs model name, builds structured pickup_items_list for API submission',
      'Developed FHIR-compliant healthcare chatbot on Azure AI Foundry with real-time patient clinical data access',
      'Implemented secure Node.js/Express APIs for Patient Search, Encounters, Medications, Conditions via FHIR REST APIs',
    ],
    tags: ['Retell AI', 'Make.com', 'Azure AI Foundry', 'FHIR APIs', 'Node.js', 'OpenAPI 3.0'],
  },
  {
    company: 'Tracxn Technologies',
    role: 'Gen AI Engineer (Technical Program Manager)',
    duration: 'June 2025 – Sept 2025',
    location: 'Bengaluru',
    emoji: '📊',
    color: '#ff6584',
    highlights: [
      'Built zero-shot & schema-constrained prompting pipelines for automated portfolio extraction from 30,000+ websites using CrawlAI',
      'Migrated & optimized prompts across LLM platforms (Groq LLaMA → Gemini) through 5 iterative prompt versions',
      'Designed Resume–JD matching system with structured output and reasoning-based prompts for recruitment workflows',
      'Automated CXO Profile Updater using comparative prompting and context injection with JSON schema output',
    ],
    tags: ['Groq LLaMA', 'Gemini', 'CrawlAI', 'Prompt Engineering', 'Python', 'JSON Schema'],
  },
  {
    company: 'HCL Technologies',
    role: 'Gen AI Technical Lead',
    duration: 'Oct 2022 – Aug 2024',
    location: 'Noida',
    emoji: '🏦',
    color: '#00c9a7',
    highlights: [
      'Architected multi-agent coordination system for finance automation — invoice validation, anomaly detection, audit logging',
      'Built prompt chains using Role + Reasoning prompts for dynamic task execution in financial operations',
      'Developed end-to-end RAG system: ingestion pipelines, cosine similarity search, context-aware generation',
      'Integrated RAG framework into agentic workflow for dynamic knowledge-driven decision-making',
    ],
    tags: ['LangChain', 'RAG', 'Multi-Agent', 'Python', 'Vector Embeddings', 'Agentic AI'],
  },
  {
    company: 'Infosys Limited',
    role: 'AI Systems Engineer',
    duration: 'Mar 2021 – Jun 2022',
    location: 'Bengaluru',
    emoji: '☁️',
    color: '#54a0ff',
    highlights: [
      'Supported Azure ML deployments — resolved training failures, pipeline errors, and endpoint issues',
      'Built Python automation scripts for log parsing, cutting manual troubleshooting time significantly',
      'Gained strong foundation in ML operations: endpoint deployment, model versioning, real-time inference debugging',
    ],
    tags: ['Azure ML', 'Python', 'MLOps', 'Azure Cloud', 'REST APIs'],
  },
]

function TiltCard({ children, className }) {
  const cardRef = useRef()

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rx = ((y - cy) / cy) * 7
    const ry = ((cx - x) / cx) * 7
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`
    card.style.boxShadow = '0 24px 60px rgba(108,99,255,0.22)'
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)'
    card.style.boxShadow = ''
  }, [])

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

export default function Experience() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="section" id="experience" ref={ref}>
      <div className="blob blob-1" style={{ opacity: 0.12, top: '10%', left: '-10%' }} />

      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Work <span>Experience</span>
      </motion.h2>

      <div className="timeline">
        {EXPERIENCE.map((exp, i) => (
          <motion.div
            key={exp.company}
            className="timeline-item"
            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <div
              className="timeline-dot"
              style={{ background: exp.color, boxShadow: `0 0 0 3px ${exp.color}` }}
            />
            <TiltCard className="exp-card">
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                background: `linear-gradient(180deg, ${exp.color}, ${exp.color}aa)`,
                borderRadius: '4px 0 0 4px'
              }} />

              <div style={{ marginBottom: 16 }}>
                <div
                  className="exp-emoji"
                  style={{ background: `${exp.color}18`, color: exp.color }}
                >
                  {exp.emoji}
                </div>
                <div className="exp-header">
                  <div>
                    <div className="exp-company">{exp.company}</div>
                    <div className="exp-role" style={{ color: exp.color }}>{exp.role}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 2 }}>
                      📍 {exp.location}
                    </div>
                  </div>
                  <div className="exp-duration">{exp.duration}</div>
                </div>
              </div>

              <ul className="exp-bullets">
                {exp.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>

              <div className="exp-tags">
                {exp.tags.map(tag => (
                  <span
                    key={tag}
                    className="exp-tag"
                    style={{
                      background: `${exp.color}12`,
                      color: exp.color,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
