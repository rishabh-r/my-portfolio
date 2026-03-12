// api/speak.js — ElevenLabs TTS serverless function (ES Module)

// ── Voice config ──────────────────────────────────────────────────────────
// English: "Sarah" — warm, casual, conversational female (sounds very human)
// Hindi:   "Aria"  — multilingual model handles Hindi naturally
const EN_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL' // Sarah
const HI_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL' // Sarah via multilingual_v2 (handles Hindi well)

// eleven_multilingual_v2 = most human, best naturalness, supports Hindi
// eleven_turbo_v2_5      = faster but slightly less natural (English only)
const EN_MODEL = 'eleven_multilingual_v2'
const HI_MODEL = 'eleven_multilingual_v2'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text, lang } = req.body
  if (!text) return res.status(400).json({ error: 'text required' })

  const voiceId = lang === 'hi' ? HI_VOICE_ID : EN_VOICE_ID
  const modelId = lang === 'hi' ? HI_MODEL    : EN_MODEL

  try {
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method:  'POST',
        headers: {
          'Accept':       'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key':   process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            // High similarity keeps voice consistent
            // Lower stability = more expressive, human variation
            stability:        0.35,
            similarity_boost: 0.85,
            style:            0.45,   // adds expressiveness & natural intonation
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!elRes.ok) {
      const errText = await elRes.text()
      console.error('ElevenLabs API error:', elRes.status, errText)
      return res.status(502).json({ error: 'TTS service error' })
    }

    const buffer = await elRes.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return res.status(200).json({ audio: base64 })
  } catch (err) {
    console.error('ElevenLabs fetch error:', err)
    return res.status(500).json({ error: 'TTS unavailable' })
  }
}
