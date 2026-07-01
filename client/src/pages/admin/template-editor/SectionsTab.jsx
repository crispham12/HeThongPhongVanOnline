import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Search, User, FileText, Briefcase, GraduationCap, Eye, Info, Plus, 
  Check, GripVertical, Folder, BadgeCheck, Layers, FileBadge, Box, Grid 
} from 'lucide-react';
import { 
  useTemplateSections, 
  useAddSection, 
  useDeleteSection,
  useValidateTemplate,
  useReorderSections
} from '../../../hooks/useSectionsApi';
import useTemplateEditorStore from '../../../store/useTemplateEditorStore';

const ICON_MAP = {
  'PersonalInfo': User,
  'Summary': FileText,
  'Experience': Briefcase,
  'Education': GraduationCap,
  'Projects': Folder,
  'Skills': Check,
  'Certificates': BadgeCheck,
  'Custom': Box
};

const getIcon = (type) => ICON_MAP[type] || Box;

export default function SectionsTab() {
  const { id: templateId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const { highlightedSectionId, setHighlightedSectionId } = useTemplateEditorStore();
  
  const { data, isLoading, isError, error } = useTemplateSections(templateId);
  const { mutate: addSection, isPending: isAdding } = useAddSection();
  const { mutate: deleteSection } = useDeleteSection();
  const { mutate: validateTemplate, isPending: isValidating } = useValidateTemplate();
  const { mutate: reorderSections } = useReorderSections();

  const [draggedItem, setDraggedItem] = useState(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-[#333333]/20 border-t-[#333333]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 m-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
        <h4 className="font-bold mb-1">Lỗi tải dữ liệu</h4>
        <p>{error?.response?.data?.title || error?.message || "Đã có lỗi không xác định xảy ra."}</p>
      </div>
    );
  }

  if (!data) return null;

  const { progress, library, sections, validation } = data;

  const handleAdd = (sectionType) => {
    addSection({ templateId, sectionType });
  };

  const handleDelete = (sectionId) => {
    if (confirm('Bạn có chắc chắn muốn xoá mục này không?')) {
      deleteSection({ templateId, sectionId });
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedItem];
    
    newSections.splice(draggedItem, 1);
    newSections.splice(dropIndex, 0, draggedSection);

    const reorderedPayload = newSections.map((sec, idx) => ({
      sectionId: sec.id,
      orderIndex: idx
    }));

    reorderSections({ templateId, sections: reorderedPayload });
    setDraggedItem(null);
  };

  const filteredCategories = library.categories.map(category => ({
    ...category,
    items: category.items.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(c => c.items.length > 0);

  return (
    <>
      {/* Validation Banner */}
      {(validation?.errors?.length > 0 || progress?.missingRequired?.length > 0) && (
        <div className="p-3 border border-red-500/20 bg-red-50 text-red-700 rounded-xl mb-4 shadow-sm flex justify-between items-start">
          <div>
            <h4 className="text-xs font-bold mb-1">Cảnh báo kiểm tra</h4>
            <ul className="text-[10px] list-disc pl-4 space-y-0.5">
              {progress?.missingRequired?.map((req, i) => <li key={`req-${i}`}>Thiếu phần bắt buộc: {req}</li>)}
              {validation?.errors?.map((err, i) => <li key={`err-${i}`}>{err.message}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="p-4 border border-[#333333]/20 rounded-xl bg-[#FFFFFF] shrink-0 mb-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[11px] font-bold text-[#333333] uppercase tracking-wider">Tiến độ</span>
          <span className="text-sm font-bold text-[#333333]">{Math.round(progress.completionPercentage)}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#333333]/10 rounded-full mb-4 overflow-hidden flex">
          <div className="h-full bg-[#6F7E64] rounded-full" style={{ width: `${progress.completionPercentage}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-y-2 text-xs">
          <div className="font-semibold text-[#333333]">Cơ bản {progress.coreAdded}/{progress.coreTotal}</div>
          <div className="font-semibold text-[#333333] text-right">Tuỳ chọn {progress.optionalAdded}/{progress.optionalTotal}</div>
          <div className="font-medium text-[#333333]/60">Còn thiếu {progress.missingRequired.length}</div>
          <div className={`font-medium text-right ${progress.atsReady ? 'text-green-600 font-bold' : 'text-[#333333]/60'}`}>
            {progress.atsReady ? 'Chuẩn ATS ✓' : 'Chưa chuẩn ATS'}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#333333]/10 text-center">
          <button 
            onClick={() => validateTemplate({ templateId })}
            disabled={isValidating}
            className="text-[10px] font-bold uppercase tracking-wider text-[#333333]/60 hover:text-[#333333]"
          >
            {isValidating ? 'Đang kiểm tra...' : 'Kiểm tra lại mẫu CV'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-[#333333] uppercase tracking-wider mb-1">Thư viện Section</h3>
        <p className="text-[11px] text-[#333333]/60 mb-3">Xây dựng cấu trúc nhanh chóng. Tuỳ chỉnh giao diện ở tab khác.</p>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#333333]/40" />
          <input 
            type="text" 
            placeholder="Tìm kiếm thư viện..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#333333]/20 rounded-lg outline-none focus:border-[#333333]/40 bg-[#FFFFFF] text-[#333333] placeholder-[#333333]/40"
          />
        </div>
      </div>

      {/* Library Categories */}
      {filteredCategories.map((category, catIdx) => (
        <div key={catIdx} className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-[#333333] flex items-center gap-1 capitalize">
              <span className="text-[10px]">▼</span> Mục {category.category === 'Core' ? 'Cơ bản' : category.category === 'Optional' ? 'Tuỳ chọn' : category.category}
            </h4>
          </div>
          <div className="flex flex-col gap-3">
            {category.items.map((s, i) => {
              const Icon = getIcon(s.sectionType);
              const addedCount = sections.filter(x => x.sectionDefinitionId === s.id).length;
              const isCore = category.category === 'Core';
              const canAdd = isCore ? addedCount < 1 : (!s.isSingleInstance ? addedCount < 2 : addedCount < 1);
              return (
                <div key={i} className="p-4 border rounded-xl bg-[#FFFFFF] border-[#333333]/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#333333]/5 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#333333]/70" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-[#333333]">{s.name}</h5>
                        <p className="text-xs text-[#333333]/60 mt-0.5 leading-relaxed">{s.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-2">
                      {addedCount > 0 && (
                        <button 
                          onClick={() => {
                            const addedSec = sections.find(x => x.sectionDefinitionId === s.id);
                            if(addedSec) setHighlightedSectionId(addedSec.id);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold border border-[#333333]/20 text-[#333333] rounded-full hover:bg-[#333333]/5"
                        >
                          Định vị
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {canAdd ? (
                        <>
                          <button className="w-7 h-7 flex items-center justify-center border border-[#333333]/20 rounded-full hover:bg-[#333333]/5">
                            <Info className="w-3.5 h-3.5 text-[#333333]/70" />
                          </button>
                          <button 
                            onClick={() => handleAdd(s.sectionType)}
                            disabled={isAdding}
                            className="px-4 py-1.5 text-xs font-semibold bg-[#333333] text-[#FFFFFF] rounded-full flex items-center gap-1 hover:bg-[#333333]/90 disabled:opacity-50"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-[#333333]/60 flex items-center gap-1 pr-1">
                          <Check className="w-3.5 h-3.5" /> Đã thêm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Current Sections (Draggable) */}
      {sections.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-[#333333]/20">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-[#333333] flex items-center gap-1">
              Các mục hiện tại
            </h4>
            <span className="text-[11px] font-medium text-[#333333]/60">tổng số {sections.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {sections.map((sec, idx) => {
              const isHighlighted = highlightedSectionId === sec.id;
              return (
                <div 
                  key={sec.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`p-3 border rounded-xl flex justify-between items-center bg-[#FFFFFF] transition-all cursor-move
                    ${isHighlighted ? 'border-[#6F7E64] ring-1 ring-[#6F7E64] shadow-md' : 'border-[#333333]/20 hover:border-[#333333]/40'}
                    ${draggedItem === idx ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <GripVertical className="w-4 h-4 text-[#333333]/40" />
                    <div>
                      <h5 className="text-xs font-bold text-[#333333]">{sec.displayName}</h5>
                      <p className="text-[10px] text-[#333333]/60">{sec.category === 'Core' ? 'Cơ bản' : sec.category === 'Optional' ? 'Tuỳ chọn' : sec.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setHighlightedSectionId(sec.id)}
                      className="px-2 py-1 text-[10px] font-bold border border-[#333333]/20 rounded-md hover:bg-[#333333]/5 text-[#333333]"
                    >
                      Định vị
                    </button>
                    {!sec.isLocked && (
                      <button 
                        onClick={() => handleDelete(sec.id)}
                        className="w-7 h-7 flex items-center justify-center border border-red-500/20 rounded-full hover:bg-red-50 text-red-500"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-6 px-4 border rounded-xl bg-[#333333]/5 border-[#333333]/20 text-center flex flex-col items-center justify-center mt-4">
          <div className="w-12 h-12 bg-[#FFFFFF] rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <Layers className="w-6 h-6 text-[#333333]/70" />
          </div>
          <p className="text-[11px] font-bold text-[#333333] mb-4 leading-tight">
            Bắt đầu xây dựng mẫu CV<br/>của bạn bằng cách thêm một mục.
          </p>
        </div>
      )}
    </>
  );
}
