const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

router.post('/', async (req, res) => {
  try {
    const { contents, system } = req.body || {};

    if (!Array.isArray(contents) || !contents.length) {
      return res.status(400).json({ error: { message: 'Campo "contents" em falta ou vazio.' } });
    }
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: { message: 'GEMINI_API_KEY não configurada no servidor.' } });
    }

    const body = { contents: contents };
    if (system && String(system).trim()) {
      body.systemInstruction = { parts: [{ text: String(system) }] };
    }

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini error:', geminiRes.status, data);
      return res.status(geminiRes.status).json(
        data && data.error ? data : { error: { message: 'Erro ao chamar a Gemini API.' } }
      );
    }

    res.json(data);
  } catch (err) {
    console.error('Erro /api/chat:', err);
    res.status(500).json({ error: { message: 'Erro interno no servidor.' } });
  }
});

module.exports = router;
