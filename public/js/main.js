
// Появление карточек и преимуществ при скролле
function showOnScroll(){
    const cards = document.querySelectorAll('.download-card');
    const advs = document.querySelector('.advantages');
    cards.forEach(c=>{
        const rect=c.getBoundingClientRect();
        if(rect.top<window.innerHeight-50) c.classList.add('show');
    });
    const rectA=advs.getBoundingClientRect();
    if(rectA.top<window.innerHeight-50) advs.classList.add('show');
}
window.addEventListener('scroll', showOnScroll);
window.addEventListener('load', showOnScroll);

// Счётчик скачиваний и скидки
// глобальная переменная счётчика — обязательно объявить ДО функций, которые её используют
let downloadCount = 0;
// Загрузка счётчика с сервера
async function fetchVisits() {
    try {
        const res = await fetch('/api/visits');
        const data = await res.json();
        downloadCount = data.count || 0;
        updatePrice();
    } catch (err) {
        console.error('Ошибка получения visits:', err);
    }
}

// Вызов при старте
document.addEventListener('DOMContentLoaded', fetchVisits);

const priceElem = document.getElementById('price');
const discountLabel = document.getElementById('discountLabel');
const remainingLabel = document.getElementById('remainingLabel');

// Функция для склонения слова в зависимости от числа
function getDownloadWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'скачиваний';
    }
    if (lastDigit === 1) {
        return 'скачивание';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'скачивания';
    }
    return 'скачиваний';
}

function updatePrice() {
    let price = 500;
    let discount = '';
    let remaining = '';

    if (downloadCount < 10) {
        price = Math.round(500 * 0.3);
        discount = '(Скидка 70% Цена без скидки: 500 рублей)';
        remaining = `Предложение ограничено: указанная скидка закончится через ${10 - downloadCount} ${getDownloadWord(10 - downloadCount)}`;
    } else if (downloadCount < 50) {
        price = Math.round(500 * 0.5);
        discount = '(Скидка 50% Цена без скидки: 500 рублей)';
        remaining = `Предложение ограничено: указанная скидка закончится через ${50 - downloadCount} ${getDownloadWord(50 - downloadCount)}`;
    }

    priceElem.textContent = price + ' ₽';
    discountLabel.textContent = discount;
    remainingLabel.textContent = remaining;
}

// После успешной оплаты создаём одноразовую ссылку
async function handlePurchase(filename) {
    try {
        const res = await fetch('/api/generate-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename })
        });
        const data = await res.json();

        if (data.url) {
            // Перенаправляем пользователя на скачивание
            window.location.href = data.url;
        } else {
            alert('Не удалось создать ссылку на скачивание');
        }
    } catch (err) {
        console.error('Ошибка генерации ссылки:', err);
        alert('Ошибка при подготовке скачивания');
    }
}

// Инициализация цены при загрузке страницы
updatePrice();

// Блок для оплаты

document.getElementById('buyBtnBottom').addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/payment/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.confirmationUrl) {
        // открываем в новой вкладке
        window.open(data.confirmationUrl, '_blank');

        // // добавим paymentId в success.html
        // const url = new URL(data.confirmationUrl);
        // url.searchParams.set('paymentId', data.paymentId);
        
      } else {
        alert('Ошибка при создании платежа');
      }
    } catch (err) {
      console.error('Ошибка при оплате:', err);
      alert('Ошибка при оплате');
    }
});

// Закрытие модалки
document.querySelectorAll('.close').forEach(c => {
    c.onclick = () => {
        c.parentElement.parentElement.style.display = 'none';
    };
});

// Модалки для скриншотов
document.querySelectorAll('.download-card img').forEach(img=>{
    img.addEventListener('click', ()=>{

        const card = img.closest('.download-card');
        if (card.classList.contains('no-modal')) return; // 🚫 пропускаем эти карточки

        const modal = document.getElementById('imgModal');
        const wrapper = document.getElementById('imgModalWrapper');
        wrapper.innerHTML = '';
        const parentSwiper = img.closest('.download-card').querySelectorAll('.swiper-slide img');
        parentSwiper.forEach(i=>{
            let div = document.createElement('div');
            div.className = 'swiper-slide';
            let im = document.createElement('img');
            im.src = i.src;
            div.appendChild(im);
            wrapper.appendChild(div);
        });
        modal.style.display = 'block';
        new Swiper('.imgSwiper', { navigation:{nextEl:'.swiper-button-next', prevEl:'.swiper-button-prev'} });
    });
});

