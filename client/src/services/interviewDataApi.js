import api from '../lib/axios';

export const interviewDataApi = {
    getOverview: async () => {
        const response = await api.get('/admin/interview-data/overview');
        return response.data;
    },

    getSessions: async (params = {}) => {
        const response = await api.get('/admin/interview-data', { params });
        return response.data;
    },

    getReportData: async () => {
        const response = await api.get('/admin/interview-data/report');
        return response.data;
    },

    getSessionDetail: async (sessionId) => {
        const response = await api.get(`/admin/interview-data/${sessionId}`);
        return response.data;
    },

    getAttempts: async (sessionId) => {
        const response = await api.get(`/admin/interview-data/${sessionId}/attempts`);
        return response.data;
    },

    getAttemptDetail: async (attemptId) => {
        const response = await api.get(`/admin/interview-data/attempt/${attemptId}`);
        return response.data;
    },

    getAttemptQuestions: async (attemptId) => {
        const response = await api.get(`/admin/interview-data/attempt/${attemptId}/questions`);
        return response.data;
    }
};
