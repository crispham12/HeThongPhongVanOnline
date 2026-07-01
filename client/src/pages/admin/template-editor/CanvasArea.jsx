import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { GripVertical, AlertTriangle, RotateCcw, X } from 'lucide-react';
import { useTemplateSections, useRestoreSection } from '../../../hooks/useSectionsApi';
import useTemplateEditorStore from '../../../store/useTemplateEditorStore';
import InlineActionToolbar from './InlineActionToolbar';
import RenderNode from './components/RenderNode';

export default function CanvasArea() {
  const { id: templateId } = useParams();
  const { data } = useTemplateSections(templateId);
  const { highlightedSectionId, selectedContainerId, setHighlightedSectionId, setSelectedContainerId, components } = useTemplateEditorStore();
  const { mutate: restoreSection } = useRestoreSection();

  const containers = data?.containers || [];
  const sections = data?.sections || [];
  
  const [undoToast, setUndoToast] = useState(null);
  const [hoveredSectionId, setHoveredSectionId] = useState(null);
  const [hoveredContainerId, setHoveredContainerId] = useState(null);
  
  const sortedContainers = [...containers].sort((a, b) => a.orderIndex - b.orderIndex);
  const sortedSections = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);

  const [sectionHeights, setSectionHeights] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setSectionHeights(prev => {
        let changed = false;
        const newHeights = { ...prev };
        for (const entry of entries) {
          const id = entry.target.dataset.id;
          const rect = entry.target.getBoundingClientRect();
          if (id && Math.abs((newHeights[id] || 0) - rect.height) > 1) {
            newHeights[id] = rect.height;
            changed = true;
          }
        }
        return changed ? newHeights : prev;
      });
    });

    const currentRefs = Object.values(sectionRefs.current).filter(Boolean);
    currentRefs.forEach(node => observer.observe(node));

    return () => observer.disconnect();
  }, [sortedSections]);

  useEffect(() => {
    if (highlightedSectionId) {
      const el = document.getElementById(`canvas-section-${highlightedSectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedSectionId]);

  const renderSection = (sec) => {
    const isHighlighted = highlightedSectionId === sec.id;
    const isHovered = hoveredSectionId === sec.id;
    const showToolbar = isHighlighted;
    let config = {};
    try { config = JSON.parse(sec.layoutConfigJson || '{}'); } catch(e) {}
    
    // Simulate compact mode visually
    const paddingClass = config.compactMode ? 'p-3' : 'p-5';
    const textClass = config.compactMode ? 'text-xs' : 'text-sm';

    return (
      <div 
        key={sec.id}
        id={`canvas-section-${sec.id}`}
        ref={(el) => (sectionRefs.current[sec.id] = el)}
        data-id={sec.id}
        onClick={(e) => { e.stopPropagation(); setHighlightedSectionId(sec.id); }}
        className={`relative border rounded-xl ${paddingClass} transition-colors duration-200 cursor-pointer
          ${isHighlighted 
            ? 'border-[#6F7E64] bg-[#6F7E64]/10 shadow-md ring-1 ring-[#6F7E64]' 
            : 'border-[#333333]/20 bg-[#FFFFFF] hover:border-[#333333]/40'
          }
          ${sec.isHidden ? 'opacity-40' : ''}
        `}
        onMouseEnter={() => setHoveredSectionId(sec.id)}
        onMouseLeave={() => setHoveredSectionId(null)}
      >
        {showToolbar && <InlineActionToolbar section={sec} setUndoToast={setUndoToast} />}
        
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[11px] font-bold text-[#333333] uppercase tracking-widest">{sec.displayName}</h3>
          <div className="flex items-center gap-2">
            {sec.isLocked && <span className="px-2 py-0.5 bg-[#333333]/10 text-[10px] font-bold uppercase rounded">Locked</span>}
            {sec.isHidden && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded">Hidden</span>}
            {isHighlighted && (
              <span className="px-2.5 py-1 bg-[#6F7E64] text-[#FFFFFF] text-[10px] font-semibold rounded-full uppercase tracking-wide">
                Selected
              </span>
            )}
          </div>
        </div>
        <p className={`${textClass} text-[#333333]/80 leading-relaxed max-w-[85%] mb-2`}>
          {sec.category} Section {config.compactMode && '(Compact)'}
        </p>

        {/* Render child components */}
        <div className="flex flex-col gap-2 relative z-10">
          {components
            .filter(c => c.sectionId === sec.id && !c.parentComponentId)
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map(comp => (
              <RenderNode key={comp.id} node={comp} />
          ))}
        </div>
      </div>
    );
  };

  const renderContainer = (container, pageIndex, chunkIndex) => {
    const col0Sections = container._col0Sections || [];
    const col1Sections = container._col1Sections || [];
    
    const isSelected = selectedContainerId === container.id;

    // Map layoutType to grid columns
    let gridClass = "grid-cols-1";
    if (container.layoutType === "TwoColumns") gridClass = "grid-cols-2";
    if (container.layoutType === "LeftSidebar") gridClass = "grid-cols-[1fr_2fr]";
    if (container.layoutType === "RightSidebar") gridClass = "grid-cols-[2fr_1fr]";

    const isHovered = hoveredContainerId === container.id;
    const showToolbar = isSelected || isHovered;

    return (
      <div 
        key={`${container.id}-${pageIndex}-${chunkIndex}`} 
        onClick={(e) => { e.stopPropagation(); setSelectedContainerId(container.id); setHighlightedSectionId(null); }}
        onMouseEnter={() => setHoveredContainerId(container.id)}
        onMouseLeave={() => setHoveredContainerId(null)}
        className={`relative w-full border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors group
          ${isSelected ? 'border-[#6F7E64] bg-[#6F7E64]/5 shadow-sm' : 'border-[#333333]/20 hover:border-[#333333]/40'}
        `}
      >
        <div className="absolute -top-3 left-4 bg-white px-2 flex items-center gap-2">
           <span className="text-[10px] font-bold text-[#333333]/50 uppercase tracking-widest bg-[#f3f4f6] px-2 py-0.5 rounded-full">
             CONTAINER: {container.layoutType.replace(/([A-Z])/g, ' $1').trim()}
           </span>
           {isSelected && <span className="w-2 h-2 rounded-full bg-[#6F7E64]"></span>}
        </div>
        
        {/* Floating Toolbar for Container (mock or real actions can go here later) */}
        {showToolbar && (
          <div className="absolute -right-3 -top-3 hidden group-hover:flex items-center gap-1 bg-[#333333] text-white p-1 rounded-full shadow-lg z-20">
             {/* We can add Move Up, Move Down here if Container order is editable */}
             <button className="p-1 hover:bg-white/20 rounded-full text-white"><GripVertical size={14}/></button>
          </div>
        )}
        <div className={`grid gap-4 ${gridClass}`}>
          {/* Column 0 */}
          <div className="flex flex-col gap-4">
            {col0Sections.map(renderSection)}
            {col0Sections.length === 0 && pageIndex === 0 && (
              <div className="h-20 border border-dashed border-[#333333]/10 rounded-lg flex items-center justify-center text-xs text-[#333333]/30 bg-[#333333]/5">
                Empty Column
              </div>
            )}
          </div>
          
          {/* Column 1 (if applicable) */}
          {container.layoutType !== "OneColumn" && (
            <div className="flex flex-col gap-4">
              {col1Sections.map(renderSection)}
              {col1Sections.length === 0 && pageIndex === 0 && (
                <div className="h-20 border border-dashed border-[#333333]/10 rounded-lg flex items-center justify-center text-xs text-[#333333]/30 bg-[#333333]/5">
                  Empty Column
                </div>
              )}
            </div>
          )}
        </div>
        
        {container._exceedsPage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
            <div className="font-bold mb-1 flex items-center gap-1"><AlertTriangle size={14}/> This container exceeds one A4 page.</div>
            <ul className="list-disc pl-5 opacity-80">
              <li>Enable Compact Mode in Section Properties.</li>
              <li>Split into smaller containers.</li>
              <li>Move sections to the next page.</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  const pages = [];
  let currentPageContainers = [];
  let currentRemainingHeight = 1027; // 1123 - 48*2
  const GAP = 16; // gap-4 is 16px

  for (const container of sortedContainers) {
    const containerSections = sortedSections.filter(s => s.containerId === container.id);
    let col0 = containerSections.filter(s => s.columnIndex === 0);
    let col1 = containerSections.filter(s => s.columnIndex === 1);
    
    if (col0.length === 0 && col1.length === 0) {
        if (currentRemainingHeight < 100) {
            pages.push(currentPageContainers);
            currentPageContainers = [];
            currentRemainingHeight = 1027;
        }
        currentPageContainers.push({
            ...container,
            _col0Sections: [],
            _col1Sections: []
        });
        currentRemainingHeight -= 100;
        continue;
    }
    
    while (col0.length > 0 || col1.length > 0) {
      let sliceCol0 = [];
      let h0 = 0;
      let i0 = 0;
      for (; i0 < col0.length; i0++) {
        const secH = sectionHeights[col0[i0].id] || 150;
        const addition = h0 === 0 ? secH : secH + GAP;
        if (h0 + addition > currentRemainingHeight && sliceCol0.length > 0) {
           break;
        }
        sliceCol0.push(col0[i0]);
        h0 += addition;
      }
      
      let sliceCol1 = [];
      let h1 = 0;
      let i1 = 0;
      for (; i1 < col1.length; i1++) {
        const secH = sectionHeights[col1[i1].id] || 150;
        const addition = h1 === 0 ? secH : secH + GAP;
        if (h1 + addition > currentRemainingHeight && sliceCol1.length > 0) {
           break;
        }
        sliceCol1.push(col1[i1]);
        h1 += addition;
      }
      
      if (sliceCol0.length === 0 && sliceCol1.length === 0 && (col0.length > 0 || col1.length > 0)) {
        if (currentRemainingHeight === 1027) {
           if (col0.length > 0) {
             sliceCol0.push(col0[0]);
             h0 = sectionHeights[col0[0].id] || 150;
             i0 = 1;
           }
           if (col1.length > 0) {
             sliceCol1.push(col1[0]);
             h1 = sectionHeights[col1[0].id] || 150;
             i1 = 1;
           }
        } else {
           pages.push(currentPageContainers);
           currentPageContainers = [];
           currentRemainingHeight = 1027;
           continue;
        }
      }
      
      currentPageContainers.push({
        ...container,
        _col0Sections: sliceCol0,
        _col1Sections: sliceCol1,
      });
      
      col0 = col0.slice(i0);
      col1 = col1.slice(i1);
      
      const maxH = Math.max(h0, h1);
      
      currentPageContainers[currentPageContainers.length - 1]._exceedsPage = maxH > 1027;

      currentRemainingHeight -= (maxH + 60); 
      
      if (col0.length > 0 || col1.length > 0) {
         pages.push(currentPageContainers);
         currentPageContainers = [];
         currentRemainingHeight = 1027;
      }
    }
  }
  
  if (currentPageContainers.length > 0) {
    pages.push(currentPageContainers);
  }

  return (
    <div className="flex-1 bg-[#333333]/5 flex flex-col items-center overflow-y-auto py-8 px-4 font-sans custom-scrollbar" onClick={() => { setSelectedContainerId(null); setHighlightedSectionId(null); }}>
      <div className="w-full max-w-[800px] flex justify-between items-center mb-4 text-xs font-semibold text-[#333333]/60">
        <div>Edit · A4 · Section structure</div>
      </div>

      <div className="flex flex-col gap-8 w-full items-center">
        {sortedContainers.length === 0 ? (
          <div className="relative w-[800px] min-h-[1123px] bg-[#FFFFFF] shadow-sm rounded-sm p-12 border border-[#333333]/20 flex flex-col gap-6 items-center justify-center">
            <div className="w-full h-48 flex flex-col items-center justify-center text-[#333333]/40 border-2 border-dashed border-[#333333]/20 rounded-xl bg-[#fafafa]">
              <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
              <span className="font-bold text-sm">No layout containers found.</span>
              <span className="text-xs mt-1">Add a layout container first from the Layouts panel.</span>
            </div>
          </div>
        ) : (
          pages.map((page, pageIndex) => (
            <div key={pageIndex} className="relative w-[800px] min-h-[1123px] bg-[#FFFFFF] shadow-sm rounded-sm p-12 border border-[#333333]/20 flex flex-col gap-6">
              {page.map((c, i) => renderContainer(c, pageIndex, i))}
            </div>
          ))
        )}
      </div>

      {/* Undo Toast */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#333333] text-white px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{undoToast.message}</span>
          <div className="w-[1px] h-4 bg-white/20"></div>
          <button 
            className="flex items-center gap-1.5 text-sm font-bold text-[#6F7E64] hover:text-[#889B7A] transition-colors"
            onClick={() => {
              restoreSection({ templateId: undoToast.templateId, sectionId: undoToast.sectionId });
              setUndoToast(null);
            }}
          >
            <RotateCcw size={14} />
            Undo
          </button>
          <button onClick={() => setUndoToast(null)} className="ml-2 text-white/50 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
