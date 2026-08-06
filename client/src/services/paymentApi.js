import api from '../lib/axios';

export const paymentApi = {
  createOrder:  (planType) => api.post('/payments/create-order', { planType }),
  getStatus:    (orderCode) => api.get(`/payments/status/${orderCode}`),
  getPackages:  () => api.get('/payments/packages'),
};
