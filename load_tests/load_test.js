import http from 'k6/http'; 
import { check } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 100 }, // Разогрев: 100 пользователей за 30 секунд
        { duration: '2m', target: 500 }, // Основная нагрузка: 500 пользователей
        { duration: '1m', target: 1000 }, // Пик нагрузки: 1000 пользователей
        { duration: '1m', target: 0 },    // Охлаждение
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% запросов должны быть выполнены быстрее 500 мс
        http_req_failed: ['rate<0.01'],   // Ошибки не должны превышать 1% от общего числа запросов
    },
};

export default function () {
    // Генерация уникальной почты для каждого запроса
    let uniqueEmail = `testuser${__VU}-${__ITER}@example${__VU}.com`;

    let payload = JSON.stringify({
        username: `testuser${__VU}`,
        email: uniqueEmail,
        password: 'password123',
    });

    let headers = { 'Content-Type': 'application/json' };

    let res = http.post('http://127.0.0.1/verify-email', payload, { headers: headers });

    // Проверка успешного выполнения
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });
}
