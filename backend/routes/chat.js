const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const MODE_INSTRUCTIONS = {
  chill: 'Be super casual, relaxed, use their natural slang freely. Lowkey vibes only.',
  pro: 'Be more polished and professional but still keep their core personality. Structured but authentic.',
  angry: 'Be slightly annoyed, edgy, blunter than usual. A bit short-tempered but still sound like them.'
};

/**
 * POST /api/chat
 * Body: { personality, message, mode, history }
 */
router.post('/', async (req, res) => {
  const { personality, message, mode = 'chill', history = [] } = req.body;

  if (!personality || !message) {
    return res.status(400).json({ error: 'personality and message are required' });
  }

  const systemPrompt = buildSystemPrompt(personality, mode);

  // Build conversation history (last 10 turns for context)
  const messages = [
    ...history.slice(-10).map(h => ({
      role: h.role === 'ai' ? 'assistant' : 'user',
      content: h.content
    })),
    { role: 'user', content: message }
  ];

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages
    });

    const reply = response.content[0].text;
    res.json({ reply, usage: response.usage });
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(502).json({ error: 'AI service error: ' + err.message });
  }
});

/**
 * POST /api/chat/stream
 * Server-sent events for streaming responses
 */
router.post('/stream', async (req, res) => {
  const { personality, message, mode = 'chill', history = [] } = req.body;

  if (!personality || !message) {
    return res.status(400).json({ error: 'personality and message are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const systemPrompt = buildSystemPrompt(personality, mode);
  const messages = [
    ...history.slice(-10).map(h => ({
      role: h.role === 'ai' ? 'assistant' : 'user',
      content: h.content
    })),
    { role: 'user', content: message }
  ];

  try {
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ token: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

function buildSystemPrompt(personality, mode) {
  return `You are a personality clone of a real person. Mimic them EXACTLY.

PERSONALITY PROFILE:
- Name: ${personality.name}
- Tone: ${personality.tone}
- Core traits: ${personality.traits.join(', ')}
- Common words & slang they use: ${personality.commonWords.join(', ')}
- Typical sentence length: ${personality.avgSentenceLength}
- Personality summary: ${personality.personality || ''}

STYLE RULES:
1. Naturally weave in their slang: ${personality.commonWords.slice(0, 5).join(', ')}
2. Keep sentences ${personality.avgSentenceLength} (match their natural rhythm)
3. NEVER sound like a generic AI assistant
4. Show their personality traits: ${personality.traits.join(', ')}
5. Current mode modifier: ${MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.chill}

STRICT BEHAVIOR:
- Never say "As an AI", "I'm an AI", or break character under any circumstances
- Respond as if YOU ARE ${personality.name} and someone just texted you
- Be authentic — use their quirks, their humor, their way of seeing things
- Keep responses concise (2-4 sentences max) unless the question genuinely needs more
- If asked who you are: say you're ${personality.name}'s digital twin`;
}

module.exports = router;
