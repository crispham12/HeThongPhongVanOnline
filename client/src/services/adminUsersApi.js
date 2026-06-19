import api from '../lib/axios';

export const adminUsersApi = {
    getUserOverview: async () => {
        const response = await api.get('/admin/users/overview');
        return response.data;
    },

    getUsers: async (params = {}) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    getUserDetail: async (id) => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },

    createUser: async (payload) => {
        const response = await api.post('/admin/users', payload);
        return response.data;
    },

    updateUser: async (id, payload) => {
        const response = await api.put(`/admin/users/${id}`, payload);
        return response.data;
    },

    lockUser: async (id, reason) => {
        const response = await api.post(`/admin/users/${id}/lock`, { reason });
        return response.data;
    },

    unlockUser: async (id) => {
        const response = await api.post(`/admin/users/${id}/unlock`);
        return response.data;
    },

    resetDailyLimit: async (id) => {
        const response = await api.post(`/admin/users/${id}/reset-daily-limit`);
        return response.data;
    },

    exportUsersPdf: async (params = {}) => {
        const response = await api.get('/admin/users/export-pdf', { params });
        return response.data;
    }
};
