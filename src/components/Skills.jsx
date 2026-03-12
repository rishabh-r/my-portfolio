import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SKILL_CATEGORIES = [
  {
    name: 'Prompt Engineering',
    icon: '✍️',
    color: '#6c63ff',
    bg: '#6c63ff18',
    skills: [
      'Zero-shot', 'Few-shot', 'Chain-of-Thought', 'Structured Output (JSON)',
      'Context Injection', 'Prompt Versioning', 'Comparative Prompts',
      'Role Prompting', 'PromptOps',
    ],
  },
  {
    name: 'LLM & AI Platforms',
    icon: '🤖',
    color: '#ff6584',
    bg: '#ff658418',
    skills: [
      'OpenAI GPT', 'Google Gemini', 'Groq LLaMA', 'Azure OpenAI',
      'Azure AI Foundry', 'CrawlAI', 'Crew AI', 'LangChain', 'Retell AI', 'Make.com',
    ],
  },
  {
    name: 'Programming & APIs',
    icon: '💻',
    color: '#00c9a7',
    bg: '#00c9a718',
    skills: [
      'Python', 'Node.js', 'JavaScript', 'REST APIs', 'OpenAPI 3.0',
      'FHIR APIs', 'Vector Embeddings', 'Postman', 'JSON Schema',
    ],
  },
  {
    name: 'Cloud & Infrastructure',
    icon: '☁️',
    color: '#54a0ff',
    bg: '#54a0ff18',
    skills: [
      'Azure OpenAI', 'Azure AI Foundry', 'Azure ML', 'Bearer Token Auth',
      'Webhook Integration', 'API Authentication',
    ],
  },
  {
    name: 'AI Specializations',
    icon: '⚡',
    color: '#ff9f43',
    bg: '#ff9f4318',
    skills: [
      'Agentic AI', 'RAG Systems', 'AI Voice Agents', 'Healthcare AI (FHIR)',
      'Chatbot Development', 'NLP', 'Multi-Agent Coordination', 'Cosine Similarity Search',
    ],
  },
]

export default function Skills() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="section" id="skills" ref={ref}>
      <div className="blob blob-2" style={{ opacity: 0.12, bottom: '10%', right: '-5%' }} />

      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Technical <span>Skills</span>
      </motion.h2>

      <div className="skills-grid">
        {SKILL_CATEGORIES.map((cat, ci) => (
          <motion.div
            key={cat.name}
            className="skill-category"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: ci * 0.1 }}
          >
            <div className="skill-cat-header">
              <div
                className="skill-cat-icon"
                style={{ background: cat.bg, color: cat.color }}
              >
                {cat.icon}
              </div>
              <div
                className="skill-cat-name"
                style={{ color: cat.color }}
              >
                {cat.name}
              </div>
            </div>

            <div className="skill-badges">
              {cat.skills.map((skill, si) => (
                <motion.span
                  key={skill}
                  className="skill-badge"
                  style={{ color: cat.color, borderColor: `${cat.color}55` }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    duration: 0.35,
                    delay: ci * 0.1 + si * 0.04,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.08, opacity: 1 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
