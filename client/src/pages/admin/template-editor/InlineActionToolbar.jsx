import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Copy, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useDeleteSection, useReorderSections, useTemplateSections, useUpdateSection } from '../../../hooks/useSectionsApi';

export default function InlineActionToolbar({ section, setUndoToast }) {
  const { id: templateId } = useParams();
  const { mutate: deleteSection, isPending: isDeleting } = useDeleteSection();
  const { mutate: reorderSections, isPending: isReordering } = useReorderSections();
  const { mutate: updateSection, isPending: isUpdating } = useUpdateSection();
  const { data } = useTemplateSections(templateId);

  const sections = [...(data?.sections || [])].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleDuplicate = (e) => {
    e.stopPropagation();
    // Implementation for duplicate depends on API, we can trigger a mock or real one.
    // For now we will just show a toast if duplicate is not fully supported in backend.
    alert('Duplicate section feature coming soon!');
  };

  const handleToggleVisibility = (e) => {
    e.stopPropagation();
    updateSection({ 
      templateId, 
      sectionId: section.id, 
      data: { isHidden: !section.isHidden }
    });
  };

  const handleToggleLock = (e) => {
    e.stopPropagation();
    updateSection({ 
      templateId, 
      sectionId: section.id, 
      data: { isLocked: !section.isLocked }
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (section.isLocked) return;
    deleteSection(
      { templateId, sectionId: section.id },
      {
        onSuccess: () => {
          setUndoToast({
            sectionId: section.id,
            templateId,
            message: 'Section deleted',
          });
          // Force hide the toolbar to prevent double-clicks
          document.body.click(); // Simple hack to trigger global click listeners if any, or we can just rely on react-query re-render
        },
        onError: (err) => {
          if (err.response?.status === 404) {
            alert('Mục này đã được xóa! Vui lòng F5 (Refresh) lại trang.');
          } else {
            alert('Failed to delete section: ' + (err.response?.data?.message || err.message));
          }
        }
      }
    );
  };

  const handleMoveUp = (e) => {
    e.stopPropagation();
    const colSections = sections.filter(s => s.containerId === section.containerId && s.columnIndex === section.columnIndex);
    const index = colSections.findIndex(s => s.id === section.id);
    if (index > 0) {
      const prev = colSections[index - 1];
      reorderSections({
        templateId,
        sections: [
          { sectionId: section.id, orderIndex: prev.orderIndex },
          { sectionId: prev.id, orderIndex: section.orderIndex }
        ]
      });
    }
  };

  const handleMoveDown = (e) => {
    e.stopPropagation();
    const colSections = sections.filter(s => s.containerId === section.containerId && s.columnIndex === section.columnIndex);
    const index = colSections.findIndex(s => s.id === section.id);
    if (index !== -1 && index < colSections.length - 1) {
      const next = colSections[index + 1];
      reorderSections({
        templateId,
        sections: [
          { sectionId: section.id, orderIndex: next.orderIndex },
          { sectionId: next.id, orderIndex: section.orderIndex }
        ]
      });
    }
  };

  const buttonClass = "p-1.5 hover:bg-[#FFFFFF]/20 rounded-full transition-colors flex items-center justify-center relative group";
  const tooltipClass = "absolute -top-8 bg-[#333333] text-[#FFFFFF] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50";

  return (
    <div className="absolute -top-4 right-4 bg-[#333330] text-[#FFFFFF] rounded-full shadow-lg flex items-center gap-1 p-1 z-40 border border-[#FFFFFF]/10" onClick={(e) => e.stopPropagation()}>
      <button className={`${buttonClass} ${isReordering ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleMoveUp} disabled={isReordering}>
        <span className={tooltipClass}>Move Up</span>
        <ArrowUp size={14} />
      </button>
      <button className={`${buttonClass} ${isReordering ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleMoveDown} disabled={isReordering}>
        <span className={tooltipClass}>Move Down</span>
        <ArrowDown size={14} />
      </button>
      
      <button className={`${buttonClass} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleDuplicate} disabled={isUpdating}>
        <span className={tooltipClass}>Duplicate</span>
        <Copy size={14} />
      </button>

      <button className={`${buttonClass} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleToggleVisibility} disabled={isUpdating}>
        <span className={tooltipClass}>{section.isHidden ? 'Show' : 'Hide'}</span>
        {section.isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>

      <button className={`${buttonClass} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleToggleLock} disabled={isUpdating}>
        <span className={tooltipClass}>{section.isLocked ? 'Unlock' : 'Lock'}</span>
        {section.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
      </button>
      
      <div className="w-[1px] h-4 bg-[#FFFFFF]/20 mx-1"></div>
      
      <button className={`${buttonClass} hover:bg-red-500/20 text-red-400 ${(section.isLocked || isDeleting) ? 'opacity-50 cursor-not-allowed text-gray-500 hover:bg-transparent' : ''}`} onClick={handleDelete} disabled={section.isLocked || isDeleting}>
        <span className={tooltipClass}>Delete</span>
        <Trash2 size={14} />
      </button>
    </div>
  );
}
