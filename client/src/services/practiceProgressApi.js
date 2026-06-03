import api from '../lib/axios';

export const practiceProgressApi = {
    getProgress: async () => {
        const response = await api.get('/practice/progress');
        return response.data;
    }
};
