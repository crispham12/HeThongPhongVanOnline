import api from '../lib/axios';

export const adminPaymentsApi = {
    getOverview: async () => {
        const response = await api.get('/admin/payments/overview');
        return response.data;
    },
    // Backend: GET /api/admin/payments?status=&search=&page=&pageSize=
    getTransactions: async (params = {}) => {
    // Map frontend params to backend params
    const statusMap = { 'Success': 'Completed', 'Failed': 'Failed', 'Pending': 'Pending', 'Expired': 'Expired' };
    const backendParams = {
        page: params.page,
        pageSize: params.pageSize,
        status: params.status ? (statusMap[params.status] || params.status) : undefined,
        search: params.search,
    };
        const response = await api.get('/admin/payments', { params: backendParams });
        console.log("AdminPayments API response:", response.data);
        const data = response.data;
        // Normalize response to match what frontend expects
        const items = (data.items || []).map(o => ({
            id: o.id,
            paymentCode: o.orderCode,
            sePayTransactionId: o.orderCode,
            userName: o.user?.fullName || o.user?.email || 'N/A',
            userEmail: o.user?.email || '',
            userId: o.user?.id || '',
            packageName: o.planType || '',
            credits: o.planType === 'Yearly' ? 365 : 30,
            amount: o.amount || 0,
            status: normalizeStatus(o.status),
            createdAt: o.createdAt,
            paidAt: o.paidAt || null,
            bankCode: '',
            bankAccountNumber: '',
            transferContent: '',
            paymentMethod: 'SePay',
        }));
        return {
            items,
            total: data.total || 0,
            page: data.page || 1,
            pageSize: data.pageSize || 10,
        };
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

// Map backend status to frontend status
function normalizeStatus(status) {
    if (!status) return 'Pending';
    if (status === 'Completed') return 'Success';
    if (status === 'Failed' || status === 'WrongAmount') return 'Failed';
    if (status === 'Expired') return 'Expired';
    return 'Pending';
}
