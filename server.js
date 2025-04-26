// Imports
const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const JimpModule = require('jimp');
const Database = require('better-sqlite3');
const nodeFetch = require('node-fetch');

// Create Express application
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Set up database
const db = new Database('data.db');
db.prepare(`
  CREATE TABLE IF NOT EXISTS urls (
    code TEXT PRIMARY KEY,
    url  TEXT NOT NULL
  )
`).run();

const jimpRead = JimpModule.Jimp.read.bind(JimpModule.Jimp);

// Shorten URL endpoint
app.post('/shorten', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL é obrigatória.' });
  }

  let code;
  let exists = true;
  while (exists) {
    code = nanoid(7);
    exists = db.prepare('SELECT 1 FROM urls WHERE code = ?').get(code);
  }

  db.prepare('INSERT INTO urls (code, url) VALUES (?, ?)').run(code, url);
  const shortUrl = `${BASE_URL}/${code}`;
  return res.json({ shortUrl });
});

// QR code generation endpoint
app.get('/qrcode', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Parâmetro url é obrigatório.' });
  }
  try {
    const qrBuffer = await QRCode.toBuffer(url, { type: 'png' });
    res.set('Content-Type', 'image/png');
    return res.send(qrBuffer);
  } catch (err) {
    console.error('Erro ao gerar QR code:', err);
    return res.status(500).json({ error: 'Falha ao gerar QR code.' });
  }
});

// Frontend page
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'index.html'));
});

// Favicon endpoint
app.get('/favicon.ico', async (req, res) => {
  try {
    const iconUrl = 'https://img.icons8.com/ios-filled/512/webhook.png';
    const iconRes = await nodeFetch(iconUrl);
    if (!iconRes.ok) {
      throw new Error('Falha ao baixar o favicon');
    }
    const iconBuffer = await iconRes.arrayBuffer ? Buffer.from(await iconRes.arrayBuffer()) : await iconRes.buffer();
    res.set('Content-Type', 'image/png');
    return res.send(iconBuffer);
  } catch (err) {
    res.status(404).end();
  }
});

// URL redirect endpoint - must come after other specific routes
app.get('/:code', (req, res) => {
  const row = db.prepare('SELECT url FROM urls WHERE code = ?').get(req.params.code);
  if (row && row.url) return res.redirect(302, row.url);
  return res.status(404).send('URL não encontrada');
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando em ${BASE_URL}`);
});