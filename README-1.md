# Meta GSP — Assistente de IA com Chamada por Voz

Reconstrução do Meta GSP em duas partes:

1. **Backend (Node/Express)** — esconde a chave da API do Gemini, que antes estava exposta no HTML.
2. **Modo Chamada** — novo botão 📞 na topbar abre uma "ligação" real por voz: fala, o assistente ouve (reconhecimento de voz do navegador), pensa (chama o Gemini através do backend) e responde falando (síntese de voz), reiniciando a escuta automaticamente, como uma chamada telefónica.

## Como correr

```bash
cd meta-gsp
npm install
cp .env.example .env
# edite o .env e coloque a sua GEMINI_API_KEY
npm start
```

Depois abra **http://localhost:3000** no navegador (recomendado: Google Chrome, que tem o melhor suporte a reconhecimento de voz).

## O que mudou em relação ao original

- ❌ Removida a chave da API `AQ.Ab8RN6Lq...` que estava visível no código-fonte do HTML (em 3 pontos: chat, tradução e resumo).
- ✅ Toda comunicação com o Gemini agora passa pelo backend (`/api/chat` e `/api/translate`), que injeta a chave a partir de uma variável de ambiente no servidor — nunca chega ao browser.
- ✅ Novo botão de chamada (📞) na barra superior: conversa por voz em tempo real (ouve → pensa → fala → volta a ouvir).
- ✅ Envio de fotos passou a funcionar de verdade: a imagem é convertida para base64 e enviada como visão ao Gemini (antes só era anexada como nome de ficheiro, sem análise real).
- ✅ Três novas ferramentas de IA de imagem no menu (☰): reconhecimento de objetos/cenários, análise de sentimentos/emoções, e descrição de imagem para acessibilidade (esta última lê a resposta em voz alta automaticamente).
- ✅ Ecrã de Configurações (⚙️ no menu): tema, escolha de voz, idioma (usado tanto na síntese de voz como no reconhecimento do modo Chamada), velocidade da voz, e permissão do microfone com botão de teste.

## Limitações a saber

- O reconhecimento de voz (`SpeechRecognition`) é uma API do navegador — funciona bem no Chrome/Edge desktop e Android; no Safari/iOS o suporte é limitado.
- A latência da "chamada" depende da resposta da API do Gemini (não é um streaming bidirecional de áudio tipo WhatsApp/Telegram — é um ciclo ouvir → pensar → falar → ouvir, mas com transição automática, dando a sensação de conversa contínua).
- Se quiser uma experiência de voz totalmente bidirecional e com interrupções em tempo real (como a Live API do Gemini), é um upgrade maior: requer WebSockets e streaming de áudio PCM no backend. Posso construir isso a seguir, se fizer sentido para o seu caso de uso.
