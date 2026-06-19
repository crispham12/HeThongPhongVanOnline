import api from '../lib/axios';
import axios from 'axios';

// ══════════════════════════════════════════════════
// AI Service base URL (FastAPI Python)
// ══════════════════════════════════════════════════
const AI_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

// ══════════════════════════════════════════════════
// ADMIN: Coding Problems
// ══════════════════════════════════════════════════

export const adminCodingBankApi = {
    getAll: async (params) => {
        const response = await api.get('/admin/coding-problems', { params });
        return response.data;
    },
    
    getById: async (id) => {
        const response = await api.get(`/admin/coding-problems/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/admin/coding-problems', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/admin/coding-problems/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/admin/coding-problems/${id}`);
        return response.data;
    },

    publish: async (id) => {
        const response = await api.post(`/admin/coding-problems/${id}/publish`);
        return response.data;
    },

    unpublish: async (id) => {
        const response = await api.post(`/admin/coding-problems/${id}/draft`);
        return response.data;
    },

    // ── AI Generation (calls Python FastAPI directly) ──
    generateWithAi: async (prompt) => {
        const response = await axios.post(`${AI_BASE_URL}/ai/coding/generate-problem`, { prompt });
        return response.data;
    }
};

// ══════════════════════════════════════════════════
// CLIENT: Practice Coding
// ══════════════════════════════════════════════════

export const practiceCodingApi = {
    getAll: async (params) => {
        const response = await api.get('/practice/coding-problems', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/practice/coding-problems/${id}`);
        return response.data;
    },

    submitCode: async (id, language, code) => {
        const response = await api.post(`/practice/coding-problems/${id}/submit`, { language, code });
        return response.data;
    }
};
