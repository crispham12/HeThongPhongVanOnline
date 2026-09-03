import api from '../lib/axios';

// ══════════════════════════════════════════════════
// ADMIN: Question Bank
// ══════════════════════════════════════════════════

export const adminQuestionBankApi = {
    getAll: async (params) => {
        const response = await api.get('/admin/questions', { params });
        return response.data;
    },
    
    getById: async (id) => {
        const response = await api.get(`/admin/questions/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/admin/questions', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/admin/questions/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/admin/questions/${id}`);
        return response.data;
    },

    publish: async (id) => {
        const response = await api.post(`/admin/questions/${id}/publish`);
        return response.data;
    },

    unpublish: async (id) => {
        const response = await api.post(`/admin/questions/${id}/unpublish`);
        return response.data;
    }
};

// ══════════════════════════════════════════════════
// CLIENT: Practice Questions
// ══════════════════════════════════════════════════

export const practiceQuestionApi = {
    getAll: async (params) => {
        const response = await api.get('/practice/questions', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/practice/questions/${id}`);
        return response.data;
    },

    submitAnswer: async (id, answer) => {
        const response = await api.post(`/practice/questions/${id}/submit`, { answer });
        return response.data;
    },

    transcribeAudio: async (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        
        // Gọi thẳng tới ai-service backend (mặc định port 8000)
        // Vì client chạy trên axios instance hướng tới C# backend, ta dùng fetch hoặc truyền full URL.
        const response = await fetch('http://localhost:8000/ai/voice/transcribe', {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            let errorMsg = 'Lỗi khi chuyển đổi giọng nói thành văn bản';
            try {
                const errorData = await response.json();
                if (errorData.detail) errorMsg = errorData.detail;
            } catch (e) {}
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        return data.text;
    }
};
