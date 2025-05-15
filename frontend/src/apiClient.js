// apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor do dodawania tokenu (jeśli istnieje)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Obsługi błędów (np. 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Błąd 401 - sesja wygasła lub nieautoryzowany dostęp.');
      localStorage.removeItem('access_token'); // Usuwa token
      window.location.href = '/login';         // Przekierowuje na strone logowania
    }
    return Promise.reject(error); // Przekaże dalej błąd
  }
);

export default apiClient;
