const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

/**
 * POST /api/analyze
 * Body: { text }
 * Returns structured personality JSON profile
 */
router.post('/', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Need at least 50 characters of sample text' });
  }

  const truncated = text.slice(0, 8000); // Cap at 8k chars for API efficiency

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analyze this person's writing style thoroughly and return ONLY a valid JSON object with no markdown fences, no explanation, nothing else.

WRITING SAMPLE:
${truncated}

Return exactly this JSON schema:
{
  "tone": "one of: casual | professional | sarcastic | formal | chaotic | chill | intense | warm | dry",
  "traits": ["array of 4-6 specific personality trait words observed in the writing"],
  "commonWords": ["array of 10-15 frequently used words, phrases, or slang found in the text"],
  "avgSentenceLength": "one of: short | medium | long | mixed",
  "punctuationStyle": "one of: minimal | heavy | emoji-heavy | formal | erratic",
  "capitalizationStyle": "one of: lowercase | normal | SHOUTING | mixed",
  "personality": "2-3 sentence vivid description of this person's communication vibe and personality",
  "sampleResponse": "write 1-2 sentences exactly how this person would respond to 'how was your day?'"
}`
      }]
    });

    let raw = response.content[0].text.trim();
    // Strip any accidental markdown fences
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const profile = JSON.parse(raw);

    // Validate required fields
    const required = ['tone', 'traits', 'commonWords', 'avgSentenceLength', 'personality'];
    for (const field of required) {
      if (!profile[field]) throw new Error(`Missing field: ${field}`);
    }

    res.json({ profile });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'Failed to parse AI response. Try again.' });
    }
    console.error('Analyze error:', err.message);
    res.status(502).json({ error: 'Analysis failed: ' + err.message });
  }
});

module.exports = router;
