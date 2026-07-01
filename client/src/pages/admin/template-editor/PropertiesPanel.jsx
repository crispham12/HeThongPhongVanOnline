import React from 'react';
import { useParams } from 'react-router-dom';
import useTemplateEditorStore from '../../../store/useTemplateEditorStore';
import { useTemplateSections, useUpdateSection, useUpdateContainer } from '../../../hooks/useSectionsApi';

export default function PropertiesPanel() {
  const { id: templateId } = useParams();
  const { data } = useTemplateSections(templateId);
  const { highlightedSectionId, selectedContainerId } = useTemplateEditorStore();
  const updateSection = useUpdateSection();
  const updateContainer = useUpdateContainer();

  const sections = data?.sections || [];
  const containers = data?.containers || [];

  const selectedSection = highlightedSectionId ? sections.find(s => s.id === highlightedSectionId) : null;
  const selectedContainer = selectedContainerId ? containers.find(c => c.id === selectedContainerId) : null;

  const handleContainerLayoutChange = (e) => {
    updateContainer.mutate({
      templateId,
      containerId: selectedContainer.id,
      updates: { layoutType: e.target.value }
    });
  };

  const handleSectionColumnChange = (e) => {
    updateSection.mutate({
      templateId,
      sectionId: selectedSection.id,
      updates: { columnIndex: parseInt(e.target.value, 10) }
    });
  };

  const toggleCompactMode = () => {
    let config = {};
    try { config = JSON.parse(selectedSection.layoutConfigJson || '{}'); } catch(e) {}
    config.compactMode = !config.compactMode;
    updateSection.mutate({
      templateId,
      sectionId: selectedSection.id,
      updates: { layoutConfigJson: JSON.stringify(config) }
    });
  };

  if (!selectedSection && !selectedContainer) {
    return (
      <div className="w-[280px] h-full border-l border-[#333333]/20 bg-[#FFFFFF] p-4 flex flex-col gap-4 shrink-0 font-sans items-center justify-center text-center">
        <p className="text-sm font-bold text-[#333333]/40">Select a section or container to edit its layout properties.</p>
      </div>
    );
  }

  return (
    <div className="w-[280px] h-full border-l border-[#333333]/20 bg-[#FFFFFF] p-4 flex flex-col gap-6 shrink-0 font-sans overflow-y-auto">
      
      {selectedContainer && (
        <div className="flex flex-col gap-4">
          <div className="text-[11px] font-bold text-[#6F7E64] uppercase tracking-wider mb-1">
            Container Properties
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#333333]">Layout Type</label>
            <select 
              className="w-full p-2 border border-[#333333]/20 rounded-md text-sm"
              value={selectedContainer.layoutType}
              onChange={handleContainerLayoutChange}
            >
              <option value="OneColumn">One Column</option>
              <option value="TwoColumns">Two Columns (50/50)</option>
              <option value="LeftSidebar">Left Sidebar (33/66)</option>
              <option value="RightSidebar">Right Sidebar (66/33)</option>
            </select>
          </div>
        </div>
      )}

      {selectedSection && (
        <div className="flex flex-col gap-4">
          <div className="text-[11px] font-bold text-[#6F7E64] uppercase tracking-wider mt-4 border-t pt-4">
            Section Layout: {selectedSection.displayName}
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#333333]">Move to Column</label>
            <select 
              className="w-full p-2 border border-[#333333]/20 rounded-md text-sm"
              value={selectedSection.columnIndex}
              onChange={handleSectionColumnChange}
            >
              <option value={0}>Column 1 (Left/Main)</option>
              <option value={1}>Column 2 (Right/Side)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 border border-[#333333]/10 rounded-lg bg-[#333333]/5 mt-2">
            <div>
              <div className="text-sm font-bold text-[#333333]">Compact Mode</div>
              <div className="text-[10px] text-[#333333]/60">Reduces padding and gap</div>
            </div>
            <button 
              onClick={toggleCompactMode}
              className={`w-10 h-6 rounded-full p-1 transition-colors ${
                (JSON.parse(selectedSection.layoutConfigJson || '{}').compactMode) ? 'bg-[#6F7E64]' : 'bg-[#333333]/20'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                (JSON.parse(selectedSection.layoutConfigJson || '{}').compactMode) ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs font-bold text-[#333333]">Width Mode</label>
            <select 
              className="w-full p-2 border border-[#333333]/20 rounded-md text-sm"
              value={JSON.parse(selectedSection.layoutConfigJson || '{}').widthMode || 'full'}
              onChange={(e) => {
                let config = {};
                try { config = JSON.parse(selectedSection.layoutConfigJson || '{}'); } catch(err) {}
                config.widthMode = e.target.value;
                updateSection.mutate({
                  templateId,
                  sectionId: selectedSection.id,
                  updates: { layoutConfigJson: JSON.stringify(config) }
                });
              }}
            >
              <option value="full">Full Width</option>
              <option value="half">Half (50%)</option>
              <option value="third">Third (33%)</option>
            </select>
          </div>
          
        </div>
      )}

      {/* Placeholder for selected component properties */}
      {!selectedSection && !selectedContainer && highlightedSectionId === null && selectedContainerId === null && (
         <div className="flex flex-col gap-4">
            <div className="text-[11px] font-bold text-[#6F7E64] uppercase tracking-wider mb-1">
              Component Properties
            </div>
            <div className="text-xs text-[#333333]">
               <p className="mb-2 font-bold opacity-80">Double-click on text blocks in the canvas to edit them.</p>
               <p className="opacity-60">To bind data, use the Data Source tab (coming soon).</p>
            </div>
         </div>
      )}

    </div>
  );
}
