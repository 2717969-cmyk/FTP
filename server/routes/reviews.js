const express = require('express');
const router = express.Router();
const { readJSON, writeJSON, getFilePath } = require('../utils'); // убедись, что getFilePath экспортирован

// GET /api/reviews
router.get('/', (req, res) => {
    let reviews = readJSON('reviews.json');
    if (!Array.isArray(reviews.items)) {
        reviews = { items: [] };
    }
    res.json(reviews);
});

// POST /api/reviews
router.post('/', (req, res) => {
    const { name, text } = req.body;
    console.log('Получен POST-запрос:', { name, text }); // <-- Логируем входящие данные

    if (!name || !text) {
        return res.status(400).json({ error: 'Имя и текст обязательны' });
    }

    let reviews = readJSON('reviews.json');
    console.log('Прочитаны текущие отзывы:', reviews); // <-- Логируем, что прочиталось
    if (!Array.isArray(reviews.items)) reviews.items = [];

    const newReview = { name, text, date: new Date().toISOString() };
    reviews.items.push(newReview);
    console.log('Добавлен новый отзыв. Общий массив:', reviews); // <-- Логируем обновленный массив

    const filePath = getFilePath('reviews.json');
    console.log('Пытаюсь записать в файл по пути:', filePath); // <-- Это самый важный лог!

    writeJSON('reviews.json', reviews);
    console.log('Запись в файл завершена (предположительно)');
    res.json({ success: true, review: newReview });
});

module.exports = router;

