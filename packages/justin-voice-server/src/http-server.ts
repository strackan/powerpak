/**
 * HTTP REST API wrapper for Justin's Voice
 * Allows web/mobile/API access (not just MCP clients)
 */

import express from 'express'
import cors from 'cors'
import { VoiceEngine } from './engine/voice-engine.js'
import templates from './templates/templates.json' assert { type: 'json' }
import blends from './templates/blends.json' assert { type: 'json' }
import rules from './templates/rules.json' assert { type: 'json' }

const app = express()
app.use(cors())
app.use(express.json())

const voiceEngine = new VoiceEngine()

// ============================================================================
// GET /templates - List all templates
// ============================================================================
app.get('/api/templates', (req, res) => {
  res.json({
    beginnings: templates.beginnings,
    middles: templates.middles,
    endings: templates.endings,
    flavors: templates.flavors,
    transitions: templates.transitions
  })
})

// ============================================================================
// GET /templates/:category - Get templates by category
// ============================================================================
app.get('/api/templates/:category', (req, res) => {
  const { category } = req.params
  const categoryData = templates[category as keyof typeof templates]

  if (!categoryData) {
    return res.status(404).json({ error: `Category '${category}' not found` })
  }

  res.json(categoryData)
})

// ============================================================================
// GET /blends - List all blend recipes
// ============================================================================
app.get('/api/blends', (req, res) => {
  res.json(blends)
})

// ============================================================================
// GET /blends/:name - Get specific blend
// ============================================================================
app.get('/api/blends/:name', (req, res) => {
  const blend = blends.find(b =>
    b.name.toLowerCase() === req.params.name.toLowerCase()
  )

  if (!blend) {
    return res.status(404).json({ error: `Blend '${req.params.name}' not found` })
  }

  res.json(blend)
})

// ============================================================================
// GET /rules - Get writing rules
// ============================================================================
app.get('/api/rules', (req, res) => {
  res.json(rules)
})

// ============================================================================
// POST /generate - Generate content in Justin's voice
// ============================================================================
app.post('/api/generate', async (req, res) => {
  try {
    const { blendName, templateIds, topic, context } = req.body

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' })
    }

    const result = await voiceEngine.generate({
      blendName,
      templateIds,
      topic,
      context
    })

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ============================================================================
// POST /analyze - Analyze text for voice score
// ============================================================================
app.post('/api/analyze', (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const result = voiceEngine.analyzeVoice(text)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ============================================================================
// POST /suggest - Get suggestions to improve voice match
// ============================================================================
app.post('/api/suggest', (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const suggestions = voiceEngine.getSuggestions(text)
    res.json({ suggestions })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ============================================================================
// Health check
// ============================================================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'justin-voice-api' })
})

// ============================================================================
// Start server
// ============================================================================
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🎤 Justin's Voice API running on http://localhost:${PORT}`)
  console.log(`📚 API docs: http://localhost:${PORT}/api`)
})

export default app
