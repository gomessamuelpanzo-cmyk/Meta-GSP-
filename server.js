// server.js
// -----------------------------------------------------------------------
// Servidor principal da app "Meta GSP".
// Serve o index.html (pasta /public) e as rotas /api/chat e /api/tts.
//
// Variáveis de ambiente necessárias (define-as no painel do Render, em
// Environment, NUNCA num ficheiro commitado no git):
//
//   GEMINI_API_KEY        -> chave AIzaSy... do Google AI Studio
//   GEMINI_MODEL          -> opcional, por omissão "gemini-2.0-flash"
//   ELEVENLABS_API_KEY    -> chave sk_... da ElevenLabs (opcional, só se
//                            quiseres a voz natural nas chamadas)
//   ELEVENLABS_VOICE_ID   -> opcional, id da voz escolhida na ElevenLabs
// -----------------------------------------------------------------------

const express = require('express');
const path = require('path');

const chatRouter = require('./api-chat');
const ttsRouter = require('./api-tts');

const app = express();

app.use(express.json({ limit: '15mb' })); // suporta imagens em base64 no chat

// Ficheiros estáticos (index.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/chat', chatRouter);
app.use('/api/tts', ttsRouter);

// Fallback: qualquer rota desconhecida devolve o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Meta GSP a correr na porta ${PORT}`);
});
