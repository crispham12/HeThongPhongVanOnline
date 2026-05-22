import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Sparkles, Sliders, Check, ChevronDown, ChevronRight, 
  User, Briefcase, GraduationCap, Code, Share2, Download, Plus, Minus, 
  Palette, Layers, Eye, RefreshCw, Trash2, Mail, Phone, MapPin, Globe, ExternalLink
} from 'lucide-react';
import api from '../lib/axios';

// Mock Template Previews Data (Image 1)
const TEMPLATES_LIST = [
  {
    id: 'cyberpunk-dev',
    name: 'Cyberpunk Dev',
    price: '$12.99',
    badge: 'BEST SELLER',
    badgeType: 'seller',
    tags: ['TECH', 'MODERN'],
    theme: 'dark',
    description: 'Neon accents and a high-tech dashboard structure for modern developers.',
    previewImg: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'executive-minimal',
    name: 'Executive Minimal',
    price: '$19.99',
    badge: '',
    tags: ['CLEAN', 'ATS'],
    theme: 'white',
    description: 'Ultra-clean, classic single-column template optimized for ATS parsing.',
    previewImg: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'nexus-pro',
    name: 'Nexus Pro',
    price: 'Free',
    badge: 'NITRO PACK',
    badgeType: 'nitro',
    tags: ['CREATIVE', 'ASYMMETRIC'],
    theme: 'asymmetric',
    description: 'High-end design system, bold typefaces, and visual progress bars.',
    previewImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'swiss-editorial',
    name: 'Swiss Editorial',
    price: '$15.00',
    badge: '',
    tags: ['DESIGN', 'LAYOUT'],
    theme: 'editorial',
    description: 'Elegant typographic hierarchy matching premium modern magazines.',
    previewImg: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=400&q=80'
  }
];

