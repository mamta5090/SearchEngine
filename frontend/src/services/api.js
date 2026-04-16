import axios from 'axios';

const API_BASE_URL = 'http://localhost:5020/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Axios v1 may use an AxiosHeaders instance; support both shapes.
      if (!config.headers) config.headers = {};
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for handling global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if mapping fails
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Or handle via React Context
    }
    return Promise.reject(error);
  }
);

export default api;
