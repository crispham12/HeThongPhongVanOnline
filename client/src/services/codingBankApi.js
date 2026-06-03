import api from '../lib/axios';

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
        const response = await api.post(`/admin/coding-problems/${id}/unpublish`);
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
