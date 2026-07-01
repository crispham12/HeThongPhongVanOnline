import React, { useEffect, useState } from 'react';
import { Search, Heart, Clock, User, Briefcase, Type, Eye, Plus, ScanLine, Layers } from 'lucide-react';
import useTemplateEditorStore from '../../../store/useTemplateEditorStore';
import useComponentsApi from '../../../hooks/api/useComponentsApi';

export default function ComponentsTab() {
  const { template, highlightedSectionId, selectedContainerId, components, setComponents } = useTemplateEditorStore();
  const { getComponentLibrary, addComponent, loading } = useComponentsApi();
  
  const [library, setLibrary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use either selected container or highlighted section as the target section
  const targetSectionId = highlightedSectionId || selectedContainerId;

  useEffect(() => {
    if (template) {
      loadLibrary();
    }
  }, [template?.id, targetSectionId]);

  const loadLibrary = async () => {
    try {
      const data = await getComponentLibrary(template.id, targetSectionId);
      setLibrary(data);
    } catch (err) {
      console.error('Failed to load component library', err);
    }
  };

  const handleAddComponent = async (compDef) => {
    if (!targetSectionId) {
      alert('Vui lòng chọn một Section hoặc Container trên canvas trước khi thêm Component.');
      return;
    }

    try {
      const parentId = selectedContainerId || null; // If a container is selected, it might be the parent, or the section is the parent
      const newComp = await addComponent(template.id, targetSectionId, {
        componentType: compDef.componentType,
        variant: compDef.defaultVariant,
        parentComponentId: null // We'll simplify and say all components go directly to section for now, unless we support nested components properly later
      });
      
      // Update local state by appending the new component
      setComponents([...components, newComp]);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thêm Component.');
    }
  };

  if (loading && !library) {
    return <div className="p-4 text-center text-[#333333]/60 text-xs">Loading library...</div>;
  }

  if (!library) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-[10px] font-bold text-[#333333]/50 uppercase tracking-wider mb-1">Component Library</h3>
        <h2 className="text-xl font-bold text-[#333333] mb-2 tracking-tight">Resume blocks</h2>
        <p className="text-[11px] text-[#333333]/60 mb-4 leading-relaxed font-medium">
          Browse, preview, drag, and insert<br />structured resume components.<br />
          Styling remains in Properties.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#333333]/40" />
          <input 
            type="text" 
            placeholder="Search by name, category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 text-[11px] font-medium border border-[#333333]/20 rounded-lg outline-none focus:border-[#333333]/40 bg-[#FFFFFF] text-[#333333] placeholder-[#333333]/40 shadow-sm"
          />
        </div>
      </div>

      {!targetSectionId && (
        <div className="p-4 border border-[#333333]/10 rounded-xl bg-[#333333]/5 flex gap-3 items-center shadow-sm">
          <ScanLine className="w-4 h-4 text-[#333333]/60 shrink-0" />
          <p className="text-[10px] font-medium text-[#333333]/60 leading-relaxed">
            Select a section or container before adding components.
          </p>
        </div>
      )}

      {targetSectionId && library.selectedSection && (
        <div className="p-3 border border-[#6F7E64]/30 rounded-xl bg-[#6F7E64]/5 shadow-sm mb-2">
          <p className="text-[11px] font-bold text-[#6F7E64] mb-1">Targeting Section</p>
          <p className="text-[10px] text-[#333333]/70">Adding to: {library.selectedSection.sectionType}</p>
        </div>
      )}

      {library.categories?.map((cat, idx) => {
        const items = cat.items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (items.length === 0) return null;

        return (
          <div key={idx} className="mt-2">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[11px] font-bold text-[#333333] flex items-center gap-1.5">
                {cat.name}
              </h4>
              <span className="text-[10px] font-bold text-[#333333]/40">{items.length} items</span>
            </div>
            
            {items.map(comp => (
              <div key={comp.id} className="p-4 border rounded-xl bg-[#FFFFFF] border-[#333333]/20 shadow-sm mb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#333333]/5 flex items-center justify-center shrink-0 border border-[#333333]/10">
                      <Layers className="w-5 h-5 text-[#6F7E64]" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#333333]">{comp.name}</h5>
                      <p className="text-[11px] text-[#333333]/60 mt-0.5 leading-relaxed font-medium">{comp.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {comp.isRepeatable && <span className="px-2 py-1 bg-[#333333]/5 text-[#333333]/70 rounded-md text-[9px] font-bold uppercase tracking-wide">Repeatable</span>}
                    {comp.isBindable && <span className="px-2 py-1 bg-[#333333]/5 text-[#333333]/70 rounded-md text-[9px] font-bold uppercase tracking-wide">Bindable</span>}
                  </div>
                  <button 
                    onClick={() => handleAddComponent(comp)}
                    disabled={!targetSectionId || loading}
                    className="px-4 py-1.5 text-xs font-bold bg-[#333333] text-[#FFFFFF] rounded-full hover:bg-[#333333]/90 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
