import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
  Plus, Search, Copy, Trash2, Eye, ShieldAlert,
  Sparkles, FileText, CheckCircle, FileCode
} from 'lucide-react';

export default function AdminTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // All, Published, Drafts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    width: 794,
    height: 1123,
    backgroundColor: '#FFFFFF'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await api.get('/admin/cv-templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách mẫu CV.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplate.name.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const { data } = await api.post('/admin/cv-templates', newTemplate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      // Reset form
      setNewTemplate({
        name: '',
        description: '',
        width: 794,
        height: 1123,
        backgroundColor: '#FFFFFF'
      });
      // Redirect to editor
      navigate(`/admin/templates/editor/${data.id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo mẫu CV.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id, name, e) => {
    e.stopPropagation();
    if (!confirm(`Bạn có chắc chắn muốn xóa mẫu CV "${name}"? Thao tác này sẽ xóa toàn bộ component bên trong.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/cv-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Không thể xóa mẫu CV này.');
    }
  };

  const handleDuplicateTemplate = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      // 1. Fetch template detail
      const { data: detail } = await api.get(`/admin/cv-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Create duplicate base template
      const duplicateData = {
        name: `${detail.name} (Bản sao)`,
        description: detail.description,
        width: detail.width,
        height: detail.height,
        backgroundColor: detail.backgroundColor
      };

      const { data: cloned } = await api.post('/admin/cv-templates', duplicateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Add components to the cloned template
      if (detail.components && detail.components.length > 0) {
        for (const comp of detail.components) {
          await api.post(`/admin/cv-templates/${cloned.id}/components`, {
            templateId: cloned.id,
            type: comp.type,
            content: comp.content,
            x: comp.x,
            y: comp.y,
            width: comp.width,
            height: comp.height,
            rotation: comp.rotation,
            zIndex: comp.zIndex,
            styleJson: JSON.stringify(comp.styleJson)
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }

      fetchTemplates();
      alert('Nhân bản mẫu CV thành công!');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi sao chép mẫu CV.');
    }
  };

  // Filter & Search Logic
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'Published') {
      return matchesSearch && t.isPublished;
    }
    if (activeFilter === 'Drafts') {
      return matchesSearch && !t.isPublished;
    }
    return matchesSearch;
  });

  const getFormattedTime = (dateStr) => {
    try {
      const diff = new Date() - new Date(dateStr);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return 'Vừa mới sửa';
      if (hours < 24) return `Sửa ${hours} giờ trước`;
      const days = Math.floor(hours / 24);
      return `Sửa ${days} ngày trước`;
    } catch {
      return 'Mới cập nhật';
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-8">
      {/* Top Banner/Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CV Template Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage and organize your professional CV layouts</p>
        </div>

        {/* Search and Action Bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 md:w-80">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Template</span>
          </button>
        </div>
      </div>

      {/* Categories / Filters */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div className="flex gap-2">
          {['All', 'Published', 'Drafts'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFilter === filter
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {filter === 'All' ? 'All' : filter === 'Published' ? 'Published' : 'Drafts'}
            </button>
          ))}
        </div>
        <div className="text-[11px] font-bold text-gray-400 uppercase">
          Tổng số: {filteredTemplates.length} mẫu
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 flex items-center gap-3 max-w-xl mx-auto shadow-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Add New Card */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="group cursor-pointer border-2 border-dashed border-gray-200 hover:border-primary-400 bg-white rounded-2xl flex flex-col items-center justify-center p-8 h-[340px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-primary-50 text-gray-400 group-hover:text-primary-600 flex items-center justify-center transition-all mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-gray-600 group-hover:text-primary-600 transition-colors">
              Create New Template
            </span>
          </div>

          {/* Map Template List */}
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => navigate(`/admin/templates/editor/${tpl.id}`)}
              className="cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col h-[340px] overflow-hidden"
            >
              {/* Image Container Card */}
              <div className="flex-1 bg-gray-100 relative group p-6 overflow-hidden flex items-center justify-center">
                {tpl.thumbnailUrl ? (
                  <img
                    src={tpl.thumbnailUrl}
                    alt={tpl.name}
                    className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-200/50"
                  />
                ) : (
                  <div
                    className="w-[140px] h-[190px] rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center p-3 relative"
                    style={{ backgroundColor: tpl.backgroundColor || '#FFFFFF' }}
                  >
                    <FileCode className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-tighter truncate max-w-full">
                      {tpl.name}
                    </span>
                    <span className="text-[7px] text-gray-300 mt-1 block">
                      {tpl.width} x {tpl.height}
                    </span>
                  </div>
                )}

                {/* Edit overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <div className="bg-white text-gray-900 font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-2 active:scale-95 transition-all">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Edit Design</span>
                  </div>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 border-t border-gray-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate flex-1 leading-tight">
                      {tpl.name}
                    </h3>
                    <span
                      className={`text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase flex-shrink-0 ${
                        tpl.isPublished
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {tpl.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mb-2">
                    {tpl.description || 'Không có mô tả.'}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-50/50">
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {getFormattedTime(tpl.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleDuplicateTemplate(tpl.id, e)}
                      title="Nhân bản"
                      className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTemplate(tpl.id, tpl.name, e)}
                      title="Xóa mẫu"
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Create New CV Template</h3>
                <p className="text-[10px] text-gray-500">Khởi tạo thiết kế bố cục cho mẫu CV mới</p>
              </div>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Tên mẫu CV *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Modern Blue CV"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Mô tả mẫu CV</label>
                <textarea
                  placeholder="Mẫu CV chuyên nghiệp dành cho Tech Leads..."
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Chiều rộng (px)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTemplate.width}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Chiều cao (px)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTemplate.height}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Màu nền</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newTemplate.backgroundColor}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-8 h-8 rounded border border-gray-200 cursor-pointer overflow-hidden"
                  />
                  <input
                    type="text"
                    value={newTemplate.backgroundColor}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#FFFFFF"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Creating...' : 'Create & Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
