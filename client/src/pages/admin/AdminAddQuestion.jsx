import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ChevronRight, Eye, Send, ArrowRight, Bold, Italic, 
  List, Code, Link, Search, X, Check, Loader2, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminQuestionBankApi } from '../../services/questionBankApi';

// Form validation schema in Vietnamese
const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề câu hỏi.'),
  content: z.string().min(1, 'Vui lòng nhập nội dung câu hỏi.'),
  expectedAnswerGuide: z.string().optional(),
  exampleAnswer: z.string().optional(),
  category: z.string().min(1, 'Vui lòng chọn loại câu hỏi.'),
  role: z.string().min(1, 'Vui lòng chọn vai trò.'),
  difficulty: z.string().min(1, 'Vui lòng chọn mức độ khó.'),
  source: z.enum(['Human', 'AI Assistant']),
  aiModel: z.string().optional(),
  generationPrompt: z.string().optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  status: z.enum(['Draft', 'Published', 'Disabled']),
  allowAIUse: z.boolean().default(true),
  allowRandomSelection: z.boolean().default(true),
  adminOnly: z.boolean().default(false),
});

const DEFAULT_TECH_STACK = [
  'TypeScript', 'Node.js', 'PostgreSQL', 'React', 
  'ASP.NET Core', 'SQL', 'Docker', 'Python', 
  'JWT', 'Redis', 'EF Core', 'FastAPI'
];

