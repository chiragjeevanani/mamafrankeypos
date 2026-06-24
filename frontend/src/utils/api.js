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

    if (window.location.pathname.startsWith('/admin')) {
      config.headers['X-Module'] = 'admin';
    } else {
      config.headers['X-Module'] = 'pos';
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
      // Check if it's a login or PIN check/cancellation request to prevent logging out
      const isLoginOrPinRequest = error.config && error.config.url && (
        error.config.url.endsWith('/login') ||
        error.config.url.includes('/login') ||
        error.config.url.includes('/verify-manager') ||
        error.config.url.includes('/cancel')
      );

      if (!isLoginOrPinRequest) {
        console.error('Unauthorized access - potential token expiration');
        localStorage.removeItem('admin_access');
        localStorage.removeItem('pos_access');
        localStorage.removeItem('user_info');
        
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin')) {
          if (currentPath !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        } else {
          if (currentPath !== '/pos/login' && currentPath !== '/pos') {
            window.location.href = '/pos/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
