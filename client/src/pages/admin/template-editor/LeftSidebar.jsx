import React, { useState } from 'react';
import { Search, User, FileText, Briefcase, GraduationCap, Eye, Info, Plus, Check, GripVertical, Folder, BadgeCheck, Layers, Heart, Clock, Type, FileBadge, Box, Grid, Copy, MoreVertical, ScanLine, Maximize2, Minimize2, ChevronRight, ChevronDown, File, Layout, Lock, Hash, Menu, AlertTriangle, MousePointer2, Settings, CheckCircle2 } from 'lucide-react';
import SectionsTab from './SectionsTab';
import ComponentsTab from './ComponentsTab';

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState('components');

  const coreSections = [
    {
      id: 'personal', icon: User, title: 'Personal Information',
      description: 'Identity, contact details, and profile basics',
      badges: ['Required', 'Single Instance'],
      status: 'added'
    },
    {
      id: 'summary', icon: FileText, title: 'Professional Summary',
      description: 'Short profile statement for ATS screening',
      badges: ['Required', 'ATS Friendly'],
      status: 'already'
    },
    {
      id: 'experience', icon: Briefcase, title: 'Experience',
      description: 'Employment history and role achievements',
      badges: ['Repeatable', 'Dynamic Data'],
      status: 'addable'
    },
    {
      id: 'education', icon: GraduationCap, title: 'Education',
      description: 'Academic history, degrees, and schools',
      badges: ['Repeatable', 'ATS Friendly'],
      status: 'added'
    }
  ];

  return (
    <div className="w-[320px] h-full border-r border-[#333333]/20 bg-[#FFFFFF] flex flex-col p-4 gap-4 shrink-0 font-sans">
      {/* Progress - only visible if needed, but in the screenshot it's still visible */}
      <div className="p-4 border border-[#333333]/20 rounded-xl bg-[#FFFFFF] shrink-0">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[11px] font-bold text-[#333333] uppercase tracking-wider">Progress</span>
          <span className="text-sm font-bold text-[#333333]">6 / 10</span>
        </div>
        <div className="h-1.5 w-full bg-[#333333]/10 rounded-full mb-4 overflow-hidden flex">
          <div className="h-full bg-[#6F7E64] w-[60%] rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-y-2 text-xs">
          <div className="font-semibold text-[#333333]">Core 4</div>
          <div className="font-semibold text-[#333333] text-right">Optional 2</div>
          <div className="font-medium text-[#333333]/60">Missing 1</div>
          <div className="font-medium text-[#333333]/60 text-right">ATS ready</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#333333]/5 p-1 rounded-xl gap-[2px] shrink-0">
        <button 
          onClick={() => setActiveTab('sections')}
          className={`flex-1 py-1.5 text-sm rounded-lg transition-colors ${activeTab === 'sections' ? 'bg-[#FFFFFF] font-semibold shadow-sm text-[#333333]' : 'font-medium text-[#333333]/60 hover:text-[#333333]'}`}
        >Sections</button>
        <button 
          onClick={() => setActiveTab('components')}
          className={`flex-1 py-1.5 text-sm rounded-lg transition-colors ${activeTab === 'components' ? 'bg-[#FFFFFF] font-semibold shadow-sm text-[#333333]' : 'font-medium text-[#333333]/60 hover:text-[#333333]'}`}
        >Components</button>
        <button 
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 text-sm rounded-lg transition-colors ${activeTab === 'layers' ? 'bg-[#FFFFFF] font-semibold shadow-sm text-[#333333]' : 'font-medium text-[#333333]/60 hover:text-[#333333]'}`}
        >Layers</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1 pb-4">
        {activeTab === 'sections' && (
          <SectionsTab />
        )}

        {activeTab === 'components' && (
          <ComponentsTab />
        )}
        {activeTab === 'layers' && (
          <>
            <div>
              <h3 className="text-[10px] font-bold text-[#333333]/50 uppercase tracking-wider mb-1">Layers Manager</h3>
              <h2 className="text-xl font-bold text-[#333333] mb-2 tracking-tight">Resume structure</h2>
              <p className="text-[11px] text-[#333333]/60 mb-4 leading-relaxed font-medium">
                Navigate, reorder, hide, lock, rename,<br />
                duplicate, and safely delete hierarchy<br />
                nodes. Styles stay in Properties.
              </p>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#333333]/40" />
                <input 
                  type="text" 
                  placeholder="Search any layer, section, component, or page..." 
                  className="w-full pl-9 pr-10 py-2.5 text-[10px] font-bold border border-[#333333]/20 rounded-lg outline-none focus:border-[#333333]/40 bg-[#FFFFFF] text-[#333333] placeholder-[#333333]/40 shadow-sm"
                />
                <div className="absolute right-3 top-2.5 px-2 py-0.5 bg-[#333333]/5 rounded-full text-[10px] font-bold text-[#333333]">3</div>
              </div>

              <div className="flex gap-2 mb-3">
                <button className="flex-1 py-2 flex items-center justify-center gap-1.5 bg-[#6F7E64] text-[#FFFFFF] rounded-lg text-[10px] font-bold hover:bg-[#6F7E64]/90 transition-colors shadow-sm">
                  <Maximize2 className="w-3.5 h-3.5" /> Expand All
                </button>
                <button className="flex-1 py-2 flex items-center justify-center gap-1.5 bg-[#FFFFFF] border border-[#333333]/20 text-[#333333] rounded-lg text-[10px] font-bold hover:bg-[#333333]/5 transition-colors shadow-sm">
                  <Minimize2 className="w-3.5 h-3.5" /> Collapse All
                </button>
              </div>

              {/* Breadcrumbs */}
              <div className="px-3 py-2 bg-[#333333]/5 border border-[#333333]/10 rounded-lg flex items-center gap-1.5 text-[10px] font-bold mb-3">
                <span className="text-[#333333]">Resume</span>
                <ChevronRight className="w-3 h-3 text-[#333333]/40" />
                <span className="text-[#333333]">Experience</span>
                <ChevronRight className="w-3 h-3 text-[#333333]/40" />
                <span className="text-[#333333]/60">Timeline</span>
              </div>

              {/* Page Toggles */}
              <div className="flex gap-2 mb-3">
                <button className="flex-1 py-1.5 bg-[#333333] text-[#FFFFFF] rounded-full text-[10px] font-bold shadow-sm">Page 1</button>
                <button className="flex-1 py-1.5 bg-[#FFFFFF] border border-[#333333]/20 text-[#333333]/70 rounded-full text-[10px] font-bold hover:bg-[#333333]/5 transition-colors">Page 2</button>
                <button className="flex-1 py-1.5 bg-[#FFFFFF] border border-[#333333]/20 text-[#333333]/70 rounded-full text-[10px] font-bold hover:bg-[#333333]/5 transition-colors">Page 3</button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="py-2 flex flex-col items-center justify-center bg-[#FFFFFF] border border-[#333333]/20 rounded-lg shadow-sm">
                  <span className="text-sm font-black text-[#333333]">42</span>
                  <span className="text-[8px] font-bold text-[#333333]/50 uppercase">Layers</span>
                </div>
                <div className="py-2 flex flex-col items-center justify-center bg-[#FFFFFF] border border-[#333333]/20 rounded-lg shadow-sm">
                  <span className="text-sm font-black text-[#333333]">3</span>
                  <span className="text-[8px] font-bold text-[#333333]/50 uppercase">Hidden</span>
                </div>
                <div className="py-2 flex flex-col items-center justify-center bg-[#FFFFFF] border border-[#333333]/20 rounded-lg shadow-sm">
                  <span className="text-sm font-black text-[#333333]">5</span>
                  <span className="text-[8px] font-bold text-[#333333]/50 uppercase">Locked</span>
                </div>
                <div className="py-2 flex flex-col items-center justify-center bg-[#FFFFFF] border border-[#333333]/20 rounded-lg shadow-sm">
                  <span className="text-sm font-black text-[#333333]">2</span>
                  <span className="text-[8px] font-bold text-[#333333]/50 uppercase">Errors</span>
                </div>
              </div>

              {/* Tree View */}
              <div className="border border-[#333333]/20 rounded-xl bg-[#FFFFFF] p-2 shadow-sm font-sans mb-4">
                {/* Root */}
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#333333]/5 group cursor-pointer mb-1">
                  <div className="flex items-center gap-1.5">
                    <ChevronDown className="w-3.5 h-3.5 text-[#333333]/60" />
                    <Layers className="w-4 h-4 text-[#333333]" />
                    <span className="text-[11px] font-bold text-[#333333]">Resume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#333333]/50 bg-[#333333]/5 px-1.5 py-0.5 rounded">Container</span>
                    <GripVertical className="w-3.5 h-3.5 text-[#333333]/30 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Page 1 */}
                <div className="ml-4 pl-2 border-l border-[#333333]/10">
                  <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#333333]/5 group cursor-pointer mb-1">
                    <div className="flex items-center gap-1.5">
                      <ChevronDown className="w-3.5 h-3.5 text-[#333333]/60" />
                      <File className="w-4 h-4 text-[#333333]/80" />
                      <span className="text-[11px] font-bold text-[#333333]">Page 1</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#333333]/50 bg-[#333333]/5 px-1.5 py-0.5 rounded">Static</span>
                  </div>

                  {/* Children of Page 1 */}
                  <div className="ml-4 pl-2 border-l border-[#333333]/10">
                    {/* Header */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#333333]/5 group cursor-pointer mb-1">
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-[#333333]/40" />
                        <Layout className="w-3.5 h-3.5 text-[#333333]/60" />
                        <span className="text-[11px] font-bold text-[#333333]">Header</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#333333]/40">
                        <Eye className="w-3.5 h-3.5" />
                        <Lock className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#333333]/5 group cursor-pointer mb-1">
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-[#333333]/40" />
                        <User className="w-3.5 h-3.5 text-[#333333]/60" />
                        <span className="text-[11px] font-bold text-[#333333]">Personal Information</span>
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-[#333333]/50 bg-[#333333]/5 px-1.5 py-0.5 rounded">Dynamic</span>
                    </div>

                    {/* Experience (Selected) */}
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#6F7E64]/10 border border-[#6F7E64]/20 cursor-pointer mb-1">
                      <div className="flex items-center gap-1.5">
                        <ChevronDown className="w-3.5 h-3.5 text-[#333333]/80" />
                        <Briefcase className="w-3.5 h-3.5 text-[#333333]" />
                        <span className="text-[11px] font-bold text-[#333333]">Experience</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[#FFFFFF] bg-[#6F7E64] px-1.5 py-0.5 rounded">Loop</span>
                        <Eye className="w-3.5 h-3.5 text-[#333333]/60" />
                        <div className="w-3 h-3 rounded-full border-[1.5px] border-[#333333]/40" />
                      </div>
                    </div>

                    {/* Children of Experience */}
                    <div className="ml-4 pl-2 border-l border-[#6F7E64]/30 mb-1">
                      {/* Timeline */}
                      <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#333333]/5 group cursor-pointer mb-1">
                        <div className="flex items-center gap-1.5">
                          <ChevronDown className="w-3.5 h-3.5 text-[#333333]/80" />
                          <Menu className="w-3.5 h-3.5 text-[#333333]/80" />
                          <span className="text-[11px] font-bold text-[#333333]">Timeline</span>
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[#333333] bg-[#333333]/10 px-1.5 py-0.5 rounded">Missing Binding</span>
                      </div>

                      {/* Children of Timeline */}
                      <div className="ml-4 pl-2 border-l border-[#333333]/10">
                        <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#333333]/5 group cursor-pointer mb-1">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#333333]/60" />
                            <span className="text-[11px] font-bold text-[#333333]">Achievement</span>
                          </div>
                          <Lock className="w-3 h-3 text-[#333333]/40" />
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#333333]/5 group cursor-pointer mb-1 opacity-60">
                          <div className="flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5 text-[#333333]/60" />
                            <span className="text-[11px] font-bold text-[#333333] line-through">Technology Tags</span>
                          </div>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#333333]/60 bg-[#333333]/10 px-1.5 py-0.5 rounded">Hidden</span>
                        </div>
                      </div>
                    </div>

                    {/* Rest of siblings */}
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#333333]/5 cursor-pointer mb-1">
                      <ChevronRight className="w-3.5 h-3.5 text-[#333333]/40" />
                      <GraduationCap className="w-3.5 h-3.5 text-[#333333]/60" />
                      <span className="text-[11px] font-bold text-[#333333]">Education</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#333333]/5 cursor-pointer mb-1">
                      <ChevronRight className="w-3.5 h-3.5 text-[#333333]/40" />
                      <Folder className="w-3.5 h-3.5 text-[#333333]/60" />
                      <span className="text-[11px] font-bold text-[#333333]">Projects</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#333333]/5 cursor-pointer mb-1">
                      <ChevronRight className="w-3.5 h-3.5 text-[#333333]/40" />
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#333333]/60" />
                      <span className="text-[11px] font-bold text-[#333333]">Skills</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#333333]/5 cursor-pointer mb-1">
                      <ChevronRight className="w-3.5 h-3.5 text-[#333333]/40" />
                      <Type className="w-3.5 h-3.5 text-[#333333]/60" />
                      <span className="text-[11px] font-bold text-[#333333]">Languages</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#333333]/5 cursor-pointer mb-1">
                      <ChevronRight className="w-3.5 h-3.5 text-[#333333]/40" />
                      <Box className="w-3.5 h-3.5 text-[#333333]/60" />
                      <span className="text-[11px] font-bold text-[#333333]">Components</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Structure validation */}
              <div className="p-4 rounded-xl bg-[#333333] text-[#FFFFFF] mb-3 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#FFFFFF]" />
                  <h5 className="text-[11px] font-bold uppercase tracking-wider">Structure validation</h5>
                </div>
                <ul className="text-[10px] font-medium leading-relaxed opacity-90 pl-4 list-disc space-y-1">
                  <li>Timeline has one missing binding</li>
                  <li>Technology Tags are hidden on Page 1</li>
                  <li>Projects section is empty</li>
                </ul>
              </div>

              {/* Hover preview */}
              <div className="p-3 border border-[#333333]/20 rounded-xl bg-[#FFFFFF] shadow-sm mb-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#333333]">
                    <MousePointer2 className="w-3.5 h-3.5 text-[#333333]/50" /> Hover preview
                  </div>
                  <span className="text-[10px] font-bold text-[#333333]/50">Experience</span>
                </div>
                <div className="border border-[#6F7E64] rounded p-2 bg-[#6F7E64]/5 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6F7E64] rounded-l" />
                  <div className="text-[8px] font-bold text-[#333333] mb-1">EXPERIENCE</div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-black text-[#333333]">LumHire AI</span>
                    <span className="text-[8px] font-bold text-[#333333]/50">2023 – Present</span>
                  </div>
                  <div className="h-1.5 bg-[#333333]/10 w-3/4 rounded-full mb-1" />
                  <div className="h-1.5 bg-[#333333]/10 w-1/2 rounded-full" />
                </div>
              </div>

              {/* Context menu actions */}
              <div className="p-4 border border-[#333333]/20 rounded-xl bg-[#FFFFFF] shadow-sm mb-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#333333] mb-3">
                  <Settings className="w-3.5 h-3.5 text-[#333333]/50" /> Context menu actions
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-[10px] font-bold text-[#333333]">
                  <div>Rename</div>
                  <div>Duplicate</div>
                  <div>Delete</div>
                  <div>Hide / Show</div>
                  <div>Lock / Unlock</div>
                  <div>Move Up / Down</div>
                </div>
              </div>

              {/* Highlight hint */}
              <div className="p-4 border border-[#333333]/10 rounded-xl bg-[#333333]/5 flex gap-3 items-center shadow-sm">
                <ScanLine className="w-4 h-4 text-[#333333]/60 shrink-0" />
                <p className="text-[10px] font-medium text-[#333333]/60 leading-relaxed">
                  Selecting a layer highlights the canvas;<br/>
                  selecting a canvas element highlights the layer.
                </p>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
