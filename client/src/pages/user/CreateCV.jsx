import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, Sparkles, Sliders, Check, ChevronDown, ChevronRight,
  User, Briefcase, GraduationCap, Code, Share2, Download, Plus, Minus,
  Palette, Layers, Eye, RefreshCw, Trash2, Mail, Phone, MapPin, Globe, ExternalLink,
  Shuffle, Bookmark, CheckCircle, FileText, Sparkle, Circle, ArrowLeft
} from 'lucide-react';
import api from '../../lib/axios';
import html2pdf from 'html2pdf.js';

// Mock Template Previews Data (Light Theme CV Architecture)
const TEMPLATES_LIST = [
  {
    id: 'nexus-pro',
    name: 'Modern Backend',
    price: 'Free',
    badge: '',
    tags: ['PROFESSIONAL'],
    theme: 'asymmetric',
    description: 'Optimized for technical leadership roles.',
    previewImg: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80',
    verified: true,
    badges: ['ATS-Friendly', '2-Page Ready']
  },
  {
    id: 'executive-minimal',
    name: 'Enterprise Lead',
    price: 'Free',
    badge: '',
    tags: ['PROFESSIONAL'],
    theme: 'white',
    description: 'High-impact for C-Suite and Directors.',
    previewImg: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
    bookmarked: true,
    badges: ['Executive', 'Grid-System']
  },
  {
    id: 'cyberpunk-dev',
    name: 'Creative Fullstack',
    price: 'Free',
    badge: '',
    tags: ['CREATIVE'],
    theme: 'dark',
    description: 'Dynamic layouts for product builders.',
    previewImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    circleIcon: true,
    badges: ['Visual', 'Portfolio Link']
  },
  {
    id: 'swiss-editorial',
    name: 'Academic Researcher',
    price: 'Free',
    badge: '',
    tags: ['MINIMAL', 'ACADEMIC'],
    theme: 'editorial',
    description: 'Structured for publications & patents.',
    previewImg: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=400&q=80',
    docIcon: true,
    badges: ['Minimal', 'Multi-Page']
  },
  {
    id: 'ai-generative',
    name: 'AI Generative',
    price: 'Free',
    badge: 'NEW',
    badgeType: 'nitro',
    tags: ['AI'],
    theme: 'ai',
    description: 'Real-time dynamic restructuring.',
    previewImg: '',
    aiIcon: true,
    badges: ['Proprietary', 'Smart-Grid'],
    isAiCard: true
  }
];

