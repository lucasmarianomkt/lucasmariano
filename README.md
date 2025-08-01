
# Chatbot com OpenAI (Node.js)

Este projeto é um servidor simples com Express.js para responder mensagens usando a API da OpenAI.

## Como usar

1. Crie um arquivo `.env` com sua chave da OpenAI:

```
OPENAI_API_KEY=sua-chave-aqui
```

2. Instale as dependências:

```
npm install
```

3. Rode o servidor:

```
npm start
```

4. Faça POST para `/webhook` com:

```json
{
  "message": "Olá, tudo bem?"
}
```

O chatbot vai responder com o retorno do GPT-4.

---

Ideal para conectar com WhatsApp API ou front-end personalizado.
