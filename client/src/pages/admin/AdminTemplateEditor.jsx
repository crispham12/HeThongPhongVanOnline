import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import {
  Type, Image, Circle, Square, Box, Minus, PlusCircle,
  Eye, RefreshCw, Send, Save, ArrowLeft, Trash2, Sliders, Info,
  Plus, Shapes
} from 'lucide-react';

export default function AdminTemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Template Data State
  const [template, setTemplate] = useState(null);
  const [components, setComponents] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [activeTab, setActiveTab] = useState('Style'); // Style, Layout, Advanced
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Left Active Tool State (for creation)
  const [activeLeftTool, setActiveLeftTool] = useState(null); // 'text', 'image', 'shapes', 'line', 'section'

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [compStartPos, setCompStartPos] = useState({ x: 0, y: 0 });

  // Preview Mode
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    fetchTemplateDetails();
  }, [id]);

  const fetchTemplateDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await api.get(`/admin/cv-templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplate(data);
      setComponents(data.components || []);
    } catch (err) {
      console.error(err);
      alert('Không thể tải thông tin mẫu CV.');
      navigate('/admin/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

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

      alert('Lưu mẫu CV thành công!');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu thiết kế.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!components.length) {
      alert('Không thể xuất bản mẫu CV trống! Hãy thêm ít nhất một phần tử.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const isCurrentlyPublished = template.isPublished;
      const endpoint = isCurrentlyPublished ? 'unpublish' : 'publish';
      
      const { data } = await api.post(`/admin/cv-templates/${id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTemplate(prev => ({ ...prev, isPublished: data.isPublished }));
      alert(data.isPublished ? 'Đã xuất bản mẫu CV thành công!' : 'Đã ẩn mẫu CV thành nháp.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái xuất bản.');
    }
  };

  // --- COMPONENT CRUD OPERATIONS ---
  const addElement = async (type, startX = 60, startY = 80) => {
    let defaultContent = '';
    let actualType = null;
    let defaultWidth = 100;
    let defaultHeight = 40;
    let defaultStyle = {
      color: '#0F172A',
      backgroundColor: 'transparent',
      fontSize: 14,
      fontWeight: 'normal',
      fontFamily: 'Arial',
      borderWidth: 0,
      borderRadius: 0,
      borderColor: '#CBD5E1'
    };

    switch (type) {
      case 'label':
        defaultContent = 'Nhấp đôi để chỉnh sửa văn bản...';
        defaultWidth = 200;
        defaultHeight = 35;
        defaultStyle.color = '#2563EB';
        break;
      case 'image':
        defaultContent = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=128&h=128';
        defaultWidth = 128;
        defaultHeight = 128;
        defaultStyle.borderRadius = 8;
        break;
      case 'circle':
        actualType = 'shape';
        defaultContent = '';
        defaultWidth = 100;
        defaultHeight = 100;
        defaultStyle.backgroundColor = '#2563EB';
        defaultStyle.borderRadius = '50%';
        break;
      case 'square':
        actualType = 'shape';
        defaultContent = '';
        defaultWidth = 100;
        defaultHeight = 100;
        defaultStyle.backgroundColor = '#CBD5E1';
        defaultStyle.borderRadius = 0;
        break;
      case 'rectangle':
        actualType = 'shape';
        defaultContent = '';
        defaultWidth = 250;
        defaultHeight = 100;
        defaultStyle.backgroundColor = '#F8FAFC';
        defaultStyle.borderWidth = 1;
        defaultStyle.borderRadius = 8;
        break;
      case 'line':
        defaultContent = '';
        defaultWidth = 400;
        defaultHeight = 4;
        defaultStyle.backgroundColor = '#CBD5E1';
        break;
      case 'section':
        defaultContent = 'MỤC THÔNG TIN MỚI';
        defaultWidth = 600;
        defaultHeight = 40;
        defaultStyle.fontSize = 16;
        defaultStyle.fontWeight = 'bold';
        defaultStyle.color = '#0F172A';
        break;
    }

    try {
      const token = localStorage.getItem('token');
      const maxZIndex = components.length > 0 ? Math.max(...components.map(c => c.zIndex)) + 1 : 1;

      const payload = {
        templateId: id,
        type: actualType || type,
        content: defaultContent,
        x: startX,
        y: startY,
        width: defaultWidth,
        height: defaultHeight,
        rotation: 0,
        zIndex: maxZIndex,
        styleJson: JSON.stringify(defaultStyle)
      };

      const { data } = await api.post(`/admin/cv-templates/${id}/components`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const parsedComp = {
        ...data,
        styleJson: typeof data.styleJson === 'string' ? JSON.parse(data.styleJson) : data.styleJson
      };

      setComponents(prev => [...prev, parsedComp]);
      setSelectedCompId(parsedComp.id);
      setActiveLeftTool(null); // Switch focus directly to properties editing
    } catch (err) {
      console.error(err);
      alert('Không thể thêm phần tử.');
    }
  };

  const updateComponentApi = async (comp) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/cv-templates/${id}/components/${comp.id}`, {
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
    } catch (err) {
      console.error('Lỗi khi đồng bộ component:', err);
    }
  };

  const removeSelectedElement = async () => {
    if (!selectedCompId) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/cv-templates/${id}/components/${selectedCompId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComponents(prev => prev.filter(c => c.id !== selectedCompId));
      setSelectedCompId(null);
    } catch (err) {
      console.error(err);
      alert('Không thể xóa phần tử.');
    }
  };

  // --- LOCAL MUTATION HANDLERS ---
  const handlePropChange = (key, val) => {
    if (!selectedCompId) return;

    setComponents(prev =>
      prev.map(c => {
        if (c.id === selectedCompId) {
          const updated = { ...c, [key]: val };
          updateComponentApi(updated);
          return updated;
        }
        return c;
      })
    );
  };

  const handleStyleChange = (styleKey, val) => {
    if (!selectedCompId) return;

    setComponents(prev =>
      prev.map(c => {
        if (c.id === selectedCompId) {
          const updated = {
            ...c,
            styleJson: { ...c.styleJson, [styleKey]: val }
          };
          updateComponentApi(updated);
          return updated;
        }
        return c;
      })
    );
  };

  // --- DRAG AND DROP ENGINE ---
  const startDrag = (compId, e) => {
    if (isPreview) return;
    e.stopPropagation();
    setSelectedCompId(compId);
    setActiveLeftTool(null); // Close creation view
    const comp = components.find(c => c.id === compId);
    if (!comp) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setCompStartPos({ x: comp.x, y: comp.y });
  };

  const onDrag = (e) => {
    if (!isDragging || !selectedCompId) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const snap = e.shiftKey ? 10 : 1;
    const nextX = Math.round((compStartPos.x + dx) / snap) * snap;
    const nextY = Math.round((compStartPos.y + dy) / snap) * snap;

    setComponents(prev =>
      prev.map(c => (c.id === selectedCompId ? { ...c, x: Math.max(0, nextX), y: Math.max(0, nextY) } : c))
    );
  };

  const stopDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const dragged = components.find(c => c.id === selectedCompId);
    if (dragged) {
      updateComponentApi(dragged);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [isDragging, dragStart, compStartPos, selectedCompId]);

  const activeComp = components.find(c => c.id === selectedCompId);

  // Trigger left sidebar tool focus helper
  const handleLeftToolSelect = (tool) => {
    setSelectedCompId(null); // Clear canvas focus
    setActiveLeftTool(tool); // Set active tool in properties panel
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden font-sans select-none">
      {/* HEADER BAR */}
      <header className="h-14 bg-gray-900 text-white px-6 flex items-center justify-between border-b border-gray-800 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/templates')}
            className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">CV Admin</span>
            <span className="text-gray-600">|</span>
            <span className="text-sm font-bold truncate max-w-[240px]">
              Editing: {template?.name || 'CV Template'}
            </span>
          </div>
        </div>

        {/* Action Header Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-2 font-semibold text-xs px-3.5 py-1.8 rounded-lg shadow-sm border border-gray-800 transition-all ${
              isPreview 
                ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreview ? 'Close Preview' : 'Preview'}</span>
          </button>

          <button
            onClick={handleTogglePublish}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-800 text-gray-300 font-semibold text-xs px-3.5 py-1.8 rounded-lg shadow-sm active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{template?.isPublished ? 'Unpublish' : 'Publish'}</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md active:scale-95 disabled:opacity-50 transition-all"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Template</span>
          </button>
        </div>
      </header>

      {/* THREE PANEL GRID SYSTEM */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* PANEL 1: LEFT SIDE EDITOR TOOLS */}
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Editor Tools</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => handleLeftToolSelect('text')}
                className={`w-full flex items-center gap-3 p-3 border rounded-xl text-xs font-bold transition-all ${
                  activeLeftTool === 'text'
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Type className="w-4 h-4 text-gray-400" />
                <span>Text / Label</span>
              </button>

              <button
                onClick={() => handleLeftToolSelect('image')}
                className={`w-full flex items-center gap-3 p-3 border rounded-xl text-xs font-bold transition-all ${
                  activeLeftTool === 'image'
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Image className="w-4 h-4 text-gray-400" />
                <span>Image Container</span>
              </button>

              <button
                onClick={() => handleLeftToolSelect('shapes')}
                className={`w-full flex items-center gap-3 p-3 border rounded-xl text-xs font-bold transition-all ${
                  activeLeftTool === 'shapes'
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shapes className="w-4 h-4 text-gray-400" />
                <span>Shapes (Hình khối)</span>
              </button>

              <button
                onClick={() => handleLeftToolSelect('line')}
                className={`w-full flex items-center gap-3 p-3 border rounded-xl text-xs font-bold transition-all ${
                  activeLeftTool === 'line'
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Minus className="w-4 h-4 text-gray-400" />
                <span>Separator Line</span>
              </button>
            </div>

            {/* Bottom Panel Actions */}
            <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
              <button
                onClick={() => handleLeftToolSelect('section')}
                className={`w-full py-3 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  activeLeftTool === 'section'
                    ? 'bg-primary-800 text-white shadow'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Section</span>
              </button>

              <div className="bg-gray-50 rounded-xl p-3 flex gap-2.5 items-start">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                  <span className="font-bold text-gray-600">Pro Tip:</span> Nhấp chọn công cụ bên trái để mở bảng **Thêm vào CV** tương ứng ở cột phải.
                </p>
              </div>
            </div>
          </aside>

          {/* PANEL 2: CENTER LIVE CANVAS DESIGNER */}
          <main className="flex-1 overflow-auto flex items-center justify-center p-8 relative bg-gray-100">
            {/* White virtual CV canvas with dotted grid */}
            <div
              ref={canvasRef}
              onClick={() => {
                setSelectedCompId(null);
                setActiveLeftTool(null);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const type = e.dataTransfer.getData('componentType');
                if (type && canvasRef.current) {
                  const rect = canvasRef.current.getBoundingClientRect();
                  const snap = 10;
                  const x = Math.round((e.clientX - rect.left) / snap) * snap;
                  const y = Math.round((e.clientY - rect.top) / snap) * snap;
                  addElement(type, x, y);
                }
              }}
              className="relative shadow-2xl transition-all select-none border border-gray-200/50 bg-white"
              style={{
                width: `${template.width}px`,
                height: `${template.height}px`,
                backgroundColor: template.backgroundColor || '#FFFFFF',
                backgroundImage: isPreview ? 'none' : 'radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 0)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0'
              }}
            >
              {components.map((comp) => {
                const isSelected = selectedCompId === comp.id;
                const style = comp.styleJson || {};
                
                return (
                  <div
                    key={comp.id}
                    onMouseDown={(e) => startDrag(comp.id, e)}
                    className={`absolute flex cursor-move select-none group transition-shadow ${
                      isSelected && !isPreview ? 'ring-0' : ''
                    }`}
                    style={{
                      left: `${comp.x}px`,
                      top: `${comp.y}px`,
                      width: `${comp.width}px`,
                      height: `${comp.height}px`,
                      transform: `rotate(${comp.rotation}deg)`,
                      zIndex: comp.zIndex,
                    }}
                  >
                    {/* Visual element selection frame */}
                    {isSelected && !isPreview && (
                      <div className="absolute inset-0 border border-dashed border-primary-500 pointer-events-none z-50">
                        {/* Selector Anchors corners */}
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-primary-500 rounded-sm" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-primary-500 rounded-sm" />
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-primary-500 rounded-sm" />
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-primary-500 rounded-sm" />
                      </div>
                    )}

                    {/* RENDER BY COMPONENT TYPE */}
                    {comp.type === 'label' && (
                      <div
                        className="w-full h-full flex items-center"
                        style={{
                          color: style.color || '#0F172A',
                          fontSize: `${style.fontSize || 14}px`,
                          fontWeight: style.fontWeight || 'normal',
                          fontFamily: style.fontFamily || 'sans-serif',
                          textAlign: style.textAlign || 'left',
                          justifyContent: style.textAlign === 'center' ? 'center' : style.textAlign === 'right' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {comp.content}
                      </div>
                    )}

                    {comp.type === 'image' && (
                      comp.content ? (
                        <img
                          src={comp.content}
                          alt="CV Visual Container"
                          draggable={false}
                          className="w-full h-full object-cover select-none pointer-events-none"
                          style={{
                            borderWidth: `${style.borderWidth || 0}px`,
                            borderColor: style.borderColor || '#CBD5E1',
                            borderStyle: 'solid',
                            borderRadius: style.borderRadius === '50%' ? '9999px' : `${style.borderRadius || 0}px`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                          <Image className="w-6 h-6 text-gray-300" />
                        </div>
                      )
                    )}

                    {comp.type === 'shape' && (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: style.backgroundColor || '#2563EB',
                          borderWidth: `${style.borderWidth || 0}px`,
                          borderColor: style.borderColor || '#CBD5E1',
                          borderStyle: 'solid',
                          borderRadius: style.borderRadius === '50%' ? '9999px' : `${style.borderRadius || 0}px`
                        }}
                      />
                    )}

                    {comp.type === 'line' && (
                      <div
                        className="w-full self-center"
                        style={{
                          height: `${comp.height}px`,
                          backgroundColor: style.backgroundColor || '#CBD5E1',
                          borderRadius: `${style.borderRadius || 0}px`
                        }}
                      />
                    )}

                    {comp.type === 'section' && (
                      <div className="w-full h-full flex flex-col justify-between">
                        <div
                          className="w-full font-bold flex items-center"
                          style={{
                            color: style.color || '#0F172A',
                            fontSize: `${style.fontSize || 16}px`,
                            fontFamily: style.fontFamily || 'sans-serif'
                          }}
                        >
                          {comp.content}
                        </div>
                        <div className="w-full h-[2px] bg-primary-600/20" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>

          {/* PANEL 3: RIGHT PROPERTIES / CREATION SIDEBAR */}
          <aside className="w-80 bg-white border-l border-gray-200 flex flex-col p-4 overflow-y-auto">
            {activeComp ? (
              /* VIEW A: COMPONENT PROPERTIES TUNING (If canvas component selected) */
              <>
                <div className="pb-4 border-b border-gray-100 mb-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Properties</h3>
                  <p className="text-sm font-bold text-gray-900 mt-1 capitalize">
                    Selected: {activeComp.type} Element
                  </p>
                </div>

                <div className="grid grid-cols-3 bg-gray-50 border border-gray-200/50 p-0.5 rounded-lg mb-6">
                  {['Style', 'Layout', 'Advanced'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                        activeTab === tab 
                          ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                          : 'text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex-1 space-y-5">
                  {activeTab === 'Style' && (
                    <>
                      {['label', 'image', 'section'].includes(activeComp.type) && (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                            {activeComp.type === 'image' ? 'Content URL' : 'Content Text'}
                          </label>
                          <textarea
                            value={activeComp.content || ''}
                            onChange={(e) => handlePropChange('content', e.target.value)}
                            rows={3}
                            className="w-full pl-3 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none font-medium text-gray-700"
                          />
                        </div>
                      )}

                      {['label', 'section'].includes(activeComp.type) && (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Font Size</label>
                          <select
                            value={activeComp.styleJson?.fontSize || 14}
                            onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                            className="w-full pl-3 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                          >
                            {[10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40].map(sz => (
                              <option key={sz} value={sz}>{sz} px</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {['image', 'shape', 'line'].includes(activeComp.type) && (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Border Radius</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: 'Square', val: 0 },
                              { label: 'Rounded', val: 8 },
                              { label: 'Circle', val: '50%' }
                            ].map(br => (
                              <button
                                key={br.label}
                                type="button"
                                onClick={() => handleStyleChange('borderRadius', br.val)}
                                className={`py-2 text-[10px] font-bold border rounded-lg transition-all ${
                                  activeComp.styleJson?.borderRadius === br.val
                                    ? 'bg-primary-50 text-primary-700 border-primary-500 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-500 hover:text-gray-800'
                                }`}
                              >
                                {br.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">
                          {['label', 'section'].includes(activeComp.type) ? 'Text Color' : 'Background Color'}
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[
                            '#0047FF',
                            '#0F172A',
                            '#2563EB',
                            '#000000',
                            '#475569',
                            '#CBD5E1',
                            '#FFFFFF'
                          ].map(color => {
                            const activeColor = ['label', 'section'].includes(activeComp.type)
                              ? activeComp.styleJson?.color
                              : activeComp.styleJson?.backgroundColor;
                            
                            return (
                              <button
                                key={color}
                                type="button"
                                onClick={() => {
                                  if (['label', 'section'].includes(activeComp.type)) {
                                    handleStyleChange('color', color);
                                  } else {
                                    handleStyleChange('backgroundColor', color);
                                  }
                                }}
                                className={`w-6 h-6 rounded-full border shadow-sm transition-transform active:scale-90 ${
                                  activeColor === color 
                                    ? 'scale-110 ring-2 ring-primary-500 border-white' 
                                    : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            );
                          })}

                          <div className="relative w-6 h-6 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center">
                            <input
                              type="color"
                              value={
                                (['label', 'section'].includes(activeComp.type) 
                                  ? activeComp.styleJson?.color 
                                  : activeComp.styleJson?.backgroundColor) || '#000000'
                              }
                              onChange={(e) => {
                                if (['label', 'section'].includes(activeComp.type)) {
                                  handleStyleChange('color', e.target.value);
                                } else {
                                  handleStyleChange('backgroundColor', e.target.value);
                                }
                              }}
                              className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-gray-500 pointer-events-none">+</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'Layout' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">X Position</label>
                          <input
                            type="number"
                            value={activeComp.x || 0}
                            onChange={(e) => handlePropChange('x', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Y Position</label>
                          <input
                            type="number"
                            value={activeComp.y || 0}
                            onChange={(e) => handlePropChange('y', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Width</label>
                          <input
                            type="number"
                            min={0}
                            value={activeComp.width || 0}
                            onChange={(e) => handlePropChange('width', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Height</label>
                          <input
                            type="number"
                            min={0}
                            value={activeComp.height || 0}
                            onChange={(e) => handlePropChange('height', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Rotation</label>
                          <span className="text-[10px] font-bold text-primary-600">{activeComp.rotation || 0}°</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          value={activeComp.rotation || 0}
                          onChange={(e) => handlePropChange('rotation', parseInt(e.target.value) || 0)}
                          className="w-full accent-primary-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'Advanced' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Z-Index (Layer)</label>
                        <select
                          value={activeComp.zIndex || 1}
                          onChange={(e) => handlePropChange('zIndex', parseInt(e.target.value))}
                          className="w-full pl-3 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {[1, 2, 3, 4, 5, 10, 20, 50, 100].map(zi => (
                            <option key={zi} value={zi}>Layer ({zi})</option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-800">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Advanced Metadata</span>
                        </div>
                        <div className="text-[9px] text-blue-600 space-y-1">
                          <p>ID: {activeComp.id}</p>
                          <p>Created: {new Date(activeComp.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 mt-auto">
                  <button
                    onClick={removeSelectedElement}
                    className="w-full flex items-center justify-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs py-3 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Element</span>
                  </button>
                </div>
              </>
            ) : activeLeftTool ? (
              /* VIEW B: ELEMENT CREATION PANEL WITH EXPLICIT '+ ADD TO CV' BUTTON */
              <div className="flex-1 flex flex-col h-full">
                <div className="pb-4 border-b border-gray-100 mb-6">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Element</h3>
                  <p className="text-sm font-bold text-gray-900 mt-1 capitalize">
                    {activeLeftTool === 'shapes' ? 'Shapes Block (Hình khối)' : `${activeLeftTool} Tool`}
                  </p>
                </div>

                <div className="flex-1 space-y-6">
                  {/* TEXT CREATION PREVIEW */}
                  {activeLeftTool === 'text' && (
                    <div className="space-y-4">
                      <div 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('componentType', 'label')}
                        className="bg-gray-50 border border-gray-200/50 p-4 rounded-xl flex items-center justify-center h-28 cursor-grab active:cursor-grabbing"
                      >
                        <span className="text-primary-600 font-bold text-base tracking-wide border border-dashed border-primary-200 px-3 py-1.5">
                          Text / Label
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Chèn một chuỗi văn bản tĩnh tùy ý vào CV. Bạn có thể kéo thả định vị vị trí và tinh chỉnh màu sắc, cỡ chữ tùy thích sau khi chèn.
                      </p>
                      <button
                        onClick={() => addElement('label')}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Text to CV</span>
                      </button>
                    </div>
                  )}

                  {/* IMAGE CREATION PREVIEW */}
                  {activeLeftTool === 'image' && (
                    <div className="space-y-4">
                      <div 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('componentType', 'image')}
                        className="bg-gray-50 border border-gray-200/50 p-4 rounded-xl flex items-center justify-center h-28 cursor-grab active:cursor-grabbing"
                      >
                        <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                          <Image className="w-6 h-6" />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Thêm một khung chứa hình ảnh (Ví dụ: Ảnh chân dung cá nhân). Sau khi thêm, bạn có thể truyền liên kết URL ảnh và bo góc dạng hình tròn hoặc vuông.
                      </p>
                      <button
                        onClick={() => addElement('image')}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Image Container</span>
                      </button>
                    </div>
                  )}

                  {/* SHAPES COMPACT SELECTOR PANEL */}
                  {activeLeftTool === 'shapes' && (
                    <div className="space-y-6">
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Lựa chọn một trong các hình khối chuyên nghiệp dưới đây để chèn vào CV của bạn làm khối nền hoặc thẻ điểm nhấn:
                      </p>

                      {/* 1. Circle Shape */}
                      <div 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('componentType', 'circle')}
                        className="p-3 border border-gray-100 hover:border-primary-100 rounded-xl bg-gray-50 flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-600 shadow-sm pointer-events-none" />
                          <span className="text-xs font-bold text-gray-800">Circle (Hình tròn)</span>
                        </div>
                        <button
                          onClick={() => addElement('circle')}
                          className="bg-white hover:bg-primary-50 text-primary-600 border border-primary-100 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          + Add
                        </button>
                      </div>

                      {/* 2. Square Shape */}
                      <div 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('componentType', 'square')}
                        className="p-3 border border-gray-100 hover:border-primary-100 rounded-xl bg-gray-50 flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-400 shadow-sm rounded-sm pointer-events-none" />
                          <span className="text-xs font-bold text-gray-800">Square (Hình vuông)</span>
                        </div>
                        <button
                          onClick={() => addElement('square')}
                          className="bg-white hover:bg-primary-50 text-primary-600 border border-primary-100 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          + Add
                        </button>
                      </div>

                      {/* 3. Rectangle Block */}
                      <div 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('componentType', 'rectangle')}
                        className="p-3 border border-gray-100 hover:border-primary-100 rounded-xl bg-gray-50 flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-slate-100 border border-gray-200 rounded shadow-sm pointer-events-none" />
                          <span className="text-xs font-bold text-gray-800">Rectangle (Khối chữ nhật)</span>
                        </div>
                        <button
                          onClick={() => addElement('rectangle')}
                          className="bg-white hover:bg-primary-50 text-primary-600 border border-primary-100 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LINE CREATION PREVIEW */}
                  {activeLeftTool === 'line' && (
                    <div className="space-y-4">
                      <div 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('componentType', 'line')}
                        className="bg-gray-50 border border-gray-200/50 p-4 rounded-xl flex items-center justify-center h-28 cursor-grab active:cursor-grabbing"
                      >
                        <div className="w-3/4 h-1 bg-gray-300 rounded pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Chèn một đường phân tách thanh ngang tinh tế để chia các cột thông tin hoặc các phần lớn trong CV.
                      </p>
                      <button
                        onClick={() => addElement('line')}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Separator Line</span>
                      </button>
                    </div>
                  )}

                  {/* SECTION CREATION PREVIEW */}
                  {activeLeftTool === 'section' && (
                    <div className="space-y-4">
                      <div 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('componentType', 'section')}
                        className="bg-gray-50 border border-gray-200/50 p-4 rounded-xl flex flex-col justify-center h-28 space-y-2 cursor-grab active:cursor-grabbing"
                      >
                        <span className="font-bold text-xs text-gray-900 tracking-wider pointer-events-none">MỤC THÔNG TIN MỚI</span>
                        <div className="w-full h-[2px] bg-primary-600/20 pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Thêm một Khối phân vùng chính kèm đường gạch chân phân cách đẹp mắt (Ví dụ: KINH NGHIỆM LÀM VIỆC, HỌC VẤN, KỸ NĂNG).
                      </p>
                      <button
                        onClick={() => addElement('section')}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Section Block</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* VIEW C: STANDARD INSTRUCTIONS (If nothing selected or focused) */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400 h-full">
                <Sliders className="w-8 h-8 text-gray-200 mb-3" />
                <p className="text-xs font-bold text-gray-700">Chưa chọn công cụ / phần tử</p>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                  Vui lòng nhấp chọn một công cụ thiết kế ở cột trái (Text, Image, Shapes...) hoặc chọn trực tiếp một phần tử trên CV để tùy chỉnh.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
