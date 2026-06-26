import api from '../lib/axios';

export const adminDashboardApi = {
    getOverview: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    }
};
