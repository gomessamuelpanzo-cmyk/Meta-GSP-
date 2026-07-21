// api-chat-example.js
// -----------------------------------------------------------------------
// Rota Express que serve /api/chat, fazendo de ponte segura entre o
// index.html (browser) e a Gemini API da Google. A chave fica só aqui
// no servidor — nunca no index.html.
//
// 1. Define a variável de ambiente no teu servidor (nunca no código nem no git):
//      GEMINI_API_KEY=AIzaSy...a_tua_chave
//      GEMINI_MODEL=gemini-2.0-flash   (opcional, tem um valor por omissão)
//
// 2. Regista esta rota no teu app Express, por exemplo:
//      const chatRouter = require('./api-chat-example');
//      app.use('/api/chat', chatRouter);
//
// O index.html já envia o corpo no formato certo:
//   { contents: [{ role: 'user'|'model', parts: [{ text }, { inline_data }] }],
//     system: "texto do prompt de sistema" }
// e esta rota devolve a resposta da Gemini tal como ela vem (que já é
// exatamente o formato { candidates: [...] } que o index.html espera).
// -----------------------------------------------------------------------

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
