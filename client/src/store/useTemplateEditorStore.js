import { create } from 'zustand';
import { addNodeDeep, removeNodeDeep, updateNodeDeep } from '../utils/astHelpers';

const useTemplateEditorStore = create((set, get) => ({
  template: null,
  components: [],
  selectedNodeId: null,
  highlightedSectionId: null,
  selectedContainerId: null,
  activeLeftTab: 'components', // 'components' | 'layers' | 'sections'
  activeRightTab: 'style', // 'style' | 'layout' | 'data' | 'metadata'
  isPreviewMode: false,
  isSaving: false,

  setTemplate: (template) => set({ template }),
  setComponents: (components) => set({ components }),
  setHighlightedSectionId: (id) => set({ highlightedSectionId: id, selectedNodeId: null, selectedContainerId: null }),
  setSelectedContainerId: (id) => set({ selectedContainerId: id, highlightedSectionId: null, selectedNodeId: null }),
  
  selectNode: (id) => set({ selectedNodeId: id, highlightedSectionId: null, selectedContainerId: null }),
  clearSelection: () => set({ selectedNodeId: null, highlightedSectionId: null, selectedContainerId: null }),

  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  togglePreview: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
  setSaving: (status) => set({ isSaving: status }),

  // Actions for AST modifications using deep helpers
  addComponent: (comp, parentId = null) => set((state) => ({ 
    components: addNodeDeep(state.components, parentId, comp) 
  })),
  
  removeComponent: (id) => set((state) => ({
    components: removeNodeDeep(state.components, id),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
  })),
  
  updateComponent: (id, updates) => set((state) => ({
    components: updateNodeDeep(state.components, id, updates)
  })),
}));

export default useTemplateEditorStore;
