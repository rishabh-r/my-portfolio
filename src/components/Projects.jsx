import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PROJECTS = [
  {
    icon: '🏥',
    name: 'US Med-Equip Voice Agent',
    type: 'AI Voice Automation',
    tech: ['Retell AI', 'Make.com', 'Python', 'REST API'],
    desc: 'Fully conversational AI agent for hospital inbound calls — verifies callers, collects bed pickup details, and automatically creates backend orders.',
    features: [
      'Dynamic barcode/model-name pickup item detection',
      'Voice-optimized prompts for natural conversation',
      'Webhook-triggered order creation via Make.com',
      'Multi-step: identity verify → pickup schedule',
    ],
  },
  {
    icon: '💊',
    name: 'FHIR Healthcare Chatbot',
    type: 'Healthcare AI',
    tech: ['Azure AI Foundry', 'FHIR API', 'Node.js', 'OpenAPI 3.0'],
    desc: 'Production-ready FHIR-compliant chatbot for clinical data — Patient Search, Encounters, Medications, Procedures via real-time API calls.',
    features: [
      'Azure AI Foundry with custom tool integrations',
      'Bearer Token authenticated FHIR REST APIs',
      'Handles 6+ clinical resource types',
      'Deployed for marketing demo showcases',
    ],
  },
  {
    icon: '🔍',
    name: 'Portfolio Extractor Pipeline',
    type: 'LLM Automation',
    tech: ['Groq LLaMA', 'Gemini', 'CrawlAI', 'Python'],
    desc: 'Scalable zero-shot prompting pipeline that parsed 30,000+ company websites to extract structured portfolio data automatically.',
    features: [
      'Zero-shot + schema-constrained prompts',
      'Version-controlled prompt optimization (V1–V5)',
      'Migrated seamlessly across LLM platforms',
      'Reusable modular system prompts',
    ],
  },
  {
    icon: '💰',
    name: 'Finance Agentic System',
    type: 'Agentic AI',
    tech: ['LangChain', 'Multi-Agent', 'Python', 'Prompt Engineering'],
    desc: 'Multi-agent coordination system for finance automation — invoice validation, anomaly detection, and audit logging with structured prompt chains.',
    features: [
      'Goal-oriented agentic workflow architecture',
      'Role + Reasoning prompt orchestration',
      'Dynamic task execution from context',
      'Finance process automation',
    ],
  },
  {
    icon: '📚',
    name: 'RAG Agentic Framework',
    type: 'RAG System',
    tech: ['LangChain', 'Vector DB', 'Python', 'Cosine Similarity'],
    desc: 'End-to-end Retrieval-Augmented Generation framework with ingestion, retrieval, and generation — integrated into agentic decision-making.',
    features: [
      'Document ingestion with embeddings pipeline',
      'Cosine similarity search for retrieval',
      'Context-aware generation workflows',
      'Integrated into agentic task execution',
    ],
  },
  {
    icon: '😷',
    name: 'Face Mask Detection',
    type: 'Computer Vision',
    tech: ['OpenCV', 'MobileNetV2', 'Python', 'TensorFlow'],
    desc: 'Lightweight face mask detection system using MobileNetV2 architecture, optimized for deployment on low-power IoT devices.',
    features: [
      'MobileNetV2 transfer learning',
      'Real-time video stream detection',
      'Optimized for edge/low-power devices',
      'OpenCV integration',
    ],
  },
]

export default function Projects() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="section" id="projects" ref={ref}>
      <div className="blob blob-4" style={{ opacity: 0.15, top: '10%', right: '5%' }} />

      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Featured <span>Projects</span>
      </motion.h2>

      <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: 40, marginTop: -40, fontSize: '0.9rem', position: 'relative', zIndex: 1 }}>
        Hover over a card to see details
      </p>

      <div className="projects-grid">
        {PROJECTS.map((p, i) => (
          <motion.div
            key={p.name}
            className="flip-card"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <div className="flip-inner">
              {/* Front */}
              <div className="flip-front">
                <div>
                  <div className="project-icon">{p.icon}</div>
                  <div className="project-name">{p.name}</div>
                  <div className="project-type">{p.type}</div>
                </div>
                <div>
                  <div className="project-tech">
                    {p.tech.map(t => <span key={t}>{t}</span>)}
                  </div>
                  <div className="flip-hint">↻ hover to flip</div>
                </div>
              </div>

              {/* Back */}
              <div className="flip-back">
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>
                    {p.name}
                  </div>
                  <p className="project-desc">{p.desc}</p>
                </div>
                <ul className="project-features">
                  {p.features.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
