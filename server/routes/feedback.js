const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../utils');

// GET /api/feedback — вернуть все сообщения (по желанию)
router.get('/', (req, res) => {
    const feedback = readJSON('feedback.json');
    res.json(feedback.items || []);
});

// POST /api/feedback — добавить новое сообщение
router.post('/', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    let feedback = readJSON('feedback.json');
    if (!Array.isArray(feedback.items)) feedback.items = [];

    feedback.items.push({ name, email, message, date: new Date().toISOString() });
    writeJSON('feedback.json', feedback);

    res.json({ success: true });
});

module.exports = router;