import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import useTemplateEditorStore from '../../store/useTemplateEditorStore';

// Layout Components
import TopNavigationBar from './template-editor/TopNavigationBar';
import LeftSidebar from './template-editor/LeftSidebar';
import PropertiesPanel from './template-editor/PropertiesPanel';
import CanvasArea from './template-editor/CanvasArea';

export default function AdminTemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialComponents, setInitialComponents] = useState([]);
  
  const { 
    setTemplate, 
    setComponents, 
    setSaving, 
    template 
  } = useTemplateEditorStore();

  useEffect(() => {
    fetchTemplateDetails();
    // Cleanup on unmount
    return () => {
      setTemplate(null);
      setComponents([]);
    };
  }, [id]);

  const fetchTemplateDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get(`/admin/cv-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplate(data);
      const comps = data.components || [];
      setComponents(comps);
      setInitialComponents(comps);
    } catch (err) {
      console.error(err);
      alert('Không thể tải thông tin mẫu CV.');
      navigate('/admin/templates');
    }
  };

  const handleSaveAll = async () => {
    if (!template) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // 1. Save Template Details
      await api.put(`/admin/cv-templates/${id}`, {
        name: template.name,
        description: template.description,
        width: template.width,
        height: template.height,
        backgroundColor: template.backgroundColor,
        thumbnailUrl: template.thumbnailUrl,
        isPublished: template.isPublished
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Sync Components (Smart Diff)
      const currentComps = useTemplateEditorStore.getState().components;
      
      // Detect newly added (no GUID, length < 15 usually)
      const newComps = currentComps.filter(c => c.id.length < 15);
      // Detect updated (has GUID, exists in current)
      const updatedComps = currentComps.filter(c => c.id.length >= 15);
      // Detect deleted (exists in initial, but not in current)
      const deletedComps = initialComponents.filter(sc => !currentComps.find(c => c.id === sc.id));

      // Execute Deletions
      for (const comp of deletedComps) {
        await api.delete(`/admin/cv-templates/${id}/components/${comp.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error("Error deleting comp:", err));
      }

      // Execute Updates
      for (const comp of updatedComps) {
        await api.put(`/admin/cv-templates/${id}/components/${comp.id}`, {
          content: comp.content || '',
          x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 1, // Layout handled via flex/grid now
          styleJson: JSON.stringify({ ...comp.styleJson, binding: comp.binding }) // Store binding in styleJson
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error("Error updating comp:", err));
      }

      // Execute Creations
      const createdRefs = [];
      for (const comp of newComps) {
        const { data: newCompData } = await api.post(`/admin/cv-templates/${id}/components`, {
          templateId: id,
          type: comp.type,
          content: comp.content || '',
          x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 1,
          styleJson: JSON.stringify({ ...comp.styleJson, binding: comp.binding })
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        createdRefs.push(newCompData);
      }

      // Refresh store with saved data so IDs are all valid GUIDs
      const finalComps = [...updatedComps, ...createdRefs];
      setComponents(finalComps);
      setInitialComponents(finalComps);

      alert('Lưu mẫu CV thành công!');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu thiết kế.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!template) return;
    try {
      const token = localStorage.getItem('token');
      const isCurrentlyPublished = template.isPublished;
      const endpoint = isCurrentlyPublished ? 'unpublish' : 'publish';
      
      const { data } = await api.post(`/admin/cv-templates/${id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTemplate({ ...template, isPublished: data.isPublished });
      alert(data.isPublished ? 'Đã xuất bản mẫu CV thành công!' : 'Đã ẩn mẫu CV thành nháp.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái xuất bản.');
    }
  };

  if (!template) {
    return (
      <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden font-sans">
      <TopNavigationBar 
        onSave={handleSaveAll}
        onPublish={handlePublishToggle}
      />
      
      {/* 3-Column Editor Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <CanvasArea />
        <PropertiesPanel />
      </div>
    </div>
  );
}
