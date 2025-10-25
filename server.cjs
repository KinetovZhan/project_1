// server.js — без express, без cors, без npm install
const http = require('http');
const url = require('url');

const dvsVersions = [
  { id: 123, date: "2025-03-10", type: "Maj", description: "Исправлена ошибка датчика давления" },
  { id: 124, date: "2025-04-01", type: "Min", description: "Оптимизация расхода топлива" }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Разрешаем CORS вручную
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (parsedUrl.pathname === '/api/dvs' && req.method === 'GET') {
    res.end(JSON.stringify(dvsVersions, null, 2));
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(5000, () => {
  console.log('✅ Сервер запущен: http://localhost:5000/api/dvs');
});