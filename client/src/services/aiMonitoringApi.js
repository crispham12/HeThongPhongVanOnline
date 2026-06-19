import api from '../lib/axios';

export const aiMonitoringApi = {
    getOverview: async (range = '24h') => {
        const response = await api.get('/admin/ai-monitoring/overview', { params: { range } });
        return response.data;
    },

    getTokenUsage: async (range = '24h') => {
        const response = await api.get('/admin/ai-monitoring/token-usage', { params: { range } });
        return response.data;
    },

    getFeatureUsage: async (range = '24h') => {
        const response = await api.get('/admin/ai-monitoring/feature-usage', { params: { range } });
        return response.data;
    },

    getSystemStatus: async () => {
        const response = await api.get('/admin/ai-monitoring/system-status');
        return response.data;
    },

    getRecentLogs: async (page = 1, pageSize = 10) => {
        const response = await api.get('/admin/ai-monitoring/recent-logs', { params: { page, pageSize } });
        return response.data;
    },

    getErrors: async (page = 1, pageSize = 10) => {
        const response = await api.get('/admin/ai-monitoring/errors', { params: { page, pageSize } });
        return response.data;
    }
};
