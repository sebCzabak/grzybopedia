import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
});

// === INTERCEPTOR ZAPYTANIA ===
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// === INTERCEPTOR ODPOWIEDZI ===
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Błąd 401 - Token nieważny lub wygasł. Wylogowywanie.");
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;