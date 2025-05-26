
const express = require('express');
const session = require('express-session');
const axios = require('axios');
require('dotenv').config({ path: 'a.env' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: 'chave-segura',
  resave: false,
  saveUninitialized: false
}));

app.get('/', (req, res) => {
  res.send(\`
    <html>
      <head><title>Login com Discord</title></head>
      <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1>Bem-vindo!</h1>
        <a href="/login" style="padding: 10px 20px; background: purple; color: white; text-decoration: none; border-radius: 5px;">
          Entrar com Discord
        </a>
      </body>
    </html>
  \`);
});

app.get('/login', (req, res) => {
  const redirect = encodeURIComponent(process.env.REDIRECT_URI);
  const url = \`https://discord.com/api/oauth2/authorize?client_id=\${process.env.CLIENT_ID}&redirect_uri=\${redirect}&response_type=code&scope=identify guilds\`;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('Erro: código ausente.');

  try {
    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI,
      scope: 'identify guilds'
    });

    const { data: tokenData } = await axios.post('https://discord.com/api/oauth2/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const access_token = tokenData.access_token;

    const user = (await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: \`Bearer \${access_token}\` }
    })).data;

    const guilds = (await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: \`Bearer \${access_token}\` }
    })).data;

    req.session.user = user;
    req.session.guilds = guilds;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send('Erro ao autenticar.');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');

  const user = req.session.user;
  const guilds = req.session.guilds;

  res.send(\`
    <html>
      <head><title>Painel de \${user.username}</title></head>
      <body style="font-family: sans-serif; padding: 20px;">
        <h1>Olá, \${user.username}!</h1>
        <img src="https://cdn.discordapp.com/avatars/\${user.id}/\${user.avatar}.png" width="80" style="border-radius: 50%;">
        <h2>Seus servidores:</h2>
        <ul>
          \${guilds.map(g => \`<li>\${g.name}</li>\`).join('')}
        </ul>
        <a href="/">Sair</a>
      </body>
    </html>
  \`);
});

app.listen(PORT, () => {
  console.log(\`Servidor rodando em http://localhost:\${PORT}\`);
});
