export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt ausente' });
  }

  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      return res.status(resposta.status).json({ error: data });
    }

    return res.status(200).json({ message: data.choices[0].message.content });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
