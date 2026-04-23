const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: 'Need at least 50 characters' });
  }

  const prompt = `Analyze this person's writing style. Return ONLY a valid JSON object, no markdown, no explanation.

TEXT:
${text.slice(0, 8000)}

Return exactly this JSON:
{
  "tone": "one of: casual|professional|sarcastic|formal|chaotic|chill|intense",
  "traits": ["4-6 personality trait words"],
  "commonWords": ["10-15 frequently used words or slang from the text"],
  "avgSentenceLength": "one of: short|medium|long|mixed",
  "punctuationStyle": "one of: minimal|heavy|emoji-heavy|formal|erratic",
  "capitalizationStyle": "one of: lowercase|normal|SHOUTING|mixed",
  "personality": "2-3 sentence description of this person's vibe",
  "sampleResponse": "1-2 sentences exactly how this person would say: how was your day?"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    raw = raw.replace(/```json|```/g, '').trim();
    const profile = JSON.parse(raw);
    res.json({ profile });

  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;