export default function CreateCV() {
  // Navigation & View States
  const [selectedTemplate, setSelectedTemplate] = useState(null); // 'cyberpunk-dev', etc.
  const [activeTab, setActiveTab] = useState('Marketplace'); // 'Marketplace' or 'Editor' or 'Preview'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Architectures');

  // Editor Layout & Control States
  const [openSection, setOpenSection] = useState('experience'); // 'personal', 'experience', 'education', 'skills'
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activePalette, setActivePalette] = useState('blue'); // 'blue', 'indigo', 'emerald', 'amber', 'rose'
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showZoomTools, setShowZoomTools] = useState(false);

  // CV Content State (Pre-filled matching Image 2 "Alex Nguyen")
  const [cvTitle, setCvTitle] = useState('Senior UX Designer Draft');
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'Alex Nguyen',
    title: 'Senior Product Designer & Systems Architect',
    email: 'alex.ng@aero-recruit.ai',
    phone: 'San Francisco, CA',
    website: 'alexn.design',
    summary: 'Multi-disciplinary designer with 8+ years of experience engineering high-performance SaaS interfaces. Specialized in bridging the gap between complex data visualization and human-centric interaction design. Proven track record in scaling design systems for Fortune 500 infrastructure projects.',
    certifications: [
      'Google Professional UX Certificate',
      'Interaction Design Foundation: Advanced Visuals'
    ]
  });

  const [experience, setExperience] = useState([
    {
      id: 1,
      role: 'Principal Systems Designer',
      company: 'AeroRecruit AI OS',
      period: '2021 — PRESENT',
      description: '• Architected the global design system powering 40+ recruitment modules.\n• Reduced interface friction by 22% through systematic UI audit and component redesign.\n• Led a cross-functional team of 12 designers and engineers across 3 time zones.'
    },
    {
      id: 2,
      role: 'Senior UI/UX Engineer',
      company: 'Nexus Data Infrastructure',
      period: '2018 — 2021',
      description: '• Designed the first automated ETL dashboard for enterprise data pipelines.\n• Implemented a WCAG 2.1 AA compliant component library used by 200k+ users.'
    }
  ]);

  const [education, setEducation] = useState([
    {
      id: 1,
      school: 'Class of 2016',
      degree: 'BFA in Communication Design',
      period: '',
      gpa: ''
    }
  ]);

  const [skills, setSkills] = useState(['Design Systems', 'Tailwind CSS', 'React / Next.js', 'Figma Advanced', 'User Research', 'Data Vis']);

  // New CV custom fields matching Image 2 Nexus Pro layout
  const [coreStack, setCoreStack] = useState(['DESIGN SYSTEMS', 'TAILWIND CSS', 'REACT / NEXT.JS', 'FIGMA ADVANCED', 'USER RESEARCH', 'DATA VIS']);
  const [proficiencies, setProficiencies] = useState([
    { id: 1, name: 'VISUAL SYSTEMS', value: 95 },
    { id: 2, name: 'INTERACTION DESIGN', value: 88 },
    { id: 3, name: 'FRONT-END DEV', value: 82 }
  ]);

  const [languages, setLanguages] = useState([
    { name: 'Tiếng Anh', level: 'IELTS 8.0' },
    { name: 'Tiếng Việt', level: 'Bản ngữ' }
  ]);

  // AI Insights State
  const [aiScore, setAiScore] = useState(92);
  const [aiFeedback, setAiFeedback] = useState('Try adding more quantifiable metrics to your Shopify experience section.');
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

          if (cv.personalInfo) {
            const parsed = JSON.parse(cv.personalInfo);
            if (!parsed.certifications) {
              parsed.certifications = [
                'Google Professional UX Certificate',
                'Interaction Design Foundation: Advanced Visuals'
              ];
            }
            setPersonalInfo(parsed);
          }
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

  // Download PDF Handler via html2pdf to export directly to file without print dialog
  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;

    // Save current style transform & transition to restore later
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;

    // Temporarily reset transform & transition for correct export sizing
    element.style.transform = 'none';
    element.style.transition = 'none';

    const opt = {
      margin: 0,
      filename: `${cvTitle ? cvTitle.replace(/\s+/g, '_') : 'CV'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { unit: 'px', format: [794, 1123], hotfixes: ['px_scaling'] }
    };

    // Export using html2pdf
    html2pdf().set(opt).from(element).save().then(() => {
      // Restore original style transform and transition
      element.style.transform = originalTransform;
      element.style.transition = originalTransition;
    }).catch(err => {
      console.error('Lỗi xuất PDF:', err);
      element.style.transform = originalTransform;
      element.style.transition = originalTransition;
    });
  };

  // Switch Template in Editor
  const handleSwitchTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    setActiveTab('Editor');
  };

  // Filter templates list
  const filteredTemplates = TEMPLATES_LIST.filter(tpl => {
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'All Architectures' || activeFilter === 'All') {
      return matchesSearch;
    }
    const filterUpper = activeFilter.toUpperCase();
    const matchesFilter = tpl.tags.some(tag => tag === filterUpper);
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

  const isMarketplace = activeTab === 'Marketplace' || !selectedTemplate;

  const handleFilterClick = (filter) => {
    if (filter === 'Randomize') {
      const selectable = TEMPLATES_LIST.filter(t => !t.isAiCard);
      const randomTpl = selectable[Math.floor(Math.random() * selectable.length)];
      handleSwitchTemplate(randomTpl.id);
    } else {
      setActiveFilter(filter);
    }
  };

  return (
    <div className="relative min-h-screen font-sans antialiased overflow-x-hidden print:bg-white print:text-black transition-colors duration-300 bg-[#f8fafc] text-slate-800">

      {/* Dynamic Style Injection for Perfect Single-Page A4 PDF Printing */}
      <style dangerouslySetInnerHTML={{
        __html: `
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

      {/* MAIN LAYOUT GATEWAY */}
      {activeTab === 'Marketplace' || !selectedTemplate ? (

        /* ------------------------------------------------------------- */
        /* VIEW 1: TEMPLATE SELECTOR MARKETPLACE (Light Theme style) */
        /* ------------------------------------------------------------- */
        <main className="print-hide max-w-7xl mx-auto px-8 pt-6 pb-16 animate-fade-in">
          {/* Header Title */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">Find your style</h1>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl font-normal leading-relaxed">
              Choose from hundreds of premium, high-converting resume templates designed for tech professionals.
            </p>
          </div>

          {/* Filtering & Layout Toolbar (Premium White Rounded Design) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
            {/* Left: Search input with light-gray rounded container */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates by role"
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 placeholder-slate-400 font-semibold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Right: Filters pills */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
              {['All Architectures', 'Professional', 'Creative', 'Minimal', 'Academic'].map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => handleFilterClick(filter)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border ${isActive
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm shadow-primary-600/10'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                      }`}
                  >
                    {filter}
                  </button>
                );
              })}

              {/* Randomize pill */}
              <button
                onClick={() => handleFilterClick('Randomize')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border bg-white border-slate-200/80 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Randomize
              </button>
            </div>
          </div>

          {/* Marketplace Grid (Modern light card grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((tpl) => {
              if (tpl.isAiCard) {
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSwitchTemplate(tpl.id)}
                    className="group cursor-pointer flex flex-col bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-primary-500/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Dashed/dotted primary-border container inside */}
                    <div className="relative aspect-[3/4] rounded-xl bg-slate-50/50 mb-4 border-2 border-dashed border-primary-200 hover:border-primary-400 flex flex-col items-center justify-center p-6 text-center transition-all bg-gradient-to-br from-primary-50/40 to-transparent">
                      <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4 shadow-sm">
                        <Sparkle className="w-7 h-7 animate-pulse" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm tracking-wide mb-2">Generate Architecture</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">
                        Let AI build a custom tailwind resume tailored to your specific background.
                      </p>
                      <button className="mt-4 px-4 py-2 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm shadow-primary-600/20 hover:bg-primary-700 transition-colors">
                        Generate Now
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="flex justify-between items-center mb-1.5">
                      <h3 className="font-bold text-slate-800 text-base group-hover:text-primary-600 transition-colors flex items-center gap-1.5">
                        {tpl.name}
                        {tpl.aiIcon && <Sparkle className="w-4.5 h-4.5 text-primary-500 fill-primary-500/10 shrink-0 animate-pulse" />}
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold">
                        {tpl.price}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
                      {tpl.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-slate-100">
                      {tpl.badges && tpl.badges.map((badge) => (
                        <span
                          key={badge}
                          className="text-[10px] font-bold tracking-wide text-slate-500 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSwitchTemplate(tpl.id)}
                  className="group cursor-pointer flex flex-col bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-primary-500/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Mock Template Image Canvas */}
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-4 border border-slate-200/60">
                    <img
                      src={tpl.previewImg}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" />

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900/30 backdrop-blur-[2px]">
                      <span className="px-5 py-2.5 bg-white text-slate-900 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Sử dụng mẫu này
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-primary-600 transition-colors flex items-center gap-1.5">
                      {tpl.name}
                      {tpl.verified && <CheckCircle className="w-4.5 h-4.5 text-blue-500 fill-blue-500/10 shrink-0" />}
                      {tpl.bookmarked && <Bookmark className="w-4.5 h-4.5 text-amber-500 fill-amber-500 shrink-0" />}
                      {tpl.circleIcon && <Circle className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500/10 shrink-0" />}
                      {tpl.docIcon && <FileText className="w-4.5 h-4.5 text-slate-400 shrink-0" />}
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold">
                      {tpl.price}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
                    {tpl.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-slate-100">
                    {tpl.badges && tpl.badges.map((badge) => (
                      <span
                        key={badge}
                        className="text-[10px] font-bold tracking-wide text-slate-500 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      ) : (

        /* ------------------------------------------------------------- */
        /* VIEW 2: REAL-TIME RESUME EDITOR (Light Premium Theme) */
        /* ------------------------------------------------------------- */
        <div className="flex flex-col h-screen overflow-hidden">
          {/* TOP BAR */}
          <header className="print-hide bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between shrink-0 select-none">
            {/* Left: Back button */}
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setActiveTab('Marketplace');
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-bold transition-all border border-slate-200/80 hover:border-slate-300 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Quay lại</span>
            </button>

            {/* Middle: Tab Switcher (Editor vs Preview) */}
            <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200">
              <button
                onClick={() => setActiveTab('Editor')}
                className={`px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all ${activeTab === 'Editor' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveTab('Preview')}
                className={`px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all ${activeTab === 'Preview' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Preview
              </button>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              <span
                onClick={() => setShowZoomTools(!showZoomTools)}
                className={`flex items-center gap-1.5 cursor-pointer select-none text-xs font-bold transition-all hover:opacity-80 ${showZoomTools ? 'text-blue-600' : 'text-slate-500'}`}
              >
                <Palette className="w-3.5 h-3.5" />
                Tùy chỉnh
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-all active:scale-95">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#0d1b3e] hover:bg-[#1a2d5c] text-white text-xs font-extrabold rounded-lg shadow-sm transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </header>

          {/* MAIN EDITING WORKSPACE CONTAINER */}
          <div className="flex flex-1 overflow-hidden">

            {/* LEFT SIDEBAR: INPUT CONTROL ACCORDIONS (Print hidden) */}
            {activeTab !== 'Preview' && (
              <aside className="print-hide w-[360px] border-r border-slate-200 bg-[#f1f5f9] flex flex-col justify-between overflow-y-auto">
                <div className="p-6 space-y-6">

                  {/* Header Title */}
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Editor</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-slate-500">Editing:</span>
                      <input
                        type="text"
                        value={cvTitle}
                        onChange={(e) => setCvTitle(e.target.value)}
                        className="text-xs font-bold text-slate-600 bg-transparent hover:bg-slate-200/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none rounded px-1.5 py-0.5 max-w-[200px] truncate"
                      />
                    </div>
                  </div>

                  {/* Accordions Stack */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3">RESUME ARCHITECTURE</p>

                    {/* 1. PERSONAL INFO SECTION */}
                    <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden mb-3">
                      <button
                        onClick={() => setOpenSection(openSection === 'personal' ? '' : 'personal')}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-slate-500" />
                          <span>Personal Info</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openSection === 'personal' ? 'rotate-90' : ''}`} />
                      </button>

                      {openSection === 'personal' && (
                        <div className="p-4 border-t border-slate-100 space-y-4 animate-fade-in bg-slate-50/50">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Họ và tên</label>
                            <input
                              type="text"
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                              value={personalInfo.fullName}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Chức danh / Vị trí</label>
                            <input
                              type="text"
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                              value={personalInfo.title}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Địa chỉ (Địa điểm)</label>
                            <input
                              type="text"
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                              value={personalInfo.phone}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Email</label>
                            <input
                              type="email"
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                              value={personalInfo.email}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Website / Portfolio</label>
                            <input
                              type="text"
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                              value={personalInfo.website}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Giới thiệu bản thân</label>
                            <textarea
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 resize-none font-semibold leading-relaxed"
                              value={personalInfo.summary}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. EXPERIENCE SECTION */}
                    <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden mb-3">
                      <button
                        onClick={() => setOpenSection(openSection === 'experience' ? '' : 'experience')}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-slate-500" />
                          <span>Experience</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openSection === 'experience' ? 'rotate-90' : ''}`} />
                      </button>

                      {openSection === 'experience' && (
                        <div className="p-4 border-t border-slate-100 space-y-4 animate-fade-in bg-slate-50/50">
                          {experience.map((exp, idx) => (
                            <div key={exp.id} className="relative p-3 bg-white rounded-lg border border-slate-200 space-y-3 shadow-sm">
                              <button
                                onClick={() => removeExperience(exp.id)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-500 uppercase">JOB TITLE</label>
                                <input
                                  type="text"
                                  className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
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
                                <label className="text-[8px] font-bold text-slate-500 uppercase">COMPANY</label>
                                <input
                                  type="text"
                                  className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
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
                                <label className="text-[8px] font-bold text-slate-500 uppercase">PERIOD</label>
                                <input
                                  type="text"
                                  className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
                                  value={exp.period}
                                  onChange={(e) => {
                                    const newExp = [...experience];
                                    newExp[idx].period = e.target.value;
                                    setExperience(newExp);
                                  }}
                                  placeholder="e.g. 2021 — PRESENT"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-500 uppercase">MÔ TẢ CÔNG VIỆC</label>
                                <textarea
                                  className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 min-h-[60px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 resize-none font-semibold"
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
                            className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 bg-white transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" /> + ADD EXPERIENCE
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 3. EDUCATION SECTION */}
                    <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden mb-3">
                      <button
                        onClick={() => setOpenSection(openSection === 'education' ? '' : 'education')}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-4 h-4 text-slate-500" />
                          <span>Education</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openSection === 'education' ? 'rotate-90' : ''}`} />
                      </button>

                      {openSection === 'education' && (
                        <div className="p-4 border-t border-slate-100 space-y-4 animate-fade-in bg-slate-50/50">
                          {education.map((edu, idx) => (
                            <div key={edu.id} className="relative p-3 bg-white rounded-lg border border-slate-200 space-y-3 shadow-sm">
                              <button
                                onClick={() => removeEducation(edu.id)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-500 uppercase">TRƯỜNG HỌC / THỜI GIAN</label>
                                <input
                                  type="text"
                                  className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
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
                                <label className="text-[8px] font-bold text-slate-500 uppercase">BẰNG CẤP / CHUYÊN NGÀNH</label>
                                <input
                                  type="text"
                                  className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
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
                                  <label className="text-[8px] font-bold text-slate-500 uppercase">PERIOD</label>
                                  <input
                                    type="text"
                                    className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
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
                                  <label className="text-[8px] font-bold text-slate-500 uppercase">GPA</label>
                                  <input
                                    type="text"
                                    className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
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
                            className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 bg-white transition-all shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" /> + THÊM HỌC VẤN
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 4. SKILLS & STACK SECTION */}
                    <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden mb-3">
                      <button
                        onClick={() => setOpenSection(openSection === 'skills' ? '' : 'skills')}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Code className="w-4 h-4 text-slate-500" />
                          <span>Skills & Stack</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openSection === 'skills' ? 'rotate-90' : ''}`} />
                      </button>

                      {openSection === 'skills' && (
                        <div className="p-4 border-t border-slate-100 space-y-4 animate-fade-in bg-slate-50/50">
                          {/* Skills Tags */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Kỹ năng chung</label>
                            <input
                              type="text"
                              placeholder="Type skill & press Enter..."
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-semibold"
                              onKeyDown={addSkill}
                            />
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {skills.map((skill, idx) => (
                                <span key={idx} className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
                                  {skill}
                                  <button onClick={() => removeSkill(idx)} className="text-blue-400 hover:text-red-500 ml-1">×</button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Core Stack Tags */}
                          <div className="space-y-1 pt-2 border-t border-slate-200">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Core Stack (Thanh Bên)</label>
                            <input
                              type="text"
                              placeholder="Type tech & press Enter..."
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-semibold"
                              onKeyDown={addCoreStack}
                            />
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {coreStack.map((tech, idx) => (
                                <span key={idx} className="flex items-center gap-1 text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 rounded uppercase">
                                  {tech}
                                  <button onClick={() => removeCoreStack(idx)} className="text-slate-400 hover:text-red-500 ml-1">×</button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Proficiency Progress Bars */}
                          <div className="space-y-2 pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Mức Độ Thông Thạo</label>
                              <button onClick={addProficiency} className="text-[10px] font-bold text-blue-600 hover:text-blue-500">+ Thêm</button>
                            </div>
                            {proficiencies.map((p, idx) => (
                              <div key={p.id} className="space-y-1 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center">
                                  <input
                                    type="text"
                                    className="text-[10px] font-bold bg-transparent text-slate-700 focus:outline-none border-b border-transparent focus:border-blue-500 w-32 uppercase"
                                    value={p.name}
                                    onChange={(e) => {
                                      const newProf = [...proficiencies];
                                      newProf[idx].name = e.target.value;
                                      setProficiencies(newProf);
                                    }}
                                  />
                                  <button onClick={() => removeProficiency(p.id)} className="text-slate-400 hover:text-red-500 text-xs">×</button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min="0" max="100"
                                    className="w-full accent-blue-600 bg-slate-200 h-1.5 rounded-full cursor-pointer"
                                    value={p.value}
                                    onChange={(e) => {
                                      const newProf = [...proficiencies];
                                      newProf[idx].value = parseInt(e.target.value);
                                      setProficiencies(newProf);
                                    }}
                                  />
                                  <span className="text-[10px] font-semibold text-blue-600 w-6 text-right">{p.value}%</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Certifications (matching screenshot) */}
                          <div className="space-y-2 pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Chứng Chỉ</label>
                              <button
                                onClick={() => {
                                  const newCerts = [...(personalInfo.certifications || [])];
                                  newCerts.push('NEW CERTIFICATE');
                                  setPersonalInfo({ ...personalInfo, certifications: newCerts });
                                }}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-500"
                              >
                                + Thêm
                              </button>
                            </div>
                            {(personalInfo.certifications || []).map((cert, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <input
                                  type="text"
                                  className="w-full text-xs bg-transparent text-slate-700 focus:outline-none border-b border-transparent focus:border-blue-500 font-semibold"
                                  value={cert}
                                  onChange={(e) => {
                                    const newCerts = [...personalInfo.certifications];
                                    newCerts[idx] = e.target.value;
                                    setPersonalInfo({ ...personalInfo, certifications: newCerts });
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newCerts = personalInfo.certifications.filter((_, i) => i !== idx);
                                    setPersonalInfo({ ...personalInfo, certifications: newCerts });
                                  }}
                                  className="text-slate-400 hover:text-red-500 text-xs px-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>

                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* BOTTOM SECTION: AI INSIGHTS CARD */}
                <div className="p-6 border-t border-slate-200 bg-slate-100/50">
                  <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black tracking-widest text-blue-600 uppercase flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-100 animate-pulse" /> AI INSIGHTS
                        </span>
                        <div className="text-xl font-black text-slate-800 mt-1.5 flex items-baseline gap-1">
                          Resume Score: <span className="text-blue-600">{aiScore}</span><span className="text-[10px] text-slate-400 font-bold">/100</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold italic">
                      "{aiFeedback}"
                    </p>

                    <button
                      onClick={handleAiImprove}
                      disabled={isAnalyzing}
                      className="w-full flex items-center justify-center gap-2 mt-1 bg-white hover:bg-slate-50 text-blue-600 text-xs font-bold py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" /> Analyzing CV...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-blue-500" /> AI Improve
                        </>
                      )}
                    </button>
                  </div>

                  {/* Invite Collaborator button */}
                  <button
                    className="w-full mt-4 bg-[#0252cf] hover:bg-[#0246b0] text-white text-xs font-extrabold py-3.5 rounded-xl shadow-md shadow-blue-500/10 transition-all active:scale-[0.98]"
                  >
                    Invite Collaborator
                  </button>
                </div>
              </aside>
            )}

            {/* MIDDLE WORKSPACE: RESUME CANVAS PREVIEW & ZOOM/THEME TOOLS */}
            <section className="flex-1 bg-slate-100/50 flex flex-col items-center justify-between overflow-hidden relative">

              {/* Floating Zoom & Color controls */}
              {showZoomTools && (
                <div className="print-hide absolute top-6 z-20 flex items-center bg-white/90 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-full gap-4 shadow-lg animate-fade-in">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                      className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-700 w-10 text-center select-none">
                      {zoomLevel}%
                    </span>
                    <button
                      onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                      className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="h-4 w-[1px] bg-slate-200" />

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
                          className={`w-3.5 h-3.5 rounded-full transition-transform ${bgColors[color]} ${isActive ? 'scale-125 ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-110'
                            }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PREVIEW CONTAINER CANVAS (A4 Format) */}
              <div className="flex-1 w-full overflow-auto flex items-start justify-center p-8 pt-6">
                <div
                  ref={printRef}
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="print-container bg-white shadow-2xl rounded-sm w-[794px] min-w-[794px] h-[1123px] min-h-[1123px] text-black overflow-hidden flex flex-col transition-all duration-300 relative border border-slate-200/80"
                >

                  {/* ------------------------------------------------------------- */}
                  {/* TEMPLATE DESIGN 1: NEXUS PRO (Image 2 style) */}
                  {/* ------------------------------------------------------------- */}
                  {selectedTemplate === 'nexus-pro' && (
                    <div className="flex flex-col h-full bg-white text-gray-900 p-12">

                      {/* Header: Centered layout with avatar grid */}
                      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-10 mb-8">
                        <div className="flex-1 pr-6">
                          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 uppercase">
                            {personalInfo.fullName}
                          </h1>
                          <p className="text-base font-bold uppercase tracking-wider mt-2 text-blue-600">
                            {personalInfo.title}
                          </p>

                          {/* Contacts List */}
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {personalInfo.phone}</span>
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> {personalInfo.email}</span>
                            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-500" /> {personalInfo.website}</span>
                          </div>
                        </div>

                        {/* Profile Picture Mockup */}
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner flex items-center justify-center shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                            alt="Avatar"
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>
                      </div>

                      {/* Content Section Split Grid */}
                      <div className="grid grid-cols-3 gap-8 flex-1">

                        {/* MAIN COLUMN (Left 2 spans) */}
                        <div className="col-span-2 space-y-8 pr-4">

                          {/* Professional Thesis (Summary) */}
                          <section className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                              PROFESSIONAL THESIS
                            </h3>
                            <p className="text-[12px] text-slate-700 leading-relaxed font-semibold">
                              {personalInfo.summary}
                            </p>
                          </section>

                          {/* Operational History (Experience) */}
                          <section className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                              OPERATIONAL HISTORY
                            </h3>

                            <div className="space-y-6 relative pl-4 border-l border-slate-200">
                              {experience.map((exp) => (
                                <div key={exp.id} className="relative group">
                                  {/* Timeline Dot Overlay matching image */}
                                  <div className="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-blue-600" />

                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-tight">{exp.role}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">{exp.period}</span>
                                  </div>
                                  <div className="text-[11px] font-bold mb-2 uppercase tracking-wide text-blue-600">{exp.company}</div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line font-semibold">
                                    {exp.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Academics (Education) */}
                          <section className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                              ACADEMIC FOUNDATION
                            </h3>

                            <div className="space-y-4">
                              {education.map((edu) => (
                                <div key={edu.id} className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-[12px] font-extrabold text-slate-800 uppercase">{edu.school}</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5 font-bold uppercase">{edu.degree}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 block">{edu.period}</span>
                                    {edu.gpa && <span className="text-[10px] font-black uppercase text-blue-600">GPA: {edu.gpa}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        </div>

                        {/* SIDEBAR COLUMN (Right 1 span) */}
                        <div className="col-span-1 border-l border-slate-200 pl-6 space-y-8">

                          {/* Core Stack Tags */}
                          <section className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              CORE STACK
                            </h3>
                            <div className="flex flex-col gap-2">
                              {coreStack.map((tech, idx) => (
                                <div key={idx} className="text-[10px] font-extrabold bg-blue-50 border border-blue-100 rounded-md px-3 py-1.5 text-center text-blue-600 tracking-wider">
                                  {tech}
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Proficiencies (Progress bars) */}
                          <section className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              PROFICIENCY
                            </h3>
                            <div className="space-y-3">
                              {proficiencies.map((p) => (
                                <div key={p.id} className="space-y-1">
                                  <div className="flex justify-between text-[9px] font-black text-slate-700 uppercase tracking-wider">
                                    <span>{p.name}</span>
                                    <span>{p.value}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-blue-600 transition-all duration-1000" style={{ width: `${p.value}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>

                          {/* Certifications */}
                          <section className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              CERTIFICATIONS
                            </h3>
                            <div className="space-y-3">
                              {(personalInfo.certifications || []).map((cert, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-[11px] font-extrabold text-slate-700 leading-tight">
                                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 fill-blue-50" />
                                  <span>{cert}</span>
                                </div>
                              ))}
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* TEMPLATE DESIGN 2: EXECUTIVE MINIMAL (ATS Optimal style) */}
                  {/* ------------------------------------------------------------- */}
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

                      <div className="space-y-6 flex-1 text-[11.5px] leading-relaxed font-sans">

                        {/* Summary */}
                        <section className="space-y-2">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 font-sans border-b border-gray-200 pb-1">
                            Professional Summary
                          </h3>
                          <p className="text-gray-700 italic text-justify leading-relaxed">
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
                                <div className="text-[11px] font-semibold italic text-blue-600">{exp.company}</div>
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
                  {/* TEMPLATE DESIGN 3: CYBERPUNK DEV (Neon accent style) */}
                  {/* ------------------------------------------------------------- */}
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
                            CLASS: HACKER_V1.0<br />
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
                  {/* TEMPLATE DESIGN 4: SWISS EDITORIAL (Magazine modern style) */}
                  {/* ------------------------------------------------------------- */}
                  {selectedTemplate === 'swiss-editorial' && (
                    <div className="flex flex-col h-full bg-white text-gray-900 p-14 font-sans tracking-tight">
                      {/* Left Heavy Grid Header */}
                      <div className="grid grid-cols-3 gap-6 border-b-4 border-black pb-8 mb-8">
                        <div className="col-span-2">
                          <h1 className="text-5xl font-black tracking-tighter text-gray-950 uppercase leading-none">
                            {personalInfo.fullName}
                          </h1>
                          <p className="text-lg font-black tracking-tighter mt-3 uppercase border-t-2 border-black pt-2 text-blue-600">
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
                            <p className="text-gray-700 text-justify leading-relaxed font-semibold">
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
                                  <div className="text-[11px] font-black uppercase tracking-wider text-blue-600">{exp.company}</div>
                                  <p className="text-gray-600 text-justify pt-1 font-semibold whitespace-pre-line">
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
                                    {edu.gpa && <span className="font-black uppercase text-blue-600">GPA: {edu.gpa}</span>}
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


            </section>
          </div>
        </div>
      )}
    </div>
  );
}
