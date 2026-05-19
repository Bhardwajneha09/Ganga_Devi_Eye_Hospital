import axios from 'axios';

const PRODUCTION_API_BASE_URL = 'https://ganga-devi-eye-hospital-2.onrender.com';

function getApiBaseURL() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5055';
  }

  return PRODUCTION_API_BASE_URL;
}

const api = axios.create({
  baseURL: getApiBaseURL(),
});

export function setAdminToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
