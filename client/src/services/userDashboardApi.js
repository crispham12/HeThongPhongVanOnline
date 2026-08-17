import api from '../lib/axios';

export const userDashboardApi = {
  getStats: () => api.get('/user-dashboard/stats'),
};
