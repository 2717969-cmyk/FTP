const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Путь к папке, где хранятся JSON
const jsonDir = path.join(__dirname, '..'); // обычно server/

// Список файлов, которые можно просматривать
const allowedFiles = ['payment.json', 'feedback.json', 'reviews.json', 'visits.json'];

router.get('/:file', (req, res) => {
  const { file } = req.params;

  if (!allowedFiles.includes(file)) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  const filePath = path.join(jsonDir, file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Файл не найден' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка чтения файла' });
  }
});

module.exports = router;