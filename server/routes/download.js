const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../utils');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Хранилище одноразовых токенов
let downloadTokens = {};

// Генерация токена для конкретного файла
function generateToken(filename) {
    const token = crypto.randomBytes(16).toString('hex');
    downloadTokens[token] = { filename, used: false };
    return token;
}

// POST /api/generate-download — создаём одноразовую ссылку после оплаты
router.post('/generate-download', (req, res) => {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'Не указан файл' });

    const token = generateToken(filename);
    res.json({ url: `/api/download/${token}` });
});

// GET /api/download/:token — скачивание файла
router.get('/:token', (req, res) => {
    const { token } = req.params;
    const record = downloadTokens[token];

    if (!record) return res.status(404).send('Ссылка недействительна');
    if (record.used) return res.status(410).send('Ссылка уже использована');

    const filePath = path.join(__dirname, '..', '..', 'public', 'downloads', record.filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('Файл не найден');

    // Пометка токена как использованного
    record.used = true;

    // Увеличиваем счётчик скачиваний
    let visits = readJSON('visits.json') || { count: 0 };
    visits.count = (visits.count || 0) + 1;
    writeJSON('visits.json', visits);

    res.download(filePath);
});

module.exports = { router, generateToken };
