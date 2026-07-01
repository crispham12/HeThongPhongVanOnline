import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// GET template sections
export const useTemplateSections = (templateId) => {
  return useQuery({
    queryKey: ['template-sections', templateId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/cv-templates/${templateId}/sections`, getHeaders());
      return data;
    },
    enabled: !!templateId,
  });
};

// POST add section
export const useAddSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, sectionType }) => {
      const { data } = await api.post(
        `/admin/cv-templates/${templateId}/sections`,
        { sectionType },
        getHeaders()
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template-sections', variables.templateId] });
    },
  });
};

// PUT update section
export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, sectionId, updates }) => {
      const { data } = await api.put(
        `/admin/cv-templates/${templateId}/sections/${sectionId}`,
        updates,
        getHeaders()
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template-sections', variables.templateId] });
    },
  });
};

// PUT update container
export const useUpdateContainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, containerId, updates }) => {
      const { data } = await api.put(
        `/admin/cv-templates/${templateId}/containers/${containerId}`,
        updates,
        getHeaders()
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template-sections', variables.templateId] });
    },
  });
};

// DELETE section
export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, sectionId }) => {
      const { data } = await api.delete(
        `/admin/cv-templates/${templateId}/sections/${sectionId}`,
        getHeaders()
      );
      return data;
    },
    onMutate: async ({ templateId, sectionId }) => {
      await queryClient.cancelQueries({ queryKey: ['template-sections', templateId] });
      const previousData = queryClient.getQueryData(['template-sections', templateId]);

      if (previousData) {
        queryClient.setQueryData(['template-sections', templateId], {
          ...previousData,
          sections: previousData.sections.filter(s => s.id !== sectionId)
        });
      }
      return { previousData, templateId };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['template-sections', context.templateId], context.previousData);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template-sections', variables.templateId] });
    },
  });
};

// POST restore section
export const useRestoreSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, sectionId }) => {
      const { data } = await api.post(
        `/admin/cv-templates/${templateId}/sections/${sectionId}/restore`,
        {},
        getHeaders()
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template-sections', variables.templateId] });
    },
  });
};

// PUT reorder sections
export const useReorderSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, sections }) => {
      // sections is array of { sectionId, orderIndex }
      const { data } = await api.put(
        `/admin/cv-templates/${templateId}/sections/reorder`,
        { sections },
        getHeaders()
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Update cache directly with server response
      queryClient.setQueryData(['template-sections', variables.templateId], old => {
        if (!old) return old;
        return {
          ...old,
          sections: data
        };
      });
    },
  });
};

// POST validate template
export const useValidateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId }) => {
      const { data } = await api.post(
        `/admin/cv-templates/${templateId}/validate`,
        {},
        getHeaders()
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Optionally manually update the cache for validation, or invalidate
      queryClient.invalidateQueries({ queryKey: ['template-sections', variables.templateId] });
    },
  });
};
