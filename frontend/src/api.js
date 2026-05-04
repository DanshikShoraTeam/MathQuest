import axios from 'axios';

/** Базовый URL бэкенда Django REST API. */
const API_URL = 'http://127.0.0.1:8000/api/';

/**
 * Axios-экземпляр с предустановленным базовым URL и заголовком Content-Type.
 * Используется во всех компонентах для запросов к API.
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Интерцептор запроса: автоматически добавляет JWT access-токен из localStorage
 * в заголовок Authorization перед каждым запросом.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Интерцептор ответа: если сервер вернул 401 (токен истёк), пытается обновить
 * access-токен через refresh-токен. Если обновление не удалось — очищает localStorage
 * и перенаправляет на страницу логина.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}token/refresh/`, {
                        refresh: refreshToken,
                    });
                    localStorage.setItem('access_token', response.data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh-токен тоже истёк — принудительный выход
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
