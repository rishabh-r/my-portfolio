import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Web Speech API detection ─────────────────────────────────────────────
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

const speechSynthesisAvailable =
  typeof window !== 'undefined' && 'speechSynthesis' in window

// ─── Markdown renderer ────────────────────────────────────────────────────
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''))
        i++
      }
      elements.push(
        <ul key={i} style={{ paddingLeft: '1.2em', margin: '4px 0' }}>
          {items.map((item, j) => (
            <li key={j} style={{ marginBottom: '2px' }}>{parseBold(item)}</li>
          ))}
        </ul>
      )
    } else if (line.trim() === '') {
      i++
    } else {
      elements.push(<p key={i} style={{ margin: '4px 0' }}>{parseBold(line)}</p>)
      i++
    }
  }
  return elements
}

function parseBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

// ─── Strip markdown for TTS ───────────────────────────────────────────────
function stripMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^#+\s+/gm, '')
    .replace(/`(.*?)`/g, '$1')
    .trim()
}

// ─── Detect language from transcript ─────────────────────────────────────
function detectLang(text) {
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length
  return hindiChars > 1 ? 'hi' : 'en'
}

// ─── Speak — bilingual (en/hi), Indian female voice ──────────────────────
function speak(text, lang = 'en', onEnd) {
  if (!speechSynthesisAvailable) { onEnd?.(); return }
  window.speechSynthesis.cancel()
  const utter        = new SpeechSynthesisUtterance(text)
  utter.rate         = lang === 'hi' ? 1.0 : 1.08
  utter.pitch        = lang === 'hi' ? 1.1 : 1.2
  utter.lang         = lang === 'hi' ? 'hi-IN' : 'en-GB'
  utter.onend        = () => onEnd?.()
  utter.onerror      = () => onEnd?.()

  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices()
    let preferred
    if (lang === 'hi') {
      preferred =
        voices.find(v => v.lang === 'hi-IN' && /female/i.test(v.name)) ||
        voices.find(v => v.lang === 'hi-IN')                            ||
        voices.find(v => v.lang.startsWith('hi'))
    } else {
      // Priority: Google natural female → Microsoft Zira → Raveena → en-IN female → any en female
      preferred =
        voices.find(v => v.name === 'Google UK English Female')                ||
        voices.find(v => v.name === 'Google US English Female')                ||
        voices.find(v => /zira/i.test(v.name))                                 ||
        voices.find(v => v.name.includes('Raveena'))                           ||
        voices.find(v => v.lang === 'en-IN' && /female/i.test(v.name))        ||
        voices.find(v => v.lang === 'en-IN')                                   ||
        voices.find(v => v.lang === 'en-GB' && /female/i.test(v.name))        ||
        voices.find(v => v.lang === 'en-AU' && /female/i.test(v.name))        ||
        voices.find(v => v.lang.startsWith('en') && /female/i.test(v.name))   ||
        voices.find(v => /female/i.test(v.name))
    }
    if (preferred) utter.voice = preferred
    window.speechSynthesis.speak(utter)
  }

  if (window.speechSynthesis.getVoices().length > 0) trySpeak()
  else window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true })
}

// ─── Panel animation variants ─────────────────────────────────────────────
const panelVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 320, damping: 26 } },
  exit:    { opacity: 0, y: 16, scale: 0.96, transition: { duration: 0.18 } },
}

// ─── Resume download button (used inside chat bubbles) ────────────────────
function ResumeDownloadBtn() {
  return (
    <a
      className="chatbot-resume-btn"
      href="/Rishabh_Raj_Resume.docx"
      download="Rishabh_Raj_Resume.docx"
    >
      ⬇ Download Rishabh's Resume
    </a>
  )
}

// ─── Render message content — handles [RESUME_DOWNLOAD] tag ───────────────
function renderMessageContent(text) {
  const parts = text.split('[RESUME_DOWNLOAD]')
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part.trim() ? renderMarkdown(part.trim()) : null}
          {i < parts.length - 1 && <ResumeDownloadBtn />}
        </span>
      ))}
    </>
  )
}

// ─── Suggested questions ──────────────────────────────────────────────────
const SUGGESTIONS = [
  "What is Rishabh's current role?",
  'What AI skills does he have?',
  'Tell me about his projects',
  'Is he open to new opportunities?',
]

