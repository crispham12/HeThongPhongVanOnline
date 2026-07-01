import { useState } from 'react';
import api from '../../lib/axios';

const useComponentsApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getToken = () => localStorage.getItem('token');
    const getHeaders = () => ({
        headers: { Authorization: `Bearer ${getToken()}` },
    });

    const request = async (method, url, data = null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api({
                method,
                url,
                data,
                ...getHeaders()
            });
            return response.data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getComponentLibrary = async (templateId, sectionId = null) => {
        let url = `/admin/cv-templates/${templateId}/component-library`;
        if (sectionId) {
            url += `?sectionId=${sectionId}`;
        }
        return await request('GET', url);
    };

    const getComponentsBySection = async (templateId, sectionId) => {
        return await request('GET', `/admin/cv-templates/${templateId}/sections/${sectionId}/components`);
    };

    const addComponent = async (templateId, sectionId, componentData) => {
        return await request('POST', `/admin/cv-templates/${templateId}/sections/${sectionId}/components`, componentData);
    };

    const updateComponent = async (templateId, sectionId, componentId, componentData) => {
        return await request('PUT', `/admin/cv-templates/${templateId}/sections/${sectionId}/components/${componentId}`, componentData);
    };

    const deleteComponent = async (templateId, sectionId, componentId) => {
        return await request('DELETE', `/admin/cv-templates/${templateId}/sections/${sectionId}/components/${componentId}`);
    };

    const reorderComponents = async (templateId, sectionId, items) => {
        return await request('PUT', `/admin/cv-templates/${templateId}/sections/${sectionId}/components/reorder`, items);
    };

    return {
        loading,
        error,
        getComponentLibrary,
        getComponentsBySection,
        addComponent,
        updateComponent,
        deleteComponent,
        reorderComponents
    };
};

export default useComponentsApi;
