const clientId = '1358987708579709042';
const redirectUri = 'https://www.f5llw.shop/';
const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEwOTg3NDUzODQ4NDg4NTkyNTgiLCJrZXkiOiJhYzRmYTIzZGVjZGFkMjE3ODZlNzY3ZjNiYTk0In0.MPy6WoCQRlts4bHoVRLYyb8gqw9m6eRu3CuQFv7u_JY';

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const dashboard = document.getElementById('dashboard');
const botList = document.getElementById('botList');

loginBtn.addEventListener('click', () => {
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
  window.location.href = authUrl;
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  location.reload();
});

window.addEventListener('load', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    dashboard.style.display = 'block';
    loginBtn.style.display = 'none';
    fetchBots(user.token);
  } else {
    dashboard.style.display = 'none';
    loginBtn.style.display = 'block';
  }
});

async function fetchBots(token) {
  try {
    const response = await fetch('https://api.discloud.app/v1/bots', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Token': token
      }
    });
    const data = await response.json();
    if (data.success) {
      data.bots.forEach(bot => {
        const botElement = document.createElement('div');
        botElement.textContent = `Bot ID: ${bot.id} | Status: ${bot.status}`;
        botList.appendChild(botElement);
      });
    } else {
      alert('Erro ao buscar bots');
    }
  } catch (error) {
    console.error('Erro ao buscar bots:', error);
  }
}
