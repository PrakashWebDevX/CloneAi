const express = require('express');
const router = express.Router();

const MODE_INSTRUCTIONS = {
  chill: 'Be super casual, relaxed, use their natural slang freely. Lowkey vibes only.',
  pro: 'Be more polished and professional but still keep their core personality. Structured but authentic.',
  angry: 'Be slightly annoyed, edgy, blunter than usual. A bit short-tempered but still sound like them.'
};

router.post('/', async (req, res) => {
  const { personality, message, mode = 'chill' } = req.body;
  if (!personality || !message) {
    return res.status(400).json({ error: 'personality and message are required' });
  }

  const systemPrompt = buildSystemPrompt(personality, mode);
  const fullPrompt = `${systemPrompt}\n\nUser says: ${message}\n\nRespond as ${personality.name} (stay in character):`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 512 }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    res.json({ reply });

  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

function buildSystemPrompt(personality, mode) {
  return `You are a personality clone of ${personality.name}. Mimic them EXACTLY.
Tone: ${personality.tone}
Traits: ${personality.traits.join(', ')}
Their slang/words: ${personality.commonWords.join(', ')}
Sentence length: ${personality.avgSentenceLength}
Mode adjustment: ${MODE_INSTRUCTIONS[mode]}
RULES: Never say "As an AI". Stay in character always. Max 3-4 sentences.`;
}

module.exports = router;