// ─── Main Component ───────────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen]           = useState(false)
  const [activeTab, setActiveTab] = useState('chat')

  // ── Chat state ──────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm Rishabh's AI assistant 👋 Ask me anything about his experience, skills, or projects!",
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)

  // ── Voice state ─────────────────────────────────────────────────────────
  const [conversationActive, setConversationActive] = useState(false)
  const [listening, setListening]                   = useState(false)
  const [isSpeaking, setIsSpeaking]                 = useState(false)
  const [voiceLoading, setVoiceLoading]             = useState(false)
  const [voiceHistory, setVoiceHistory]             = useState([])
  const [currentTranscript, setCurrentTranscript]   = useState('')

  // ── Refs ─────────────────────────────────────────────────────────────────
  const messagesEndRef        = useRef(null)
  const voiceEndRef           = useRef(null)
  const inputRef              = useRef(null)
  const recognitionRef        = useRef(null)
  const transcriptRef         = useRef('')
  const conversationActiveRef = useRef(false)
  const isListeningRef        = useRef(false)
  const langRef               = useRef('en')    // 'en' | 'hi'
  const phaseRef              = useRef('greeting') // 'greeting' | 'chat'
  const startListeningRef     = useRef(null)

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-scroll voice history
  useEffect(() => {
    voiceEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [voiceHistory, voiceLoading])

  // Focus input on chat open
  useEffect(() => {
    if (open && activeTab === 'chat') setTimeout(() => inputRef.current?.focus(), 150)
  }, [open, activeTab])

  // Stop voice if tab changes
  useEffect(() => {
    if (activeTab !== 'voice') {
      conversationActiveRef.current = false
      setConversationActive(false)
      recognitionRef.current?.stop()
      window.speechSynthesis?.cancel()
      setListening(false)
      setIsSpeaking(false)
    }
  }, [activeTab])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      window.speechSynthesis?.cancel()
    }
  }, [])

  // ── Bilingual continuous listening engine ────────────────────────────────
  useEffect(() => {
    function startListening() {
      if (!SpeechRecognitionAPI || !conversationActiveRef.current) return
      if (isListeningRef.current) return

      const recognition          = new SpeechRecognitionAPI()
      recognition.continuous     = false
      recognition.interimResults = true
      // hi-IN handles both Hindi & English well in Chrome (2025)
      recognition.lang           = langRef.current === 'hi' ? 'hi-IN' : 'en-US'

      recognition.onstart = () => {
        isListeningRef.current = true
        setListening(true)
        setCurrentTranscript('')
        transcriptRef.current = ''
      }

      recognition.onresult = (event) => {
        // BARGE-IN: cancel AI speech the moment user starts talking
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel()
          setIsSpeaking(false)
        }
        let interim = '', final = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) final += t
          else interim += t
        }
        const current = final || interim
        transcriptRef.current = current
        setCurrentTranscript(current)
      }

      recognition.onend = async () => {
        isListeningRef.current = false
        setListening(false)
        const spoken = transcriptRef.current.trim()
        if (!spoken || !conversationActiveRef.current) return
        setCurrentTranscript('')

        // ── GREETING PHASE: parse language preference ─────────────────────
        if (phaseRef.current === 'greeting') {
          const wantsHindi =
            /hindi|हिंदी|हिन्दी/i.test(spoken) ||
            detectLang(spoken) === 'hi'
          const chosen = wantsHindi ? 'hi' : 'en'
          langRef.current = chosen
          phaseRef.current = 'chat'

          const ack = chosen === 'hi'
            ? 'बढ़िया! चलिए Hindi में बात करते हैं। Rishabh के बारे में कुछ भी पूछें!'
            : "Great! Let's talk in English. Ask me anything about Rishabh!"

          setIsSpeaking(true)
          speak(ack, chosen, () => {
            setIsSpeaking(false)
            if (conversationActiveRef.current && !isListeningRef.current) startListening()
          })
          return
        }

        // ── CHAT PHASE: auto-detect language per sentence ─────────────────
        const hindiChars = (spoken.match(/[\u0900-\u097F]/g) || []).length
        if (hindiChars > 2)                          langRef.current = 'hi'
        else if (hindiChars === 0 && spoken.length > 3) langRef.current = 'en'
        const activeLang = langRef.current

        setVoiceHistory(prev => [...prev, { type: 'user', text: spoken }])
        setVoiceLoading(true)

        try {
          const res = await fetch('/api/chat', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: spoken }],
              voice: true,
              lang: activeLang,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)

          setVoiceHistory(prev => [...prev, { type: 'assistant', text: data.reply }])
          setVoiceLoading(false)
          setIsSpeaking(true)
          startListening()   // barge-in ready while AI speaks

          speak(stripMarkdown(data.reply), activeLang, () => {
            setIsSpeaking(false)
            if (conversationActiveRef.current && !isListeningRef.current) startListening()
          })
        } catch {
          const err = activeLang === 'hi'
            ? 'माफ़ करें, कुछ गड़बड़ी हो गई। कृपया फिर से कोशिश करें।'
            : "Sorry, I couldn't process that. Please try again."
          setVoiceHistory(prev => [...prev, { type: 'assistant', text: err }])
          setVoiceLoading(false)
          speak(err, activeLang, () => {
            setIsSpeaking(false)
            if (conversationActiveRef.current && !isListeningRef.current) startListening()
          })
        }
      }

      recognition.onerror = (event) => {
        isListeningRef.current = false
        setListening(false)
        if (event.error === 'not-allowed') {
          setVoiceHistory(prev => [...prev, {
            type: 'assistant',
            text: 'Microphone access denied. Please allow mic access and try again.',
          }])
          conversationActiveRef.current = false
          setConversationActive(false)
        } else if (event.error !== 'aborted' && conversationActiveRef.current) {
          setTimeout(() => startListening(), 400)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    }

    startListeningRef.current = startListening
  }, [])

  // ── Toggle conversation ──────────────────────────────────────────────────
  const toggleConversation = useCallback(() => {
    if (conversationActive) {
      conversationActiveRef.current = false
      setConversationActive(false)
      recognitionRef.current?.stop()
      setListening(false)

      // Speak farewell if there was actual conversation, then clear history
      const farewellLang = langRef.current
      const hadConversation = voiceHistory.length > 0
      window.speechSynthesis?.cancel()

      phaseRef.current = 'greeting'
      langRef.current  = 'en'

      if (hadConversation) {
        const farewell = farewellLang === 'hi'
          ? 'बातचीत अच्छी लगी! आपका दिन शुभ हो!'
          : "It was great talking with you! Have a great day!"
        setIsSpeaking(true)
        speak(farewell, farewellLang, () => {
          setIsSpeaking(false)
          setVoiceHistory([])
          setCurrentTranscript('')
        })
      } else {
        setIsSpeaking(false)
      }
    } else {
      conversationActiveRef.current = true
      setConversationActive(true)
      phaseRef.current = 'greeting'
      langRef.current  = 'en'

      // Bilingual greeting — ask language preference (English only, consistent voice)
      setIsSpeaking(true)
      speak(
        "Hi! I'm Rishabh's AI assistant. Would you like to speak in English or Hindi?",
        'en',
        () => {
          setIsSpeaking(false)
          if (conversationActiveRef.current) startListeningRef.current?.()
        }
      )
    }
  }, [conversationActive, voiceHistory])

  // ── Chat: send message ───────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || loading) return

    const userMsg      = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMsg]

    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      }])
    } finally {
      setLoading(false)
    }
  }, [input, messages, loading])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // ── Clear chat ───────────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm Rishabh's AI assistant 👋 Ask me anything about his experience, skills, or projects!",
    }])
    setInput('')
  }, [])

  // ── Close chat with farewell ─────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (messages.length > 1) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "It was great chatting! Have a great day! 😊",
      }])
      setTimeout(() => setOpen(false), 1500)
    } else {
      setOpen(false)
    }
  }, [messages.length])

  // ── Orb state ────────────────────────────────────────────────────────────
  const orbState = voiceLoading ? 'loading'
    : isSpeaking          ? 'speaking'
    : listening           ? 'listening'
    : conversationActive  ? 'active'
    : 'idle'

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="chatbot-fab"
        onClick={() => open ? handleClose() : setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? 'Close assistant' : 'Open AI assistant'}
        title="Chat with Rishabh's AI Assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</motion.span>
          ) : (
            <motion.span key="chat"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >💬</motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="chatbot-panel"
            variants={panelVariants}
            initial="hidden" animate="visible" exit="exit"
            role="dialog" aria-label="AI Assistant Panel"
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-left">
                <div className="chatbot-avatar">🤖</div>
                <div>
                  <div className="chatbot-title">Rishabh's AI Assistant</div>
                  <div className="chatbot-subtitle">Ask me anything about Rishabh</div>
                </div>
              </div>
              <div className="chatbot-header-actions">
                {messages.length > 1 && activeTab === 'chat' && (
                  <button
                    className="chatbot-clear"
                    onClick={clearChat}
                    aria-label="Clear chat"
                    title="Clear chat"
                  >
                    🗑
                  </button>
                )}
                <button className="chatbot-close" onClick={handleClose} aria-label="Close">✕</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="chatbot-tabs">
              <button
                className={`chatbot-tab${activeTab === 'chat' ? ' chatbot-tab--active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >💬 Chat</button>
              <button
                className={`chatbot-tab${activeTab === 'voice' ? ' chatbot-tab--active' : ''}`}
                onClick={() => setActiveTab('voice')}
              >🎙 Voice</button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'chat' ? (
                <motion.div key="chat-tab" className="chatbot-tab-content"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}
                >
                  {/* Messages */}
                  <div className="chatbot-messages">
                    {messages.map((msg, i) => (
                      <div key={i} className={`chatbot-message chatbot-message--${msg.role}`}>
                        {msg.role === 'assistant' && <span className="chatbot-msg-avatar">🤖</span>}
                        <div className="chatbot-bubble">
                          {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="chatbot-message chatbot-message--assistant">
                        <span className="chatbot-msg-avatar">🤖</span>
                        <div className="chatbot-bubble chatbot-bubble--typing">
                          <span className="chatbot-dot" /><span className="chatbot-dot" /><span className="chatbot-dot" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {messages.length === 1 && (
                    <div className="chatbot-suggestions">
                      {SUGGESTIONS.map((s, i) => (
                        <button key={i} className="chatbot-suggestion-btn" onClick={() => sendMessage(s)}>{s}</button>
                      ))}
                      <a
                        className="chatbot-suggestion-btn chatbot-suggestion-btn--resume"
                        href="/Rishabh_Raj_Resume.docx"
                        download="Rishabh_Raj_Resume.docx"
                      >
                        ⬇ Download Rishabh's Resume
                      </a>
                    </div>
                  )}

                  <div className="chatbot-input-row">
                    <textarea
                      ref={inputRef}
                      className="chatbot-input"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about experience, skills, projects…"
                      rows={1}
                    />
                    <button className="chatbot-send" onClick={() => sendMessage()} disabled={!input.trim() || loading} aria-label="Send">➤</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="voice-tab" className="chatbot-tab-content chatbot-voice-tab"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
                >
                  {!SpeechRecognitionAPI ? (
                    <div className="chatbot-unsupported">
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚫</div>
                      <p>Voice input is not supported in your browser.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: 8, opacity: 0.7 }}>Please use Chrome or Edge for voice features.</p>
                    </div>
                  ) : (
                    <>
                      {/* Status */}
                      <div className="chatbot-voice-hint">
                        {orbState === 'loading'   ? '⏳ Processing your question…'  :
                         orbState === 'speaking'  ? '🔊 Speaking…'                 :
                         orbState === 'listening' ? '👂 Listening… speak now'       :
                         orbState === 'active'    ? '✅ Ready — listening soon…'    :
                                                    'Tap the orb to start talking'}
                      </div>

                      {/* ── Orb ── */}
                      <div className="ai-orb-wrapper">
                        <button
                          className={`ai-orb ai-orb--${orbState}`}
                          onClick={toggleConversation}
                          disabled={voiceLoading}
                          aria-label={conversationActive ? 'Stop conversation' : 'Start conversation'}
                          title={conversationActive ? 'Tap to stop' : 'Tap to start talking'}
                        >
                          <div className="ai-orb-glow" />
                          <div className="ai-orb-body">
                            {voiceLoading ? (
                              <span className="ai-orb-spinner" />
                            ) : (
                              <span className="ai-orb-status-icon">
                                {orbState === 'speaking' ? '🔊' : '🎙'}
                              </span>
                            )}
                          </div>
                        </button>

                        <span className={`ai-orb-status-text ai-orb-status-text--${orbState}`}>
                          {orbState === 'listening' ? 'Listening' :
                           orbState === 'speaking'  ? 'Bot speaking' :
                           orbState === 'loading'   ? 'Thinking…' :
                           orbState === 'active'    ? 'Ready' : 'Tap to talk'}
                        </span>
                      </div>

                      {/* Stop hint */}
                      {conversationActive && (
                        <p className="ai-orb-stop-hint">Tap orb to stop conversation</p>
                      )}

                      {/* Live transcript */}
                      {currentTranscript && (
                        <div className="chatbot-voice-current">
                          <span className="chatbot-voice-current-label">You</span>
                          "{currentTranscript}"
                        </div>
                      )}

                      {/* Voice history */}
                      {voiceHistory.length > 0 && (
                        <div className="chatbot-voice-history">
                          {voiceHistory.map((item, i) => (
                            <div key={i} className={`chatbot-voice-item chatbot-voice-item--${item.type}`}>
                              <span className="chatbot-voice-item-label">
                                {item.type === 'user' ? '🧑 You' : '🤖 AI'}
                              </span>
                              {item.type === 'assistant'
                                ? <div>{renderMarkdown(item.text)}</div>
                                : <p>{item.text}</p>}
                            </div>
                          ))}
                          {voiceLoading && (
                            <div className="chatbot-voice-item chatbot-voice-item--assistant">
                              <span className="chatbot-voice-item-label">🤖 AI</span>
                              <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                                <span className="chatbot-dot" /><span className="chatbot-dot" /><span className="chatbot-dot" />
                              </div>
                            </div>
                          )}
                          <div ref={voiceEndRef} />
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
