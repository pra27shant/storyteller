import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const auth = {
  signup: (data) => api.post('/auth/signup', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  getProfile: () => api.get('/auth/profile').then((r) => r.data),
};

// Stories
export const stories = {
  getAll: (filters = {}) =>
    api.get('/stories', { params: filters }).then((r) => r.data),
  getById: (id) => api.get(`/stories/${id}`).then((r) => r.data),
  getGenres: () => api.get('/stories/genres').then((r) => r.data),
  create: (data) => api.post('/stories', data).then((r) => r.data),
  update: (id, data) => api.put(`/stories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/stories/${id}`).then((r) => r.data),
};

// Users / Preferences
export const users = {
  getPreferences: () => api.get('/users/preferences').then((r) => r.data),
  updatePreferences: (data) =>
    api.put('/users/preferences', data).then((r) => r.data),
  addHistory: (data) => api.post('/users/history', data).then((r) => r.data),
  getHistory: () => api.get('/users/history').then((r) => r.data),
  getRecommendations: () =>
    api.get('/users/recommendations').then((r) => r.data),
};

// Voice
export const voice = {
  processCommand: (data) =>
    api.post('/voice/command', data).then((r) => r.data),
  textToSpeech: (data) => api.post('/voice/tts', data).then((r) => r.data),
  speechToText: (data) => api.post('/voice/stt', data).then((r) => r.data),
};

export default api;
