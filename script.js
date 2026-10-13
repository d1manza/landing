document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('repairForm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const carInput = document.getElementById('car');
    const honeyInput = document.getElementById('honey');

    // Элементы капчи
    const captchaLabel = document.getElementById('captchaLabel');
    const captchaInput = document.getElementById('captchaInput');
    let captchaAnswer = 0;

    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('formStatus');

    // !!! ВСТАВЬ СЮДА СВОЮ ССЫЛКУ ИЗ GOOGLE APPS SCRIPT !!!
    const SCRIPT_URL = 'ТВОЙ_URL_ИЗ_GOOGLE_APPS_SCRIPT';

    // ==========================================
    // 1. ГЕНЕРАЦИЯ КАПЧИ
    // ==========================================
    function generateCaptcha() {
        // Генерируем два числа от 1 до 10
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = num1 + num2;
        captchaLabel.textContent = `Антиспам: ${num1} + ${num2} = ?`;
        captchaInput.value = ''; // очищаем поле
    }

    // Запускаем капчу при загрузке страницы
    generateCaptcha();

    // ==========================================
    // 2. УДОБНАЯ И ПЛАВНАЯ МАСКА ТЕЛЕФОНА
    // ==========================================
    phoneInput.addEventListener('input', function(e) {
        let inputNumbersValue = this.value.replace(/\D/g, '');
        let formattedInputValue = '';

        if (!inputNumbersValue) {
            return this.value = '';
        }

        if (['7', '8', '9'].indexOf(inputNumbersValue[0]) > -1) {
            if (inputNumbersValue[0] === '9') inputNumbersValue = '7' + inputNumbersValue;

            let firstSymbols = '+7';
            formattedInputValue = firstSymbols + ' ';

            if (inputNumbersValue.length > 1) {
                formattedInputValue += '(' + inputNumbersValue.substring(1, 4);
            }
            if (inputNumbersValue.length >= 5) {
                formattedInputValue += ') ' + inputNumbersValue.substring(4, 7);
            }
            if (inputNumbersValue.length >= 8) {
                formattedInputValue += '-' + inputNumbersValue.substring(7, 9);
            }
            if (inputNumbersValue.length >= 10) {
                formattedInputValue += '-' + inputNumbersValue.substring(9, 11);
            }
        } else {
            formattedInputValue = '+' + inputNumbersValue.substring(0, 16);
        }

        this.value = formattedInputValue;
        hideError(this);
    });

    phoneInput.addEventListener('blur', function() {
        if (this.value === '+7 ') {
            this.value = '';
        }
    });

    // ==========================================
    // СНЯТИЕ ОШИБОК ПРИ ВВОДЕ
    // ==========================================
    nameInput.addEventListener('input', () => hideError(nameInput));
    carInput.addEventListener('input', () => hideError(carInput));
    captchaInput.addEventListener('input', () => hideError(captchaInput));

    function showError(input, errorId) {
        input.classList.add('invalid');
        document.getElementById(errorId).style.display = 'block';
    }

    function hideError(input) {
        input.classList.remove('invalid');
        const errorMsg = input.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-text')) {
            errorMsg.style.display = 'none';
        }
    }

    // ==========================================
    // 3. ОТПРАВКА ОСНОВНОЙ ФОРМЫ (И ВАЛИДАЦИЯ)
    // ==========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
        let isValid = true;

        // Имя
        const nameVal = nameInput.value.trim();
        if (nameVal.length < 2) {
            showError(nameInput, 'nameError');
            isValid = false;
        }

        // Телефон
        const rawPhone = phoneInput.value.replace(/\D/g, '');
        if (rawPhone.length !== 11 || !rawPhone.startsWith('79')) {
            showError(phoneInput, 'phoneError');
            isValid = false;
        }

        // Автомобиль
        const carVal = carInput.value.trim();
        if (carVal.length < 2) {
            showError(carInput, 'carError');
            isValid = false;
        }

        // Капча
        const userCaptchaAnswer = parseInt(captchaInput.value.trim(), 10);
        if (userCaptchaAnswer !== captchaAnswer) {
            showError(captchaInput, 'captchaError');
            isValid = false;
            // Обновляем пример, если пользователь ошибся
            generateCaptcha();
        }

        // Honeypot (невидимое поле от ботов)
        if (honeyInput.value) {
            console.warn('Spam bot blocked');
            return;
        }

        if (!isValid) return;

        if (SCRIPT_URL === 'ТВОЙ_URL_ИЗ_GOOGLE_APPS_SCRIPT') {
            statusMessage.textContent = 'Ошибка: не настроен URL скрипта Google!';
            statusMessage.classList.add('error');
            return;
        }

        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            const formData = new FormData(form);

            // Фикс для Google Таблиц: убираем плюс перед отправкой
            let currentPhone = formData.get('phone') || '';
            if (currentPhone.startsWith('+')) {
                formData.set('phone', currentPhone.substring(1)); // отправляем "7 (983) ..."
            }

            // Удаляем капчу из данных, которые полетят в Гугл Таблицу (она там не нужна)
            formData.delete('captcha');

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                statusMessage.textContent = 'ЗАЯВКА ОТПРАВЛЕНА. МЫ СКОРО СВЯЖЕМСЯ С ВАМИ.';
                statusMessage.classList.add('success');
                form.reset();
                generateCaptcha(); // Генерируем новую капчу после успешной отправки
            } else {
                throw new Error('Network Error');
            }
        } catch (error) {
            statusMessage.textContent = 'Ошибка при отправке. Позвоните нам: 8 (923) 333-04-10.';
            statusMessage.classList.add('error');
            console.error('Submit Error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
});