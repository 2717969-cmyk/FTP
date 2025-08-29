const express = require('express');
const router = express.Router();
const YooKassa = require('yookassa');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('./download'); // используем из download.js
const { readJSON, writeJSON } = require('../utils'); // ⚡ подключаем

const shopId = process.env.YOOKASSA_SHOP_ID || '1152688';
const secretKey = process.env.YOOKASSA_SECRET || 'test_vXhN6nzVtqVxM4xlqEWPNoi4cK5wQ8Ol3NgFW3ZFrE4';

const yooKassa = new YooKassa({ shopId, secretKey });

// 🛠 тут будем хранить "последнюю ссылку на скачивание"
let lastDownloadUrl = null;

// ------------------- СОЗДАНИЕ ПЛАТЕЖА -------------------
router.post('/create-payment', async (req, res) => {
  try {
    const payment = await yooKassa.createPayment({
      amount: { value: '300.00', currency: 'RUB' },
      confirmation: {
        type: 'redirect',
        return_url: `https://ftp-3piv.onrender.com/success.html`
      },
      capture: true,
      description: 'Оплата пакета файлов',
    }, uuidv4());

    res.json({ 
      confirmationUrl: payment.confirmation.confirmation_url,
      paymentId: payment.id // 👈 теперь возвращаем
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка создания платежа' });
  }
});

// ------------------- ПРОВЕРКА СТАТУСА -------------------
router.get('/status', async (req, res) => {
  try {
    const { paymentId } = req.query;
    if (!paymentId) {
      return res.status(400).json({ error: 'Нет paymentId' });
    }

    const payment = await yooKassa.getPayment(paymentId);

    res.json({ status: payment.status }); // pending / waiting_for_capture / succeeded / canceled
  } catch (error) {
    console.error('Ошибка при проверке статуса платежа:', error);
    res.status(500).json({ error: 'Ошибка проверки платежа' });
  }
});

// ------------------- WEBHOOK -------------------
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const event = req.body;

    if (event.event === 'payment.succeeded') {
      console.log('✅ Оплата прошла:', event.object.id);

      // генерируем одноразовую ссылку
      const token = generateToken('pack.zip'); // ⚡ твой файл
      lastDownloadUrl = `/api/download/${token}`;

      // Логирование в payments.json
      let payments = readJSON('payments.json') || [];
      payments.push({
        id: event.object.id,
        amount: event.object.amount.value,
        currency: event.object.amount.currency,
        status: event.object.status,
        created_at: new Date().toISOString(),
        description: event.object.description,
        downloadUrl: lastDownloadUrl
      });
      writeJSON('payments.json', payments);

      console.log(`💾 Платёж ${event.object.id} записан в payments.json`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Ошибка в webhook:', err);
    res.sendStatus(500);
  }
});

// ------------------- ВЫДАЧА ССЫЛКИ -------------------
router.get('/last-download', (req, res) => {
  if (lastDownloadUrl) {
    res.json({ downloadUrl: lastDownloadUrl });
    // lastDownloadUrl = null; // можешь вернуть если нужно одноразово
  } else {
    res.json({ status: 'wait' });
  }
});

module.exports = router;