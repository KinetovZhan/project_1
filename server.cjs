// server.cjs — полный обновлённый код с новым эндпоинтом

const http = require('http');
const url = require('url');
const fs = require('fs');

const dvsVersions = [
  { id: 123, date: "2025-03-10", type: "Maj", description: "Исправлена ошибка датчика давления" },
  { id: 124, date: "2025-04-01", type: "Min", description: "Оптимизация расхода топлива" }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // CORS для всех запросов
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Эндпоинт: получить список версий
  if (path === '/api/dvs' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(dvsVersions, null, 2));
  }

  // 🔹 НОВОЕ: эндпоинт для скачивания
  else if (path.startsWith('/api/download/') && req.method === 'GET') {
    const id = path.split('/').pop(); // получаем ID из URL

    // Проверяем, существует ли такая версия
    const version = dvsVersions.find(v => v.id == id);
    if (!version) {
      res.statusCode = 404;
      res.end('Версия не найдена');
      return;
    }

    // Создаём "файл" — например, текстовый
    const fileContent = `Прошивка ДВС №${id}\nТип: ${version.type}\nДата: ${version.date}\nОписание: ${version.description}\n\nЭто тестовый файл прошивки.`;

    // Заголовки для скачивания
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="dvs_${id}.txt"`);

    res.end(fileContent);
  }

  // 404 для всего остального
  else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(5000, () => {
  console.log('✅ Сервер запущен: http://localhost:5000/api/dvs');
});