export default function AdminAddQuestion() {
  const navigate = useNavigate();
  const [tags, setTags] = useState(['React', 'Frontend']);
  const [tagInput, setTagInput] = useState('');
  const [techStack, setTechStack] = useState(['TypeScript', 'Node.js']);
  const [techSearch, setTechSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { register, handleSubmit, control, watch, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      expectedAnswerGuide: '',
      exampleAnswer: '',
      category: 'Kỹ thuật (Technical)',
      role: 'Software Engineer',
      difficulty: 'Vừa',
      source: 'Human',
      aiModel: 'GPT-4o',
      generationPrompt: '',
      confidenceScore: 92,
      status: 'Published',
      allowAIUse: true,
      allowRandomSelection: true,
      adminOnly: false,
    }
  });

  const watchContent = watch('content') || '';
  const watchTitle = watch('title') || '';
  const watchExpectedAnswerGuide = watch('expectedAnswerGuide') || '';
  const watchCategory = watch('category');
  const watchRole = watch('role');
  const watchDifficulty = watch('difficulty');
  const watchSource = watch('source');

  // Trigger auto-dismiss of toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const toggleTech = (tech) => {
    if (techStack.includes(tech)) {
      setTechStack(techStack.filter(t => t !== tech));
    } else {
      setTechStack([...techStack, tech]);
    }
  };

  const onSubmit = async (data, actionType) => {
    setLoading(true);
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);

    try {
      const payload = {
        title: data.title,
        content: `${data.content}`,
        expectedAnswerGuide: data.expectedAnswerGuide || '',
        exampleAnswer: data.exampleAnswer || '',
        category: data.category === 'Kỹ thuật (Technical)' ? 'Technical' : data.category, // Map back to Technical
        role: data.role,
        difficulty: data.difficulty,
        techStackJson: JSON.stringify(techStack),
        tagsJson: JSON.stringify(tags),
        source: data.source,
        status: actionType === 'draft' ? 'Draft' : 'Published',
        allowAIUse: data.allowAIUse,
        allowRandomSelection: data.allowRandomSelection,
        isClientVisible: !data.adminOnly
      };

      await adminQuestionBankApi.create(payload);

      setToast({
        type: 'success',
        message: actionType === 'draft' 
          ? 'Lưu câu hỏi nháp thành công!' 
          : 'Xuất bản câu hỏi mới thành công!'
      });

      // Navigate back to the list page after showing toast
      setTimeout(() => {
        navigate('/admin/question-bank');
      }, 1500);
    } catch (error) {
      console.error(error);
      setToast({
        type: 'error',
        message: 'Đã có lỗi xảy ra khi lưu câu hỏi.'
      });
    }
  };

  const onInvalid = (errors) => {
    console.log('Validation Errors:', errors);
    const firstErrorMessage = Object.values(errors)[0]?.message || 'Vui lòng kiểm tra lại thông tin.';
    setToast({
      type: 'error',
      message: firstErrorMessage
    });
  };

  const filteredTech = DEFAULT_TECH_STACK.filter(tech => 
    tech.toLowerCase().includes(techSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 relative text-[#0F172A]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}
          >
            <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>
            <div className="text-sm font-bold">{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6">
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-gray-900 cursor-pointer transition-colors" onClick={() => navigate('/admin/question-bank')}>Ngân hàng câu hỏi</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#2563EB]">Thêm câu hỏi</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Thêm câu hỏi</h1>
            <p className="text-sm text-gray-500 mt-1">Tạo câu hỏi mới cho hệ thống phỏng vấn AI.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
            >
              <Eye className="w-4 h-4 text-gray-500" />
              Xem Preview
            </button>
            <button 
              type="button"
              onClick={handleSubmit(data => onSubmit(data, 'publish'), onInvalid)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-100 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish Question
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Form Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section A: Question Content */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-800 mb-2">Tiêu đề câu hỏi <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  {...register('title')}
                  placeholder="Nhập tiêu đề ngắn gọn cho câu hỏi..."
                  className={`w-full px-4 py-3 bg-white border ${errors.title ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:ring-blue-100'} rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:border-[#2563EB] transition-all`}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 font-bold mt-1.5">{errors.title.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-800">Nội dung câu hỏi <span className="text-red-500">*</span></label>
                  <span className="text-xs text-gray-400 font-semibold">{watchContent.length}/1000</span>
                </div>
                <textarea 
                  rows={6}
                  {...register('content')}
                  placeholder="Mô tả chi tiết câu hỏi ở đây..."
                  className={`w-full px-4 py-3 bg-white border ${errors.content ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:ring-blue-100'} rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:border-[#2563EB] transition-all resize-none`}
                />
                {errors.content && (
                  <p className="text-xs text-red-500 font-bold mt-1.5">{errors.content.message}</p>
                )}
              </div>
            </div>

            {/* Section B: Expected Answer Guide */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-gray-50/50">
                <span className="text-xs font-black text-gray-600 tracking-wider">HƯỚNG DẪN ĐÁP ÁN</span>
                <div className="flex items-center gap-1 text-gray-500">
                  <button type="button" className="p-1.5 hover:bg-gray-200 hover:text-gray-800 rounded transition-colors"><Bold className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 hover:bg-gray-200 hover:text-gray-800 rounded transition-colors"><Italic className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 hover:bg-gray-200 hover:text-gray-800 rounded transition-colors"><List className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button type="button" className="p-1.5 hover:bg-gray-200 hover:text-gray-800 rounded transition-colors"><Code className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 hover:bg-gray-200 hover:text-gray-800 rounded transition-colors"><Link className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-6">
                <textarea 
                  rows={5}
                  {...register('expectedAnswerGuide')}
                  placeholder="Viết các ý chính hoặc tiêu chí đánh giá cho câu trả lời đúng..."
                  className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] transition-all resize-none"
                />
              </div>
            </div>

            {/* Section C: Optional Example Answer */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <label className="block text-sm font-bold text-gray-800 mb-2">Ví dụ câu trả lời mẫu (Optional)</label>
              <textarea 
                rows={4}
                {...register('exampleAnswer')}
                placeholder="Nhập ví dụ câu trả lời tốt để AI hoặc người dùng tham khảo..."
                className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] transition-all resize-none"
              />
            </div>

            {/* Section D: Tags Input */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <label className="block text-sm font-bold text-gray-800 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 p-2.5 bg-white border border-[#E2E8F0] rounded-xl focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-[#2563EB] transition-all">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-blue-800 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Thêm tag..."
                  className="flex-1 min-w-[120px] bg-transparent border-none p-0.5 text-sm focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400"
                />
              </div>
              <p className="text-[11px] text-gray-400 font-semibold mt-2">Nhấn Enter để thêm tag. Ví dụ: JWT, Authentication, SQL, etc.</p>
            </div>

          </div>

          {/* Right Column - Metadata Sidebar */}
          <div className="space-y-6">
            
            {/* Card 1: Main Metadata Config */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Thiết lập</h2>
              
              <div className="space-y-5">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">Phân loại (Category)</label>
                  <select 
                    {...register('category')}
                    className="w-full py-3 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="Kỹ thuật (Technical)">Kỹ thuật (Technical)</option>
                    <option value="HR">HR</option>
                    <option value="Coding">Coding</option>
                    <option value="GitHub">GitHub</option>
                  </select>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">Vai trò (Role)</label>
                  <select 
                    {...register('role')}
                    className="w-full py-3 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] transition-all cursor-pointer"
                  >
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Fullstack Developer">Fullstack Developer</option>
                    <option value="AI Engineer">AI Engineer</option>
                  </select>
                </div>

                {/* Difficulty Segmented Selector */}
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">Mức độ khó</label>
                  <Controller 
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 bg-gray-50 border border-[#E2E8F0] p-1.5 rounded-xl gap-1">
                        {['Dễ', 'Vừa', 'Khó'].map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => field.onChange(diff)}
                            className={`py-2 rounded-lg text-xs font-bold text-center transition-all ${
                              field.value === diff 
                                ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-100' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Tech Stack Multi-select */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="text-sm font-black text-gray-800 tracking-wide uppercase mb-3.5">Tech Stack</h2>
              
              <div className="relative mb-3.5">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  placeholder="Tìm công nghệ..." 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] focus:outline-none placeholder-gray-400"
                />
              </div>

              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1.5">
                {filteredTech.map((tech) => (
                  <label key={tech} className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox"
                      checked={techStack.includes(tech)}
                      onChange={() => toggleTech(tech)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]/25 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">{tech}</span>
                  </label>
                ))}
                {filteredTech.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4 font-semibold">Không tìm thấy kết quả.</p>
                )}
              </div>
            </div>

            {/* Card 3: Question Source & Conditional AI Settings */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-gray-800 tracking-wide uppercase">Nguồn câu hỏi</h2>
              
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    value="Human"
                    {...register('source')}
                    className="w-4.5 h-4.5 text-[#2563EB] border-gray-300 focus:ring-[#2563EB]/25"
                  />
                  <span className="text-xs font-bold text-gray-700">Human</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    value="AI Assistant"
                    {...register('source')}
                    className="w-4.5 h-4.5 text-[#2563EB] border-gray-300 focus:ring-[#2563EB]/25"
                  />
                  <span className="text-xs font-bold text-gray-700">AI Assistant</span>
                </label>
              </div>

              {/* Conditional AI Fields */}
              <AnimatePresence>
                {watchSource === 'AI Assistant' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3 pt-3 border-t border-gray-100"
                  >
                    <div>
                      <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase">AI Model</label>
                      <select 
                        {...register('aiModel')}
                        className="w-full py-2 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] transition-all cursor-pointer"
                      >
                        <option value="GPT-4o">GPT-4o</option>
                        <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                        <option value="Gemini Pro 1.5">Gemini Pro 1.5</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase">Generation Prompt</label>
                      <textarea 
                        rows={3}
                        {...register('generationPrompt')}
                        placeholder="Prompt được sử dụng để generate..."
                        className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase">Confidence Score: {watch('confidenceScore')}%</label>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        {...register('confidenceScore', { valueAsNumber: true })}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Card 4: Status Selector & Permissions */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">Trạng thái hiện tại</label>
                <select 
                  {...register('status')}
                  className="w-full py-3 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] transition-all cursor-pointer"
                >
                  <option value="Draft">Draft (Bản nháp)</option>
                  <option value="Published">Published (Công khai)</option>
                  <option value="Disabled">Disabled (Vô hiệu hóa)</option>
                </select>
              </div>

              <div className="h-px bg-gray-100"></div>

              <div className="space-y-3">
                <label className="block text-xs font-black text-gray-500 mb-2 tracking-wide uppercase">Quyền sử dụng</label>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    {...register('allowAIUse')}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]/25 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Cho phép AI sử dụng câu hỏi này</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Sử dụng để huấn luyện AI hoặc chấm điểm</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    {...register('allowRandomSelection')}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]/25 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Cho phép random trong phỏng vấn</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Xuất hiện ngẫu nhiên trong bài test của ứng viên</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    {...register('adminOnly')}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]/25 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Chỉ hiển thị nội bộ admin</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Giới hạn xem đối với các tài khoản reviewer thông thường</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

        </form>
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-[#E2E8F0] px-6 py-4 flex items-center justify-between z-30 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/admin/question-bank')}
            className="px-5 py-2.5 text-gray-700 text-sm font-bold hover:bg-gray-50 rounded-xl transition-all"
          >
            Hủy bỏ
          </button>
          {isDirty && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold rounded-lg animate-pulse">
              Bạn có thay đổi chưa lưu.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleSubmit(data => onSubmit(data, 'draft'), onInvalid)}
            disabled={loading}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-75"
          >
            Lưu bản nháp
          </button>
          <button 
            type="button"
            onClick={handleSubmit(data => onSubmit(data, 'publish'), onInvalid)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-75"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Lưu & Công khai
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Preview Modal Overlay */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#2563EB]" />
                  <span className="font-bold text-gray-900">Xem trước câu hỏi (Real-time Preview)</span>
                </div>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full border border-indigo-100">
                    {watchCategory}
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-[#2563EB] text-xs font-black rounded-full border border-blue-100">
                    {watchRole}
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-black rounded-full border border-amber-100">
                    Mức độ: {watchDifficulty}
                  </span>
                  {watchSource === 'AI Assistant' && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full border border-emerald-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Generative AI
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-extrabold text-gray-900">
                    {watchTitle || 'Tiêu đề câu hỏi sẽ hiển thị ở đây...'}
                  </h3>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap min-h-[60px] bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {watchContent || 'Nội dung chi tiết của câu hỏi sẽ cập nhật tại đây khi bạn nhập vào form...'}
                  </div>
                </div>

                {watchExpectedAnswerGuide && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-500 tracking-wide uppercase">Hướng dẫn đáp án mong đợi</h4>
                    <div className="text-sm text-gray-700 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 leading-relaxed whitespace-pre-wrap">
                      {watchExpectedAnswerGuide}
                    </div>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-500 tracking-wide uppercase">Tags liên quan</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {techStack.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-500 tracking-wide uppercase">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-lg border border-blue-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="px-5 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                >
                  Đóng Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
