// api-tts-example.js
// -----------------------------------------------------------------------
// Rota Express para converter texto em voz usando a ElevenLabs.
// Integra este ficheiro no teu servidor Express existente (o mesmo que
// já serve o /api/chat). NÃO coloques a chave da ElevenLabs no index.html.
//
// 1. Instala o dependency de fetch nativo já vem com Node 18+.
//    Se usares Node <18: npm install node-fetch
//
// 2. Define a variável de ambiente no servidor (nunca no código nem no git):
//      ELEVENLABS_API_KEY=a_tua_chave_sk_...
//      ELEVENLABS_VOICE_ID=id_da_voz_que_escolheste
//
//    IMPORTANTE: a chave sk_8fdddb311135c53d63ccc5570dd8f93d7a0cb956e0ed0d39
//    que partilhaste na conversa já foi vista por este chat — por segurança,
//    gera uma chave NOVA no painel da ElevenLabs (Profile > API Keys) e usa
//    essa, revogando a antiga.
//
// 3. Regista esta rota no teu app Express, por exemplo:
//      const ttsRouter = require('./api-tts-example');
//      app.use('/api/tts', ttsRouter);
//
// -----------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // "Rachel", multilingue

router.post('/', async (req, res) => {
  try {
    const { text, voiceId } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Campo "text" em falta.' });
    }
    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY não configurada no servidor.' });
    }

    const voice = voiceId || DEFAULT_VOICE_ID;

    const elResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elResponse.ok) {
      const errText = await elResponse.text().catch(() => '');
      console.error('ElevenLabs error:', elResponse.status, errText);
      return res.status(502).json({ error: 'Falha ao gerar áudio na ElevenLabs.' });
    }

    const audioBuffer = Buffer.from(await elResponse.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (err) {
    console.error('Erro /api/tts:', err);
    res.status(500).json({ error: 'Erro interno ao gerar voz.' });
  }
});

module.exports = router;
