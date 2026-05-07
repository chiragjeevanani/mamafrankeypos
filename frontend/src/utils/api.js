import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('admin_access');
    const posToken = localStorage.getItem('pos_access');
    const token = adminToken || posToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error (e.g., redirect to login or clear storage)
      console.error('Unauthorized access - potential token expiration');
      localStorage.removeItem('admin_access');
      localStorage.removeItem('pos_access');
      // Optional: window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
