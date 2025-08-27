const express = require('express');
const router = express.Router();
const YooKassa = require('yookassa');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('./download'); // используем из download.js

const shopId = process.env.YOOKASSA_SHOP_ID || '1152688';
const secretKey = process.env.YOOKASSA_SECRET || 'test_secret_key';

const yooKassa = new YooKassa({ shopId, secretKey });

// Создание платежа
router.post('/create-payment', async (req, res) => {
  try {
    const payment = await yooKassa.createPayment({
      amount: { value: '300.00', currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: 'https://ftp-3piv.onrender.com/success.html' },
      capture: true,
      description: 'Оплата пакета файлов',
    }, uuidv4());

    res.json({ confirmationUrl: payment.confirmation.confirmation_url, paymentId: payment.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка создания платежа' });
  }
});

// Проверка платежа и генерация ссылки
router.get('/confirm', async (req, res) => {
  const { paymentId } = req.query;
  if (!paymentId) return res.status(400).json({ error: 'Нет paymentId' });

  try {
    const payment = await yooKassa.getPayment(paymentId);

    if (payment.status === 'succeeded') {
      const token = generateToken('test.pdf'); // ⚡ здесь укажи реальный файл
      return res.json({ downloadUrl: `/api/download/${token}` });
    } else {
      return res.json({ status: payment.status });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка проверки платежа' });
  }
});

module.exports = router;