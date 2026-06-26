import api from '../lib/axios';

export const adminPaymentsApi = {
    getOverview: async () => {
        const response = await api.get('/admin/payments/overview');
        return response.data;
    },
    getTransactions: async (params = {}) => {
        // params: status, userId, dateFrom, dateTo, page, pageSize
        const response = await api.get('/admin/payments/transactions', { params });
        return response.data;
    },
    getPackages: async () => {
        const response = await api.get('/admin/payments/packages');
        return response.data;
    },
    createPackage: async (packageData) => {
        const response = await api.post('/admin/payments/packages', packageData);
        return response.data;
    },
    updatePackage: async (id, packageData) => {
        const response = await api.put(`/admin/payments/packages/${id}`, packageData);
        return response.data;
    },
    togglePackageActive: async (id) => {
        const response = await api.patch(`/admin/payments/packages/${id}/toggle-active`);
        return response.data;
    }
};
