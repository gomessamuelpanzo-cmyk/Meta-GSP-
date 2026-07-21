const express = require('express');
const path = require('path');

const chatRouter = require('./api-chat');
const ttsRouter = require('./api-tts');

const app = express();

app.use(express.json({ limit: '15mb' }));

app.use(express.static(__dirname));

app.use('/api/chat', chatRouter);
app.use('/api/tts', ttsRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Meta GSP a correr na porta ${PORT}`);
});
