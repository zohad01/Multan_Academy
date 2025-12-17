import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.error || '';
      // If user is blocked, log them out
      if (errorMessage.includes('blocked') || errorMessage.includes('deactivated')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Show toast if available
        if (window.location.pathname !== '/login') {
          alert('Your account has been blocked. You have been logged out.');
        }
        window.location.href = '/login';
      } else if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

