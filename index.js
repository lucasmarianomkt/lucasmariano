require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // Token para validação webhook

// Endpoint para validar webhook do Facebook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado com sucesso!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Endpoint para receber mensagens do WhatsApp (POST)
app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;

    // Verifica se tem mensagem no webhook do WhatsApp
    if (
      data.entry &&
      data.entry[0].changes &&
      data.entry[0].changes[0].value.messages &&
      data.entry[0].changes[0].value.messages[0]
    ) {
      const message = data.entry[0].changes[0].value.messages[0];
      const from = message.from; // número do cliente
      const text = message.text.body; // texto da mensagem

      console.log(`Mensagem recebida de ${from}: ${text}`);

      // Chama OpenAI para responder
      const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Você é um vendedor atencioso e prestativo.' },
          { role: 'user', content: text },
        ],
      });

      const reply = completion.data.choices[0].message.content;

      // Envia resposta pelo WhatsApp Cloud API
      await axios.post(
        `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          type: 'text',
          text: { body: reply },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`Resposta enviada para ${from}: ${reply}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Erro no webhook:', error.response?.data || error.message);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => {
  res.send('Servidor do Chatbot rodando 🚀');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

