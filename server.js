const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const OPENAI_API_KEY = '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';

app.post('/api/chat', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ error: 'Prompt é obrigatório' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const data = await response.json();
    const resposta = data.choices[0].message.content;
    res.json({ resposta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