// Обратная связь
document.getElementById('sendFeedback').addEventListener('click', () => {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
        document.getElementById('feedbackStatus').textContent = 'Пожалуйста, заполните все поля.';
        return;
    }

    // Проверка валидности email
    if (!isValidEmail(email)) {
        document.getElementById('feedbackStatus').textContent = 'Пожалуйста, введите корректный email адрес.';
        return;
    }

    fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('feedbackStatus').textContent = 'Сообщение отправлено! Спасибо!';
            document.getElementById('contactName').value = '';
            document.getElementById('contactEmail').value = '';
            document.getElementById('contactMessage').value = '';
        } else {
            document.getElementById('feedbackStatus').textContent = 'Ошибка при отправке.';
        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById('feedbackStatus').textContent = 'Ошибка при отправке.';
    });
});

function isValidEmail(email) {
    // Основная проверка регулярным выражением
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Дополнительные проверки
    if (!emailRegex.test(email)) return false;
    if (email.length > 254) return false; // Максимальная длина email
    if (email.indexOf('..') !== -1) return false; // Две точки подряд
    if (email.indexOf('.@') !== -1) return false; // Точка перед @
    
    // Проверка доменной части
    const parts = email.split('@');
    if (parts[0].length > 64) return false; // Локальная часть слишком длинная
    if (parts[1].length > 253) return false; // Домен слишком длинный
    
    return true;
}

// Закрытие модалок нажатием на ESC
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        document.querySelectorAll('.modal, .imgModal, .paymentModal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});


// Логика вкладок описания продукта
const tablinks = document.querySelectorAll('.tablink');
const tabcontents = document.querySelectorAll('.tabcontent');

tablinks.forEach(btn => {
  btn.addEventListener('click', () => {
    // Снять активность со всех вкладок
    tablinks.forEach(b => b.classList.remove('active'));
    tabcontents.forEach(tc => tc.style.display = 'none');
    // Активная вкладка
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).style.display = 'block';
  });
});

// --- Кастомные события для GA4 ---

// Отслеживание клика на карточки скачивания
document.querySelectorAll('.download-card img').forEach(img => {
    img.addEventListener('click', () => {
        if (typeof gtag === 'function') {
            gtag('event', 'download_file', {
                'event_category': 'downloads',
                'event_label': img.alt,
                'value': 1
            });
        }
    });
});

// Отслеживание отправки формы обратной связи
document.getElementById('sendFeedback').addEventListener('click', () => {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const msg = document.getElementById('contactMessage').value;

    if (name && email && msg) {
        if (typeof gtag === 'function') {
            gtag('event', 'send_feedback', {
                'event_category': 'form',
                'event_label': 'Обратная связь',
                'value': 1
            });
        }
    }
});

// Элемент контейнера для отзывов
const reviewsContainer = document.getElementById('reviewsContainer');
const noReviews = document.getElementById('noReviews');

// Функция для рендеринга списка отзывов
function renderReviews(reviewsData) {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = '';

    const reviews = reviewsData.items || []; // <-- вот важно

    if (reviews.length === 0) {
        document.getElementById('noReviews').style.display = 'block';
    } else {
        document.getElementById('noReviews').style.display = 'none';
    }

    reviews.forEach(r => {
        const div = document.createElement('div');
        div.className = 'review';
        div.innerHTML = `<strong>${r.name}</strong>: ${r.text}`;
        container.appendChild(div);
    });
}

// Загрузка отзывов с сервера при старте
fetch('/api/reviews')
    .then(res => res.json())
    .then(data => renderReviews(data))
    .catch(err => console.error('Ошибка загрузки отзывов:', err));

// Отправка нового отзыва
document.getElementById('addReview').addEventListener('click', () => {
    console.log('Кнопка нажата!'); // Добавьте эту строку
    const name = document.getElementById('reviewName').value.trim();
    const text = document.getElementById('reviewText').value.trim();
    if (!name || !text) return;

    fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) return console.error('Ошибка на сервере');

        // Берем текущие отзывы с сервера (GET), чтобы корректно рендерить с датами
        return fetch('/api/reviews')
            .then(res => res.json())
            .then(allReviews => renderReviews(allReviews));
    })
    .then(() => {
        // Очищаем форму
        document.getElementById('reviewName').value = '';
        document.getElementById('reviewText').value = '';
    })
    .catch(err => console.error('Ошибка отправки отзыва:', err));
});