export default function CreateCV() {
  // Navigation & View States
  const [selectedTemplate, setSelectedTemplate] = useState(null); // 'cyberpunk-dev', etc.
  const [activeTab, setActiveTab] = useState('Marketplace'); // 'Marketplace' or 'Editor' or 'Preview'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Editor Layout & Control States
  const [openSection, setOpenSection] = useState('experience'); // 'personal', 'experience', 'education', 'skills'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activePalette, setActivePalette] = useState('blue'); // 'blue', 'indigo', 'emerald', 'amber', 'rose'
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // CV Content State (Pre-filled matching Image 2 "Alex Nguyen")
  const [cvTitle, setCvTitle] = useState('Senior Product Designer');
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'Alex Nguyen',
    title: 'Senior Product Designer & Systems Architect',
    email: 'alex.ng@nexus.design',
    phone: 'San Francisco, CA', // Using as location matching layout
    website: 'nexus.design',
    summary: 'Multi-disciplinary designer with 8+ years of experience engineering high-performance SaaS interfaces. Specialized in bridging the gap between complex data visualization and human-centric interaction design.'
  });
  
  const [experience, setExperience] = useState([
    {
      id: 1,
      role: 'Principal Systems Designer',
      company: 'AeroRecruit AI OS',
      period: '2021 - PRESENT',
      description: '• Architected the global design system powering 40+ recruitment modules.\n• Reduced interface friction by 22% through systematic UI audit.'
    }
  ]);
  
  const [education, setEducation] = useState([
    {
      id: 1,
      school: 'Stanford University',
      degree: 'M.S. Human-Computer Interaction',
      period: '2015 - 2017',
      gpa: '3.9/4.0'
    }
  ]);
  
  const [skills, setSkills] = useState(['React', 'JavaScript', 'Figma', 'Design Systems', 'Tailwind CSS', 'Node.js']);
  
  // New CV custom fields matching Image 2 Nexus Pro layout
  const [coreStack, setCoreStack] = useState(['DESIGN SYSTEMS', 'TAILWIND CSS']);
  const [proficiencies, setProficiencies] = useState([
    { id: 1, name: 'VISUAL SYSTEMS', value: 95 },
    { id: 2, name: 'UX PROTOTYPING', value: 90 },
    { id: 3, name: 'INTERACTIVE DESIGN', value: 85 }
  ]);
  
  const [languages, setLanguages] = useState([
    { name: 'Tiếng Anh', level: 'IELTS 8.0' },
    { name: 'Tiếng Việt', level: 'Bản ngữ' }
  ]);

  // AI Insights State
  const [aiScore, setAiScore] = useState(92);
  const [aiFeedback, setAiFeedback] = useState('Try adding more quantifiable metrics to your Shopify experience section to increase your impact score.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Resume A4 container ref for print targeting
  const printRef = useRef(null);

  // Initial Load CV from Database
  useEffect(() => {
    async function loadCV() {
      try {
        const res = await api.get('/cv');
        if (res.data) {
          const cv = res.data;
          setSelectedTemplate(cv.templateId);
          setActiveTab('Editor');
          setCvTitle(cv.title);
          
          if (cv.personalInfo) setPersonalInfo(JSON.parse(cv.personalInfo));
          if (cv.experience) setExperience(JSON.parse(cv.experience));
          if (cv.education) setEducation(JSON.parse(cv.education));
          if (cv.skills) setSkills(JSON.parse(cv.skills));
          if (cv.languages) setLanguages(JSON.parse(cv.languages));
          if (cv.coreStack) setCoreStack(JSON.parse(cv.coreStack));
          if (cv.proficiencies) setProficiencies(JSON.parse(cv.proficiencies));
          
          setAiScore(cv.aiScore);
          if (cv.aiFeedback) setAiFeedback(cv.aiFeedback);
        }
      } catch (err) {
        console.error('Lỗi khi tải CV:', err);
      }
    }
    loadCV();
  }, []);

  // Autosave Logic (Debounced)
  useEffect(() => {
    if (!selectedTemplate) return;
    
    const delayDebounceFn = setTimeout(async () => {
      setIsAutosaving(true);
      try {
        await api.post('/cv/save', {
          templateId: selectedTemplate,
          title: cvTitle,
          personalInfo: JSON.stringify(personalInfo),
          experience: JSON.stringify(experience),
          education: JSON.stringify(education),
          skills: JSON.stringify(skills),
          languages: JSON.stringify(languages),
          coreStack: JSON.stringify(coreStack),
          proficiencies: JSON.stringify(proficiencies)
        });
        setLastSaved(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Lỗi tự động lưu:', err);
      } finally {
        setIsAutosaving(false);
      }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [cvTitle, personalInfo, experience, education, skills, languages, coreStack, proficiencies, selectedTemplate]);

  // AI Improve Handler
  const handleAiImprove = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.post('/cv/analyze', {
        templateId: selectedTemplate || 'nexus-pro',
        title: cvTitle,
        personalInfo: JSON.stringify(personalInfo),
        experience: JSON.stringify(experience),
        education: JSON.stringify(education),
        skills: JSON.stringify(skills),
        languages: JSON.stringify(languages),
        coreStack: JSON.stringify(coreStack),
        proficiencies: JSON.stringify(proficiencies)
      });
      if (res.data) {
        setAiScore(res.data.score);
        setAiFeedback(res.data.feedback);
      }
    } catch (err) {
      console.error('Lỗi phân tích AI:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Form Adding/Removing Actions
  const addExperience = () => {
    setExperience([...experience, { id: Date.now(), role: '', company: '', period: '', description: '' }]);
  };

  const removeExperience = (id) => {
    setExperience(experience.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    setEducation([...education, { id: Date.now(), school: '', degree: '', period: '', gpa: '' }]);
  };

  const removeEducation = (id) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setSkills([...skills, e.target.value.trim()]);
      e.target.value = '';
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addCoreStack = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setCoreStack([...coreStack, e.target.value.trim().toUpperCase()]);
      e.target.value = '';
    }
  };

  const removeCoreStack = (index) => {
    setCoreStack(coreStack.filter((_, i) => i !== index));
  };

  const addProficiency = () => {
    setProficiencies([...proficiencies, { id: Date.now(), name: 'NEW SKILL', value: 80 }]);
  };

  const removeProficiency = (id) => {
    setProficiencies(proficiencies.filter(p => p.id !== id));
  };

  // Download PDF Handler via window.print() targeting only the resume
  const handleDownloadPDF = () => {
    window.print();
  };

  // Switch Template in Editor
  const handleSwitchTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    setActiveTab('Editor');
  };

  // Filter templates list
  const filteredTemplates = TEMPLATES_LIST.filter(tpl => {
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || tpl.tags.includes(activeFilter.toUpperCase()) || 
      (activeFilter === 'ATS Optimized' && tpl.tags.includes('ATS')) ||
      (activeFilter === 'Creative' && tpl.tags.includes('CREATIVE')) ||
      (activeFilter === 'Asymmetric' && tpl.tags.includes('ASYMMETRIC')) ||
      (activeFilter === 'Modern' && tpl.tags.includes('MODERN')) ||
      (activeFilter === 'Professional' && tpl.tags.includes('ATS'));
    return matchesSearch && matchesFilter;
  });

  // Color Palette styles map
  const palettes = {
    blue: { primary: 'text-blue-600', bg: 'bg-blue-600', border: 'border-blue-600', fill: 'bg-blue-500', bar: 'bg-blue-600' },
    indigo: { primary: 'text-indigo-600', bg: 'bg-indigo-600', border: 'border-indigo-600', fill: 'bg-indigo-500', bar: 'bg-indigo-600' },
    emerald: { primary: 'text-emerald-600', bg: 'bg-emerald-600', border: 'border-emerald-600', fill: 'bg-emerald-500', bar: 'bg-emerald-600' },
    amber: { primary: 'text-amber-600', bg: 'bg-amber-600', border: 'border-amber-600', fill: 'bg-amber-500', bar: 'bg-amber-600' },
    rose: { primary: 'text-rose-600', bg: 'bg-rose-600', border: 'border-rose-600', fill: 'bg-rose-500', bar: 'bg-rose-600' }
  };
  const activeColor = palettes[activePalette];

  return (
    <div className="relative min-h-screen bg-[#0f1115] text-[#e2e8f0] font-sans antialiased overflow-x-hidden print:bg-white print:text-black">
      
      {/* Dynamic Style Injection for Perfect Single-Page A4 PDF Printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, aside, header, .print-hide, button, .floating-controls {
            display: none !important;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}} />

      {/* HEADER NAVBAR (Image 1 & 2 layout merged beautifully) */}
      <header className="print-hide sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-[#131720]/80 backdrop-blur-md border-b border-[#202530]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-wider">AeroRecruit AI</span>
          </div>

          {/* Autosaved status indicator (Image 2 style) */}
          {selectedTemplate && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1c2230] rounded-full border border-[#2d364f]">
              <span className={`w-2 h-2 rounded-full ${isAutosaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#94a3b8]">
                {isAutosaving ? 'Saving...' : 'AUTOSAVED'}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Navigation Tabs (Marketplace <-> Editor/Preview switching) */}
        <nav className="flex items-center gap-8">
          <button 
            onClick={() => handleSwitchTemplate(selectedTemplate || 'nexus-pro')}
            className={`text-sm font-semibold py-1.5 transition-all relative ${activeTab === 'Editor' && selectedTemplate ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
          >
            Editor
          </button>
          <button 
            onClick={() => { if (selectedTemplate) { setSelectedTemplate(selectedTemplate); setActiveTab('Preview'); } }}
            disabled={!selectedTemplate}
            className={`text-sm font-semibold py-1.5 transition-all relative ${!selectedTemplate ? 'opacity-40 cursor-not-allowed' : ''} ${activeTab === 'Preview' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
          >
            Preview
          </button>
          <button 
            onClick={() => setActiveTab('Marketplace')}
            className={`text-sm font-semibold py-1.5 transition-all relative ${activeTab === 'Marketplace' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
          >
            Marketplace
          </button>
        </nav>

        {/* Global Action & Search Items */}
        <div className="flex items-center gap-4">
          {activeTab === 'Marketplace' && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search templates..." 
                className="pl-9 pr-4 py-2 w-48 text-xs bg-[#161a23]/60 border border-[#202530] rounded-full focus:outline-none focus:border-purple-500 transition-all text-[#e2e8f0]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#1c2230] rounded-full transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
          </button>

          {/* PDF Trigger */}
          <button 
            onClick={handleDownloadPDF} 
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-all active:scale-95 shadow-md shadow-purple-900/30"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT GATEWAY */}
      {activeTab === 'Marketplace' || !selectedTemplate ? (
        
        /* ------------------------------------------------------------- */
        /* VIEW 1: TEMPLATE SELECTOR MARKETPLACE (Image 1 style) */
        /* ------------------------------------------------------------- */
        <main className="print-hide max-w-7xl mx-auto px-8 py-16 animate-fade-in">
          {/* Header Title */}
          <div className="mb-12">
            <h1 className="text-5xl font-black text-white tracking-tight mb-4">Find your style</h1>
            <p className="text-lg text-gray-400 max-w-2xl font-light">
              Choose from hundreds of premium, high-converting resume templates designed for tech professionals.
            </p>
          </div>

          {/* Filtering & Layout Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-[#202530]">
            {/* Left Filter Pills */}
            <div className="flex flex-wrap gap-2.5">
              {['All', 'ATS Optimized', 'Modern', 'Professional', 'Fresher', 'Asymmetric', 'Creative'].map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                      isActive 
                        ? 'border-purple-500 bg-purple-950/30 text-white shadow-sm shadow-purple-500/10' 
                        : 'border-[#202530] bg-[#161a23]/30 text-gray-400 hover:border-[#2d364f] hover:text-white'
                    }`}
                  >
                    {isActive && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* Right sorting pills */}
            <div className="flex bg-[#161a23] p-1 rounded-full border border-[#202530]">
              {['For You', 'Trending', 'Newest'].map((sort) => (
                <button
                  key={sort}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    sort === 'For You' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>

          <button className="flex items-center gap-2 mb-8 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
            <Sliders className="w-4 h-4" /> All Filters
          </button>

          {/* Marketplace Grid (Mocked perfectly matching layouts in image 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((tpl) => (
              <div 
                key={tpl.id}
                onClick={() => handleSwitchTemplate(tpl.id)}
                className="group cursor-pointer flex flex-col bg-[#131720] border border-[#202530] rounded-2xl p-4 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Mock Template Image Canvas */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#0a0c10] mb-4 border border-[#1b202c]">
                  {/* Badge */}
                  {tpl.badge && (
                    <span className={`absolute top-3 left-3 z-10 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider text-white ${
                      tpl.badgeType === 'seller' ? 'bg-purple-600' : 'bg-pink-600'
                    }`}>
                      {tpl.badge}
                    </span>
                  )}
                  {/* Visual Mockup Layout (Represented by elegant unsplash placeholder with layout overlays) */}
                  <img 
                    src={tpl.previewImg} 
                    alt={tpl.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-transparent to-transparent" />
                  
                  {/* Dynamic hovering preview content */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                    <span className="px-5 py-2.5 bg-white text-black text-xs font-black uppercase tracking-wider rounded-lg shadow-lg">
                      Sử dụng mẫu này
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-extrabold text-white text-base group-hover:text-purple-400 transition-colors">
                      {tpl.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {tpl.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-black uppercase text-gray-500 border border-[#202530] px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    tpl.price === 'Free' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'text-gray-400'
                  }`}>
                    {tpl.price}
                  </span>
                </div>
                
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-2 mt-auto">
                  {tpl.description}
                </p>
              </div>
            ))}
          </div>
        </main>
      ) : (
        
        /* ------------------------------------------------------------- */
        /* VIEW 2: REAL-TIME RESUME EDITOR (Image 2 style) */
        /* ------------------------------------------------------------- */
        <main className="flex h-[calc(100vh-69px)] overflow-hidden">
          
          {/* LEFT SIDEBAR: INPUT CONTROL ACCORDIONS (Print hidden) */}
          <aside className="print-hide w-[360px] border-r border-[#202530] bg-[#11141c] flex flex-col justify-between overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Header Title */}
              <div>
                <p className="text-[9px] font-bold text-purple-400 tracking-widest uppercase mb-1">EDITING</p>
                <h2 className="text-xl font-bold text-white tracking-tight truncate">{personalInfo.fullName}</h2>
                <input 
                  type="text"
                  value={cvTitle}
                  onChange={(e) => setCvTitle(e.target.value)}
                  className="text-xs text-gray-400 bg-transparent border-b border-transparent hover:border-[#202530] focus:border-purple-500 focus:outline-none w-full py-0.5 mt-1 font-semibold"
                />
              </div>

              {/* Accordions Stack */}
              <div className="space-y-3">
                
                {/* 1. PERSONAL INFO SECTION */}
                <div className="border border-[#202530] rounded-xl overflow-hidden bg-[#161a24]/40">
                  <button 
                    onClick={() => setOpenSection(openSection === 'personal' ? '' : 'personal')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm hover:bg-[#1a202d] transition-colors"
                  >
                    <div className="flex items-center gap-3 text-gray-300">
                      <User className="w-4 h-4 text-purple-400" />
                      <span>Personal Info</span>
                    </div>
                    {openSection === 'personal' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  </button>
                  
                  {openSection === 'personal' && (
                    <div className="p-4 border-t border-[#202530] space-y-4 animate-fade-in bg-[#131720]/80">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Họ và tên</label>
                        <input 
                          type="text" 
                          className="w-full text-xs bg-[#0b0c10] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                          value={personalInfo.fullName} 
                          onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Chức danh / Vị trí</label>
                        <input 
                          type="text" 
                          className="w-full text-xs bg-[#0b0c10] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                          value={personalInfo.title} 
                          onChange={(e) => setPersonalInfo({...personalInfo, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Địa chỉ (Địa điểm)</label>
                        <input 
                          type="text" 
                          className="w-full text-xs bg-[#0b0c10] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                          value={personalInfo.phone} // mapping location info
                          onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Email</label>
                        <input 
                          type="email" 
                          className="w-full text-xs bg-[#0b0c10] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                          value={personalInfo.email} 
                          onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Website / Portfolio</label>
                        <input 
                          type="text" 
                          className="w-full text-xs bg-[#0b0c10] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                          value={personalInfo.website} 
                          onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Giới thiệu bản thân</label>
                        <textarea 
                          className="w-full text-xs bg-[#0b0c10] border border-[#202530] rounded-lg p-2 min-h-[80px] focus:outline-none focus:border-purple-500 text-white resize-none" 
                          value={personalInfo.summary} 
                          onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. EXPERIENCE SECTION (Image 2 active state) */}
                <div className="border border-[#202530] rounded-xl overflow-hidden bg-[#161a24]/40">
                  <button 
                    onClick={() => setOpenSection(openSection === 'experience' ? '' : 'experience')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm hover:bg-[#1a202d] transition-colors"
                  >
                    <div className="flex items-center gap-3 text-gray-300">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <span>Experience</span>
                    </div>
                    {openSection === 'experience' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  </button>
                  
                  {openSection === 'experience' && (
                    <div className="p-4 border-t border-[#202530] space-y-4 animate-fade-in bg-[#131720]/80">
                      {experience.map((exp, idx) => (
                        <div key={exp.id} className="relative p-3 bg-[#0d0f14] rounded-lg border border-[#202530] space-y-3">
                          <button 
                            onClick={() => removeExperience(exp.id)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-gray-500 uppercase">JOB TITLE</label>
                            <input 
                              type="text" 
                              className="w-full text-xs bg-[#161a24] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                              value={exp.role} 
                              onChange={(e) => {
                                const newExp = [...experience];
                                newExp[idx].role = e.target.value;
                                setExperience(newExp);
                              }}
                              placeholder="Job Title"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-gray-500 uppercase">COMPANY</label>
                            <input 
                              type="text" 
                              className="w-full text-xs bg-[#161a24] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                              value={exp.company} 
                              onChange={(e) => {
                                const newExp = [...experience];
                                newExp[idx].company = e.target.value;
                                setExperience(newExp);
                              }}
                              placeholder="Company"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-gray-500 uppercase">PERIOD</label>
                            <input 
                              type="text" 
                              className="w-full text-xs bg-[#161a24] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                              value={exp.period} 
                              onChange={(e) => {
                                const newExp = [...experience];
                                newExp[idx].period = e.target.value;
                                setExperience(newExp);
                              }}
                              placeholder="e.g. 2021 - PRESENT"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-gray-500 uppercase">MÔ TẢ CÔNG VIỆC</label>
                            <textarea 
                              className="w-full text-xs bg-[#161a24] border border-[#202530] rounded-lg p-2 min-h-[60px] focus:outline-none focus:border-purple-500 text-white resize-none" 
                              value={exp.description} 
                              onChange={(e) => {
                                const newExp = [...experience];
                                newExp[idx].description = e.target.value;
                                setExperience(newExp);
                              }}
                              placeholder="Bullet points describing tasks..."
                            />
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        onClick={addExperience}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-[#202530] hover:border-purple-500 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> + ADD EXPERIENCE
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. EDUCATION SECTION */}
                <div className="border border-[#202530] rounded-xl overflow-hidden bg-[#161a24]/40">
                  <button 
                    onClick={() => setOpenSection(openSection === 'education' ? '' : 'education')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm hover:bg-[#1a202d] transition-colors"
                  >
                    <div className="flex items-center gap-3 text-gray-300">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span>Education</span>
                    </div>
                    {openSection === 'education' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  </button>
                  
                  {openSection === 'education' && (
                    <div className="p-4 border-t border-[#202530] space-y-4 animate-fade-in bg-[#131720]/80">
                      {education.map((edu, idx) => (
                        <div key={edu.id} className="relative p-3 bg-[#0d0f14] rounded-lg border border-[#202530] space-y-3">
                          <button 
                            onClick={() => removeEducation(edu.id)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-gray-500 uppercase">TRƯỜNG HỌC</label>
                            <input 
                              type="text" 
                              className="w-full text-xs bg-[#161a24] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                              value={edu.school} 
                              onChange={(e) => {
                                const newEdu = [...education];
                                newEdu[idx].school = e.target.value;
                                setEducation(newEdu);
                              }}
                              placeholder="School Name"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-gray-500 uppercase">BẰNG CẤP</label>
                            <input 
                              type="text" 
                              className="w-full text-xs bg-[#161a24] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                              value={edu.degree} 
                              onChange={(e) => {
                                const newEdu = [...education];
                                newEdu[idx].degree = e.target.value;
                                setEducation(newEdu);
                              }}
                              placeholder="Degree / Major"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-gray-500 uppercase">THỜI GIAN</label>
                              <input 
                                type="text" 
                                className="w-full text-xs bg-[#161a24] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                                value={edu.period} 
                                onChange={(e) => {
                                    const newEdu = [...education];
                                    newEdu[idx].period = e.target.value;
                                    setEducation(newEdu);
                                }}
                                placeholder="Period"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-gray-500 uppercase">GPA</label>
                              <input 
                                type="text" 
                                className="w-full text-xs bg-[#161a24] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white" 
                                value={edu.gpa} 
                                onChange={(e) => {
                                    const newEdu = [...education];
                                    newEdu[idx].gpa = e.target.value;
                                    setEducation(newEdu);
                                }}
                                placeholder="GPA"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        onClick={addEducation}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-[#202530] hover:border-purple-500 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> + THÊM HỌC VẤN
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. SKILLS & STACK SECTION */}
                <div className="border border-[#202530] rounded-xl overflow-hidden bg-[#161a24]/40">
                  <button 
                    onClick={() => setOpenSection(openSection === 'skills' ? '' : 'skills')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm hover:bg-[#1a202d] transition-colors"
                  >
                    <div className="flex items-center gap-3 text-gray-300">
                      <Code className="w-4 h-4 text-purple-400" />
                      <span>Skills & Stack</span>
                    </div>
                    {openSection === 'skills' ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  </button>
                  
                  {openSection === 'skills' && (
                    <div className="p-4 border-t border-[#202530] space-y-4 animate-fade-in bg-[#131720]/80">
                      {/* Skills Tags */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Kỹ năng chung</label>
                        <input 
                          type="text" 
                          placeholder="Type skill & press Enter..." 
                          className="w-full text-xs bg-[#0b0c10] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white"
                          onKeyDown={addSkill}
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-[10px] bg-purple-950/40 text-purple-300 border border-purple-900 px-2 py-0.5 rounded-full">
                              {skill}
                              <button onClick={() => removeSkill(idx)} className="text-purple-400 hover:text-red-400">×</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Core Stack Tags (Image 2 visual style) */}
                      <div className="space-y-1 pt-2 border-t border-[#202530]/50">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Core Stack (Thanh Bên)</label>
                        <input 
                          type="text" 
                          placeholder="Type tech & press Enter..." 
                          className="w-full text-xs bg-[#0b0c10] border border-[#202530] rounded-lg p-2 focus:outline-none focus:border-purple-500 text-white"
                          onKeyDown={addCoreStack}
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {coreStack.map((tech, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-[9px] font-bold bg-[#1e293b] text-gray-300 border border-gray-700 px-2.5 py-0.5 rounded uppercase">
                              {tech}
                              <button onClick={() => removeCoreStack(idx)} className="text-gray-400 hover:text-red-400 ml-1">×</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Proficiency Progress Bars */}
                      <div className="space-y-2 pt-2 border-t border-[#202530]/50">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Mức Độ Thông Thạo</label>
                          <button onClick={addProficiency} className="text-[10px] font-bold text-purple-400 hover:text-purple-300">+ Thêm</button>
                        </div>
                        {proficiencies.map((p, idx) => (
                          <div key={p.id} className="space-y-1 bg-[#0d0f14] p-2 rounded-lg border border-[#202530]/50">
                            <div className="flex justify-between items-center">
                              <input 
                                type="text" 
                                className="text-[10px] font-bold bg-transparent text-gray-300 focus:outline-none border-b border-transparent focus:border-purple-500 w-32 uppercase" 
                                value={p.name}
                                onChange={(e) => {
                                  const newProf = [...proficiencies];
                                  newProf[idx].name = e.target.value;
                                  setProficiencies(newProf);
                                }}
                              />
                              <button onClick={() => removeProficiency(p.id)} className="text-gray-500 hover:text-red-400 text-xs">×</button>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range" 
                                min="0" max="100" 
                                className="w-full accent-purple-500 bg-[#1e293b] h-1 rounded-full cursor-pointer"
                                value={p.value}
                                onChange={(e) => {
                                  const newProf = [...proficiencies];
                                  newProf[idx].value = parseInt(e.target.value);
                                  setProficiencies(newProf);
                                }}
                              />
                              <span className="text-[10px] font-semibold text-purple-300 w-6 text-right">{p.value}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: AI INSIGHTS CARD (Image 2 style) */}
            <div className="p-6 border-t border-[#202530] bg-[#0c0e14]">
              <div className="bg-[#141721] border border-[#232938] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-[#94a3b8] uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> AI INSIGHTS
                    </span>
                    <div className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1">
                      {aiScore}<span className="text-xs text-gray-500 font-bold">/100</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider ${
                    aiScore >= 90 ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60' : 'bg-amber-950/60 text-amber-400 border border-amber-900/60'
                  }`}>
                    {aiScore >= 90 ? 'EXCELLENT' : 'GOOD'}
                  </span>
                </div>
                
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                  "{aiFeedback}"
                </p>

                <button 
                  onClick={handleAiImprove}
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center gap-2 mt-2 bg-[#2d324b] text-purple-200 text-xs font-bold py-2.5 rounded-lg border border-[#3e4566] hover:bg-[#343a59] hover:text-white transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing CV...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Improve
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>

          {/* MIDDLE WORKSPACE: RESUME CANVAS PREVIEW & ZOOM/THEME TOOLS */}
          <section className="flex-1 bg-[#090b0e] flex flex-col items-center justify-between overflow-hidden relative">
            
            {/* WORKSPACE PREVIEW TOOLBAR (Image 2 style) */}
            <div className="print-hide absolute top-6 z-20 flex items-center bg-[#131720]/80 backdrop-blur-md border border-[#202530] px-4 py-2 rounded-full gap-5 shadow-2xl">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#1c2230] transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold text-gray-300 w-10 text-center select-none">
                  {zoomLevel}%
                </span>
                <button 
                  onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#1c2230] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-[#202530]" />

              {/* Layer switch trigger icon */}
              <button className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#1c2230] transition-colors">
                <Layers className="w-3.5 h-3.5" />
              </button>

              {/* Theme Palette picker */}
              <div className="flex items-center gap-1.5">
                {['blue', 'indigo', 'emerald', 'amber', 'rose'].map((color) => {
                  const isActive = activePalette === color;
                  const bgColors = {
                    blue: 'bg-blue-500', indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500'
                  };
                  return (
                    <button
                      key={color}
                      onClick={() => setActivePalette(color)}
                      className={`w-3.5 h-3.5 rounded-full transition-transform ${bgColors[color]} ${
                        isActive ? 'scale-125 ring-2 ring-purple-500 ring-offset-2 ring-offset-[#090b0e]' : 'hover:scale-110'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* PREVIEW CONTAINER CANVAS (A4 Format) */}
            <div className="flex-1 w-full overflow-auto flex items-center justify-center p-8 pt-20">
              <div 
                ref={printRef}
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                className="print-container bg-white shadow-2xl rounded-sm w-[794px] min-w-[794px] h-[1123px] min-h-[1123px] text-black overflow-hidden flex flex-col transition-all duration-300 relative"
              >
                
                {/* ------------------------------------------------------------- */}
                /* TEMPLATE DESIGN 1: NEXUS PRO (Image 2 style) */
                /* ------------------------------------------------------------- */
                {selectedTemplate === 'nexus-pro' && (
                  <div className="flex flex-col h-full bg-white text-gray-900 p-12">
                    
                    {/* Header: Centered layout with avatar grid */}
                    <div className="flex justify-between items-start border-b-2 border-gray-900 pb-10 mb-8">
                      <div className="flex-1 pr-6">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 uppercase">
                          {personalInfo.fullName}
                        </h1>
                        <p className={`text-base font-bold uppercase tracking-wider mt-2 ${activeColor.primary}`}>
                          {personalInfo.title}
                        </p>
                        
                        {/* Contacts List */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {personalInfo.phone}</span>
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {personalInfo.email}</span>
                          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-gray-400" /> {personalInfo.website}</span>
                        </div>
                      </div>

                      {/* Profile Picture Mockup */}
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner flex items-center justify-center shrink-0">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" 
                          alt="Avatar"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>

                    {/* Content Section Split Grid */}
                    <div className="grid grid-cols-3 gap-8 flex-1">
                      
                      {/* MAIN COLUMN (Left 2 spans) */}
                      <div className="col-span-2 space-y-8 pr-4">
                        
                        {/* Professional Thesis (Summary) */}
                        <section className="space-y-3">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            PROFESSIONAL THESIS
                            <span className="flex-1 h-[1px] bg-gray-200"></span>
                          </h3>
                          <p className="text-[12px] text-gray-700 leading-relaxed font-medium">
                            {personalInfo.summary}
                          </p>
                        </section>

                        {/* Operational History (Experience) */}
                        <section className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            OPERATIONAL HISTORY
                            <span className="flex-1 h-[1px] bg-gray-200"></span>
                          </h3>
                          
                          <div className="space-y-6 relative pl-4 border-l border-gray-200">
                            {experience.map((exp) => (
                              <div key={exp.id} className="relative group">
                                {/* Timeline Dot Overlay matching image */}
                                <div className={`absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${activeColor.bg}`} />
                                
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="text-[13px] font-extrabold text-gray-900 uppercase tracking-tight">{exp.role}</h4>
                                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100">{exp.period}</span>
                                </div>
                                <div className={`text-[11px] font-bold mb-2 uppercase tracking-wide ${activeColor.primary}`}>{exp.company}</div>
                                <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line font-medium">
                                  {exp.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Academics (Education) */}
                        <section className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            ACADEMICS
                            <span className="flex-1 h-[1px] bg-gray-200"></span>
                          </h3>
                          
                          <div className="space-y-4">
                            {education.map((edu) => (
                              <div key={edu.id} className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-[12px] font-extrabold text-gray-900 uppercase">{edu.school}</h4>
                                  <p className="text-[11px] text-gray-500 mt-0.5 font-bold uppercase">{edu.degree}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-gray-400 block">{edu.period}</span>
                                  {edu.gpa && <span className={`text-[10px] font-black uppercase ${activeColor.primary}`}>GPA: {edu.gpa}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>

                      {/* SIDEBAR COLUMN (Right 1 span) */}
                      <div className="col-span-1 border-l border-gray-200 pl-6 space-y-8">
                        
                        {/* Core Stack Tags */}
                        <section className="space-y-3">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            CORE STACK
                          </h3>
                          <div className="flex flex-col gap-2">
                            {coreStack.map((tech, idx) => (
                              <div key={idx} className="text-[10px] font-bold bg-gray-50 border border-gray-200/60 rounded px-3 py-1.5 text-center text-gray-800 tracking-wider">
                                {tech}
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Proficiencies (Progress bars) */}
                        <section className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            PROFICIENCY
                          </h3>
                          <div className="space-y-3">
                            {proficiencies.map((p) => (
                              <div key={p.id} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-black text-gray-700 uppercase tracking-wider">
                                  <span>{p.name}</span>
                                  <span>{p.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all duration-1000 ${activeColor.bar}`} style={{ width: `${p.value}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Languages */}
                        <section className="space-y-3">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            LANGUAGES
                          </h3>
                          <ul className="space-y-2 text-[11px] font-bold text-gray-700">
                            {languages.map((lang, idx) => (
                              <li key={idx} className="flex justify-between uppercase">
                                {lang.name} <span className="text-gray-400">{lang.level}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                /* TEMPLATE DESIGN 2: EXECUTIVE MINIMAL (ATS Optimal style) */
                /* ------------------------------------------------------------- */
                {selectedTemplate === 'executive-minimal' && (
                  <div className="flex flex-col h-full bg-white text-gray-900 p-14 font-serif">
                    {/* Centered Classic Header */}
                    <div className="text-center space-y-2 border-b border-gray-300 pb-6 mb-6">
                      <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-900 font-sans">
                        {personalInfo.fullName}
                      </h1>
                      <p className={`text-sm font-semibold uppercase tracking-widest ${activeColor.primary} font-sans`}>
                        {personalInfo.title}
                      </p>
                      
                      <div className="flex justify-center items-center gap-3 text-[10px] text-gray-500 uppercase font-sans font-bold pt-1">
                        <span>{personalInfo.phone}</span>
                        <span>•</span>
                        <span>{personalInfo.email}</span>
                        <span>•</span>
                        <span>{personalInfo.website}</span>
                      </div>
                    </div>

                    <div className="space-y-6 flex-1 text-[11.5px] leading-relaxed">
                      
                      {/* Summary */}
                      <section className="space-y-2">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 font-sans border-b border-gray-200 pb-1">
                          Professional Summary
                        </h3>
                        <p className="text-gray-700 italic text-justify">
                          "{personalInfo.summary}"
                        </p>
                      </section>

                      {/* Experience */}
                      <section className="space-y-4">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 font-sans border-b border-gray-200 pb-1">
                          Experience
                        </h3>
                        <div className="space-y-4">
                          {experience.map((exp) => (
                            <div key={exp.id} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="font-bold text-[12px] text-gray-950 uppercase">{exp.role}</h4>
                                <span className="text-[10px] font-sans font-bold text-gray-500">{exp.period}</span>
                              </div>
                              <div className={`text-[11px] font-semibold italic ${activeColor.primary}`}>{exp.company}</div>
                              <p className="text-gray-600 leading-normal whitespace-pre-line text-justify pl-3 border-l border-gray-100">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Education */}
                      <section className="space-y-3">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 font-sans border-b border-gray-200 pb-1">
                          Education
                        </h3>
                        <div className="space-y-3">
                          {education.map((edu) => (
                            <div key={edu.id} className="flex justify-between items-baseline">
                              <div>
                                <h4 className="font-bold text-gray-900">{edu.school}</h4>
                                <p className="text-gray-500 italic">{edu.degree}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-sans block">{edu.period}</span>
                                {edu.gpa && <span className="text-[10.5px] font-sans font-bold">GPA: {edu.gpa}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Skills Grid */}
                      <section className="space-y-2">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 font-sans border-b border-gray-200 pb-1">
                          Skills & Core Stack
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                          <div>
                            <span className="font-bold text-gray-800 uppercase block text-[9.5px] mb-1 font-sans">Technical Competencies</span>
                            <p className="text-gray-600 font-sans">{skills.join(', ')}</p>
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 uppercase block text-[9.5px] mb-1 font-sans">Primary Architecture & Tech</span>
                            <p className="text-gray-600 font-sans">{coreStack.join(', ')}</p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                /* TEMPLATE DESIGN 3: CYBERPUNK DEV (Neon accent style) */
                /* ------------------------------------------------------------- */
                {selectedTemplate === 'cyberpunk-dev' && (
                  <div className="flex flex-col h-full bg-[#0a0d16] text-[#c9d1d9] p-12 border-4 border-[#1e2336] shadow-2xl relative font-mono">
                    {/* Decorative cyber grid line */}
                    <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-cyan-500" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-purple-500" />

                    {/* Cyberpunk console header */}
                    <div className="border-b border-[#1e2336] pb-8 mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase mb-1">SYSTEM_CANDIDATE_RECORD_ONLINE</div>
                          <h1 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-2">
                            {personalInfo.fullName}
                          </h1>
                          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mt-1">
                            &gt; {personalInfo.title}
                          </p>
                        </div>
                        <div className="text-right text-[10px] font-bold text-[#484f58]">
                          CLASS: HACKER_V1.0<br/>
                          IP: 192.168.100.80
                        </div>
                      </div>

                      {/* Connections */}
                      <div className="grid grid-cols-3 gap-2 mt-6 text-[10px] border border-[#1e2336] p-2.5 bg-[#0e111d] rounded">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-500" /> {personalInfo.phone}</span>
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-purple-500" /> {personalInfo.email}</span>
                        <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-cyan-500" /> {personalInfo.website}</span>
                      </div>
                    </div>

                    <div className="space-y-6 flex-1 text-xs">
                      
                      {/* Objective terminal block */}
                      <section className="bg-[#0e111d] border border-[#1e2336] p-4 rounded">
                        <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider mb-2">&gt; OBJECTIVE_SUMMARY.BAT</div>
                        <p className="text-[#8b949e] leading-relaxed italic">
                          "{personalInfo.summary}"
                        </p>
                      </section>

                      {/* Experience Timeline Console */}
                      <section className="space-y-3">
                        <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">&gt; STACK_OPERATIONS_HISTORY</div>
                        <div className="space-y-4">
                          {experience.map((exp) => (
                            <div key={exp.id} className="border-l-2 border-cyan-900 pl-4 space-y-1 relative">
                              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-cyan-400" />
                              <div className="flex justify-between items-baseline">
                                <h4 className="font-extrabold text-white text-[13px] tracking-wider uppercase">{exp.role}</h4>
                                <span className="text-[9px] text-[#484f58]">{exp.period}</span>
                              </div>
                              <div className="text-[10px] font-bold text-cyan-400 uppercase">{exp.company}</div>
                              <p className="text-[#8b949e] whitespace-pre-line leading-relaxed mt-1.5 pl-2 border-l border-[#1e2336]">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Technical skills binary representation */}
                      <section className="grid grid-cols-2 gap-4">
                        <div className="border border-[#1e2336] p-3 rounded bg-[#0e111d]">
                          <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider mb-2">RUN_SKILLS.EXE</div>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.map((skill, i) => (
                              <span key={i} className="text-[10px] border border-cyan-900 bg-cyan-950/20 text-cyan-300 px-2 py-0.5 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="border border-[#1e2336] p-3 rounded bg-[#0e111d]">
                          <div className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-2">RUN_STACK.EXE</div>
                          <div className="flex flex-wrap gap-1.5">
                            {coreStack.map((tech, i) => (
                              <span key={i} className="text-[10px] border border-purple-900 bg-purple-950/20 text-purple-300 px-2 py-0.5 rounded uppercase">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </section>

                      {/* Education console output */}
                      <section className="space-y-2">
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">&gt; EDUCATION_METADATA_LOAD</div>
                        {education.map((edu) => (
                          <div key={edu.id} className="flex justify-between items-center bg-[#0e111d] border border-[#1e2336] p-2 rounded">
                            <div>
                              <span className="font-extrabold text-white text-[11px] block">{edu.school}</span>
                              <span className="text-[10px] text-[#8b949e]">{edu.degree}</span>
                            </div>
                            <div className="text-right text-[10px]">
                              <span className="text-[#484f58] block">{edu.period}</span>
                              {edu.gpa && <span className="text-purple-400 font-bold">GPA: {edu.gpa}</span>}
                            </div>
                          </div>
                        ))}
                      </section>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                /* TEMPLATE DESIGN 4: SWISS EDITORIAL (Magazine modern style) */
                /* ------------------------------------------------------------- */
                {selectedTemplate === 'swiss-editorial' && (
                  <div className="flex flex-col h-full bg-white text-gray-900 p-14 font-sans tracking-tight">
                    {/* Left Heavy Grid Header */}
                    <div className="grid grid-cols-3 gap-6 border-b-4 border-black pb-8 mb-8">
                      <div className="col-span-2">
                        <h1 className="text-5xl font-black tracking-tighter text-gray-950 uppercase leading-none">
                          {personalInfo.fullName}
                        </h1>
                        <p className={`text-lg font-black tracking-tighter mt-3 uppercase border-t-2 border-black pt-2 ${activeColor.primary}`}>
                          {personalInfo.title}
                        </p>
                      </div>

                      {/* Compact Editorial contacts sidebar */}
                      <div className="col-span-1 text-[11px] font-bold text-gray-500 uppercase tracking-tight flex flex-col justify-end gap-1 text-right">
                        <span>Loc: {personalInfo.phone}</span>
                        <span>Mail: {personalInfo.email}</span>
                        <span>Web: {personalInfo.website}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-10 flex-1 text-[12px] leading-relaxed">
                      
                      {/* Heavy summary block on sidebar left column */}
                      <div className="col-span-1 space-y-8 pr-2">
                        <section className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-black border-b border-black pb-1">
                            SUMMARY
                          </h3>
                          <p className="text-gray-700 text-justify leading-relaxed font-medium">
                            {personalInfo.summary}
                          </p>
                        </section>

                        <section className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-black border-b border-black pb-1">
                            SKILLS
                          </h3>
                          <ul className="space-y-1 font-bold text-gray-700 uppercase">
                            {skills.map((skill, i) => <li key={i}>• {skill}</li>)}
                          </ul>
                        </section>

                        <section className="space-y-2">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-black border-b border-black pb-1">
                            LANGUAGES
                          </h3>
                          <ul className="space-y-1.5 font-bold text-gray-600 uppercase">
                            {languages.map((lang, idx) => (
                              <li key={idx} className="flex justify-between">
                                {lang.name} <span className="text-gray-400">{lang.level}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>

                      {/* Main multi-column experience and education right */}
                      <div className="col-span-2 space-y-8 pl-4 border-l border-gray-100">
                        
                        {/* Experience */}
                        <section className="space-y-4">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-black border-b border-black pb-1">
                            WORK HISTORY
                          </h3>
                          <div className="space-y-6">
                            {experience.map((exp) => (
                              <div key={exp.id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                  <h4 className="text-[14px] font-black text-gray-950 uppercase tracking-tighter">{exp.role}</h4>
                                  <span className="text-[10px] font-black text-gray-400 uppercase">{exp.period}</span>
                                </div>
                                <div className={`text-[11px] font-black uppercase tracking-wider ${activeColor.primary}`}>{exp.company}</div>
                                <p className="text-gray-600 text-justify pt-1 font-medium whitespace-pre-line">
                                  {exp.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Education */}
                        <section className="space-y-4">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-black border-b border-black pb-1">
                            ACADEMICS
                          </h3>
                          <div className="space-y-4">
                            {education.map((edu) => (
                              <div key={edu.id} className="flex justify-between items-baseline">
                                <div>
                                  <h4 className="font-black text-gray-900 uppercase tracking-tighter">{edu.school}</h4>
                                  <p className="text-gray-500 font-bold uppercase mt-0.5">{edu.degree}</p>
                                </div>
                                <div className="text-right text-[10px]">
                                  <span className="font-bold text-gray-400 block">{edu.period}</span>
                                  {edu.gpa && <span className={`font-black uppercase ${activeColor.primary}`}>GPA: {edu.gpa}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FLOATING ACTION OVERLAY CONTROLS (Image 2 style) */}
            <div className="print-hide absolute bottom-6 right-6 flex items-center gap-2">
              <button 
                onClick={handleAiImprove}
                className="w-11 h-11 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setActiveTab('Marketplace')}
                className="flex items-center gap-1.5 px-4 h-11 bg-[#1e2230] border border-[#2d364f] hover:border-purple-500/80 rounded-full text-xs font-bold text-gray-300 hover:text-white shadow-lg transition-all"
              >
                <Eye className="w-4 h-4 text-purple-400" /> Templates
              </button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
