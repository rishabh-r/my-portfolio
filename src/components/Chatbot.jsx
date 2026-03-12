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

// ─── Speak helper ─────────────────────────────────────────────────────────
function speak(text) {
  if (!speechSynthesisAvailable) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 1.05
  utter.pitch = 1
  utter.lang = 'en-US'
  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')
    )
    if (preferred) utter.voice = preferred
    window.speechSynthesis.speak(utter)
  }
  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak()
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true })
  }
}

// ─── Panel animation variants ─────────────────────────────────────────────
const panelVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 320, damping: 26 } },
  exit:    { opacity: 0, y: 16, scale: 0.96, transition: { duration: 0.18 } },
}

// ─── Suggested questions ──────────────────────────────────────────────────
const SUGGESTIONS = [
  'What is Rishabh\'s current role?',
  'What AI skills does he have?',
  'Tell me about his projects',
  'Is he open to new opportunities?',
]

// ─── Main Component ───────────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen]           = useState(false)
  const [activeTab, setActiveTab] = useState('chat')

  // Chat state
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Rishabh's AI assistant 👋 Ask me anything about his experience, skills, or projects!",
    },
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)

  // Voice state
  const [listening, setListening]       = useState(false)
  const [transcript, setTranscript]     = useState('')
  const [voiceResponse, setVoiceResponse] = useState('')
  const [voiceLoading, setVoiceLoading] = useState(false)

  const messagesEndRef  = useRef(null)
  const inputRef        = useRef(null)
  const recognitionRef  = useRef(null)
  const transcriptRef   = useRef('')   // avoids stale closure in onend

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when chat tab opens
  useEffect(() => {
    if (open && activeTab === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open, activeTab])

  // Stop mic if user switches tabs
  useEffect(() => {
    if (activeTab !== 'voice' && listening) {
      recognitionRef.current?.stop()
      setListening(false)
    }
  }, [activeTab])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      window.speechSynthesis?.cancel()
    }
  }, [])

  // ── Chat: send message ──────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || loading) return

    const userMsg    = { role: 'user', content: trimmed }
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
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, messages, loading])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Voice: toggle mic ───────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!SpeechRecognitionAPI) return

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous      = false
    recognition.interimResults  = true
    recognition.lang            = 'en-US'

    recognition.onstart = () => {
      setListening(true)
      setTranscript('')
      setVoiceResponse('')
      transcriptRef.current = ''
    }

    recognition.onresult = (event) => {
      let interim = '', final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      const current = final || interim
      transcriptRef.current = current
      setTranscript(current)
    }

    recognition.onend = async () => {
      setListening(false)
      const spoken = transcriptRef.current
      if (!spoken.trim()) return

      setVoiceLoading(true)
      try {
        const res = await fetch('/api/chat', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: spoken.trim() }],
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setVoiceResponse(data.reply)
        speak(data.reply)
      } catch {
        const errMsg = "Sorry, I couldn't process that. Please try again."
        setVoiceResponse(errMsg)
        speak(errMsg)
      } finally {
        setVoiceLoading(false)
      }
    }

    recognition.onerror = (event) => {
      setListening(false)
      if (event.error === 'not-allowed') {
        setTranscript('Microphone access denied. Please allow mic access and try again.')
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [listening])

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="chatbot-fab"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? 'Close assistant' : 'Open AI assistant'}
        title="Chat with Rishabh's AI Assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              💬
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="chatbot-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-label="AI Assistant Panel"
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
              <button
                className="chatbot-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="chatbot-tabs">
              <button
                className={`chatbot-tab${activeTab === 'chat' ? ' chatbot-tab--active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                💬 Chat
              </button>
              <button
                className={`chatbot-tab${activeTab === 'voice' ? ' chatbot-tab--active' : ''}`}
                onClick={() => setActiveTab('voice')}
              >
                🎤 Voice
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'chat' ? (
                <motion.div
                  key="chat-tab"
                  className="chatbot-tab-content"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Messages */}
                  <div className="chatbot-messages">
                    {messages.map((msg, i) => (
                      <div key={i} className={`chatbot-message chatbot-message--${msg.role}`}>
                        {msg.role === 'assistant' && (
                          <span className="chatbot-msg-avatar">🤖</span>
                        )}
                        <div className="chatbot-bubble">
                          {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="chatbot-message chatbot-message--assistant">
                        <span className="chatbot-msg-avatar">🤖</span>
                        <div className="chatbot-bubble chatbot-bubble--typing">
                          <span className="chatbot-dot" />
                          <span className="chatbot-dot" />
                          <span className="chatbot-dot" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Suggestions (only shown when just the greeting is there) */}
                  {messages.length === 1 && (
                    <div className="chatbot-suggestions">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          className="chatbot-suggestion-btn"
                          onClick={() => sendMessage(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="chatbot-input-row">
                    <textarea
                      ref={inputRef}
                      className="chatbot-input"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about experience, skills, projects…"
                      rows={1}
                      disabled={loading}
                    />
                    <button
                      className="chatbot-send"
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || loading}
                      aria-label="Send"
                    >
                      ➤
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="voice-tab"
                  className="chatbot-tab-content chatbot-voice-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {!SpeechRecognitionAPI ? (
                    <div className="chatbot-unsupported">
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚫</div>
                      <p>Voice input is not supported in your browser.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: 8, opacity: 0.7 }}>
                        Please use Chrome or Edge for voice features.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="chatbot-voice-hint">
                        {voiceLoading
                          ? 'Getting response…'
                          : listening
                          ? 'Listening… speak now'
                          : 'Tap the mic and ask a question'}
                      </div>

                      <motion.button
                        className={`chatbot-mic-btn${listening ? ' chatbot-mic-btn--active' : ''}`}
                        onClick={toggleMic}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.92 }}
                        disabled={voiceLoading}
                        aria-label={listening ? 'Stop listening' : 'Start voice input'}
                      >
                        {voiceLoading ? (
                          <span className="chatbot-mic-spinner" />
                        ) : (
                          <span style={{ fontSize: '2rem', lineHeight: 1 }}>
                            {listening ? '⏹' : '🎤'}
                          </span>
                        )}
                        {listening && <span className="chatbot-pulse-ring" />}
                      </motion.button>

                      {transcript && (
                        <div className="chatbot-voice-block chatbot-voice-transcript">
                          <div className="chatbot-voice-block-label">You said</div>
                          <p>{transcript}</p>
                        </div>
                      )}

                      {voiceResponse && (
                        <div className="chatbot-voice-block chatbot-voice-response">
                          <div className="chatbot-voice-block-label">Response</div>
                          <p>{voiceResponse}</p>
                          <button
                            className="chatbot-replay-btn"
                            onClick={() => speak(voiceResponse)}
                            title="Play again"
                          >
                            🔊 Play again
                          </button>
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
