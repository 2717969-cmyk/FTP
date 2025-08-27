const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Подключение маршрутов
const visitsRoute = require('./routes/visits');
app.use('/api/visits', visitsRoute);

const reviewsRoute = require('./routes/reviews');
app.use('/api/reviews', reviewsRoute);

const feedbackRoute = require('./routes/feedback');
app.use('/api/feedback', feedbackRoute);

// const downloadRoute = require('./routes/download');
// app.use('/api/download', downloadRoute);

const { router: downloadRoute } = require('./routes/download');
app.use('/api/download', downloadRoute);

const paymentRoute = require('./routes/payment');
app.use('/api/payment', paymentRoute);

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});