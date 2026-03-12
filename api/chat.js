// api/chat.js — Vercel Serverless Function (ES Module)
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const RISHABH_BIO = `
ABOUT RISHABH RAJ:
- Current Role: Gen AI Engineer (Senior Data Engineer) at R Systems International, Noida (September 2025 – Present)
  * Built fully conversational AI voice agent for hospital inbound calls using Retell AI and Make.com
  * Built RSICareBridge on Azure AI Foundry — FHIR standard healthcare chatbot easily integrated in any EHR platform
  * Engineered FHIR R4 REST API integrations for Patient Search, Encounters, Medications, Conditions, Procedures
  * Engineered dynamic pickup item assembly: detects barcode vs model name, builds structured orders automatically

- Previous: Gen AI Engineer (Technical Program Manager) at Tracxn Technologies, Bengaluru (June 2025 – September 2025)
  * Built zero-shot & schema-constrained prompting pipelines for automated portfolio extraction from 30,000+ websites using CrawlAI
  * Migrated & optimized prompts across LLM platforms (Groq LLaMA → Gemini) through 5 iterative prompt versions
  * Designed Resume–JD matching system with structured output

- Previous: Gen AI Technical Lead at HCL Technologies, Noida (October 2022 – August 2024)
  * Architected multi-agent coordination system for finance automation — invoice validation, anomaly detection, audit logging
  * Built prompt chains using Role + Reasoning prompts for dynamic task execution in financial operations
  * Developed end-to-end RAG system: ingestion pipelines, cosine similarity search, context-aware generation
  * Rated 9+/10 by HCL management

- Previous: AI Systems Engineer at Infosys Limited, Bengaluru (March 2021 – June 2022)
  * Supported Azure ML deployments — resolved training failures, pipeline errors, and endpoint issues
  * Built Python automation scripts for log parsing, cutting manual troubleshooting time significantly
  * Gained strong foundation in ML model lifecycle and cloud deployments

EDUCATION:
- B.E. Computer Science, BIT Mesra, 2016–2020

SKILLS:
- Prompt Engineering (zero-shot, few-shot, chain-of-thought, role prompting, schema-constrained)
- LLM Platforms: GPT-4, GPT-4o, Gemini, LLaMA, Groq, Claude
- AI Frameworks: LangChain, LangGraph, Multi-Agent Systems, RAG (Retrieval Augmented Generation)
- Voice AI: Retell AI, Web Speech API, conversational AI agents
- Healthcare AI: FHIR REST APIs, Azure AI Foundry, healthcare chatbots
- Web Scraping AI: CrawlAI, automated data extraction pipelines
- Cloud: Azure ML, Azure AI Foundry, Vercel
- Languages: Python, JavaScript, Node.js
- Tools: OpenAI API, Make.com, Vector Embeddings, JSON Schema, Cosine Similarity

ACHIEVEMENTS:
- CAT: 99.34 percentile (Common Admission Test — top entrance exam for IIMs in India)
- XAT: 97.11 percentile (Xavier Aptitude Test — XLRI, SPJIMR qualifier)
- GMAT Focus Score: 705 (98th percentile — Executive MBA qualification)
- HCL Appraisal: 9+/10 (outstanding rating with exceptional manager feedback)
- R Systems Conversion: Converted to full-time in just 2 months vs standard 3-month probation

CONTACT:
- Email: rishabh.raj12099@gmail.com
- LinkedIn: https://www.linkedin.com/in/rishabh-raj-78236b18a/
- Location: India (open to remote opportunities)
`

// ── Chat system prompt (detailed, formatted) ──────────────────────────────
const SYSTEM_PROMPT = `You are Rishabh Raj's personal AI assistant on his portfolio website. Help recruiters learn about Rishabh's background, skills, and experience. Be warm, professional, and concise.
${RISHABH_BIO}
INSTRUCTIONS:
- Answer questions warmly and professionally
- For salary or highly personal questions, say Rishabh prefers to discuss those directly
- Format responses using bullet points (- item) and **bold** for category labels when listing multiple things
- Keep responses concise — use bullet points for lists, short paragraphs for simple answers
- If asked something not listed, say "I'm not sure about that — you can reach Rishabh directly at rishabh.raj12099@gmail.com"
- Do not make up or assume information not listed above
- If asked about availability, say he is open to exciting AI/ML roles
- If the user asks to download, share, view, or get Rishabh's resume or CV, respond warmly and include the exact token [RESUME_DOWNLOAD] on its own line at the end of your reply`

// ── Voice system prompt (conversational, short, natural) ──────────────────
const VOICE_PROMPT = `You are Rishabh Raj's friendly AI assistant speaking out loud to a recruiter. Keep responses short, natural and conversational — like a friend talking, not a document being read.
${RISHABH_BIO}
VOICE INSTRUCTIONS:
- Always give a brief 1-3 sentence conversational summary. Never list everything at once.
- Sound natural — use phrases like "So basically...", "He's currently...", "The cool thing is...", "In short..."
- No bullet points, no lists, no bold, no formatting — just plain flowing speech
- If the user wants more detail, they'll ask. Don't volunteer everything upfront.
- Keep it under 40 words unless the user specifically asks for more details or says "tell me more" / "elaborate" / "in detail"
- For salary or personal questions, say Rishabh prefers to discuss those directly
- If asked about availability, say he's open to exciting AI/ML opportunities
- If unsure, say "I'm not sure about that, but you can reach Rishabh at rishabh dot raj 12099 at gmail dot com"`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, voice, lang } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' })
  }

  // For voice mode, append a language instruction so the AI responds in the right language
  const langInstruction = voice
    ? (lang === 'hi'
        ? '\n\nLANGUAGE RULE: The user is speaking Hindi. You MUST respond entirely in natural, conversational Hindi using Devanagari script. Do NOT use English words unless they are technical terms with no Hindi equivalent.'
        : '\n\nLANGUAGE RULE: Respond in English.')
    : ''

  const systemContent = (voice ? VOICE_PROMPT : SYSTEM_PROMPT) + langInstruction

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        ...messages.slice(-10),
      ],
      max_tokens: voice ? 120 : 700,
      temperature: voice ? 0.85 : 0.7,
    })

    const reply = completion.choices[0].message.content
    return res.status(200).json({ reply })
  } catch (err) {
    console.error('OpenAI error:', err)
    return res.status(500).json({ error: 'AI service unavailable. Please try again.' })
  }
}
