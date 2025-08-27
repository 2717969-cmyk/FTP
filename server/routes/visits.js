const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../utils');

// GET /api/visits — возвращает текущее количество
router.get('/', (req, res) => {
    let visits = readJSON('visits.json');
    if (!visits || typeof visits.count !== 'number') {
        visits = { count: 0 }; // инициализация, если пусто
    }
    res.json(visits);
});

// POST /api/visits — увеличивает счетчик на 1
router.post('/', (req, res) => {
    let visits = readJSON('visits.json') || { count: 0 };
    visits.count += 1;
    writeJSON('visits.json', visits);
    res.json(visits);
});

module.exports = router;