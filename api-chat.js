const express = require('express');
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

router.post('/', async (req, res) => {
  try {
    const { contents, system } = req.body || {};

    if (!Array.isArray(contents) || !contents.length) {
      return res.status(400).json({ error: { message: 'Campo "contents" em falta ou vazio.' } });
    }
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: { message: 'GROQ_API_KEY não configurada no servidor.' } });
    }

    const messages = [];
    if (system && String(system).trim()) {
      messages.push({ role: 'system', content: String(system) });
    }
    for (const turn of contents) {
      const role = turn.role === 'model' ? 'assistant' : 'user';
      const text = (turn.parts || [])
        .map((p) => (p && typeof p.text === 'string' ? p.text : ''))
        .filter(Boolean)
        .join('\n');
      if (text) messages.push({ role, content: text });
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      console.error('Groq error:', groqRes.status, data);
      return res.status(groqRes.status).json({
        error: { message: (data && data.error && data.error.message) || 'Erro ao chamar a Groq API.' },
      });
    }

    const replyText =
      (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';

    res.json({
      candidates: [{ content: { parts: [{ text: replyText }] } }],
    });
  } catch (err) {
    console.error('Erro /api/chat:', err);
    res.status(500).json({ error: { message: 'Erro interno no servidor.' } });
  }
});

module.exports = router;
