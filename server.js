// Meta GSP — backend
// Esconde a chave da API do Gemini do lado do cliente (browser).
// Requer Node.js 18+ (usa fetch nativo).

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

if (!API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY não definida. Copie .env.example para .env e coloque a sua chave.');
}

// Chat principal (texto e modo chamada de voz usam este mesmo endpoint)
app.post('/api/chat', async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    const { contents, system } = req.body;
    if (!Array.isArray(contents)) return res.status(400).json({ error: 'Campo "contents" é obrigatório.' });

    const r = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': API_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system || '' }] },
        contents,
        generationConfig: { maxOutputTokens: 1000, temperature: 0.9 }
      })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Tradução de mensagens
app.post('/api/translate', async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
    const { text, label } = req.body;
    if (!text || !label) return res.status(400).json({ error: 'Campos "text" e "label" são obrigatórios.' });

    const r = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Traduza para ' + label + '. Apenas a traducao:\n\n' + text }] }],
        generationConfig: { maxOutputTokens: 400 }
      })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Meta GSP a correr em http://localhost:${PORT}`);
});
