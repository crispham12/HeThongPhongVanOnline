import api from '../lib/axios';

export const quotaApi = {
  // Lấy trạng thái quota hiện tại của user đang đăng nhập
  getQuotaStatus: () => api.get('/interview/quota'),
};
