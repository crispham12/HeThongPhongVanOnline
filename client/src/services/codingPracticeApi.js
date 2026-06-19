import api from '../lib/axios';

export const codingPracticeApi = {
  getProblems: async (params) => {
    const response = await api.get('/practice/coding-problems', { params });
    return response.data;
  },

  getProblemById: async (id) => {
    const response = await api.get(`/practice/coding-problems/${id}`);
    return response.data;
  },

  runCode: async (id, payload) => {
    const response = await api.post(`/practice/coding-problems/${id}/run`, payload);
    return response.data;
  },

  submitCode: async (id, payload) => {
    const response = await api.post(`/practice/coding-problems/${id}/submit`, payload);
    return response.data;
  },

  getProgress: async () => {
    const response = await api.get('/practice/coding-progress');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/practice/coding-history');
    return response.data;
  },

  getProblemHistory: async (id) => {
    const response = await api.get(`/practice/coding-problems/${id}/history`);
    return response.data;
  }
};
