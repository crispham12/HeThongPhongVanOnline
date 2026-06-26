import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronRight, Eye, Send, ArrowRight, Bold, Italic,
  List, Code, Link, Search, X, Check, Loader2, Sparkles, ChevronLeft
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
  'Java', 'JavaScript', 'C++', 'C#', 'Go', 'Rust'
];

// ─────────────────────────────────────────
// Section Container Component
// ─────────────────────────────────────────
function SectionCard({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F9FAFB]/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────
// Rich Text Toolbar
// ─────────────────────────────────────────
function RichToolbar({ onBold, onItalic, onUnderline, hasSelection }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-300 bg-gray-50/70">
      <button
        type="button"
        disabled={!hasSelection}
        onMouseDown={e => e.preventDefault()}
        onClick={onBold}
        className="px-2.5 py-1 rounded text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        B
      </button>
      <button
        type="button"
        disabled={!hasSelection}
        onMouseDown={e => e.preventDefault()}
        onClick={onItalic}
        className="px-2.5 py-1 rounded text-xs italic text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        I
      </button>
      <button
        type="button"
        disabled={!hasSelection}
        onMouseDown={e => e.preventDefault()}
        onClick={onUnderline}
        className="px-2.5 py-1 rounded text-xs underline text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        U
      </button>
    </div>
  );
}

export default function AdminAddQuestion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tags, setTags] = useState(['React', 'Frontend']);
  const [tagInput, setTagInput] = useState('');
  const [techStack, setTechStack] = useState(['TypeScript', 'Node.js']);
  const [techSearch, setTechSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);

  const editorRef = useRef(null);
  const isInitialized = useRef(false);
  const [hasSelection, setHasSelection] = useState(false);

  const checkSelection = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isInside = editorRef.current.contains(range.commonAncestorContainer);
        const hasSel = isInside && selection.toString().length > 0;
        setHasSelection(hasSel);

        if (isInside && !hasSel) {
          try {
            if (document.queryCommandState('underline')) {
              document.execCommand('underline', false, null);
            }
            if (document.queryCommandState('bold')) {
              document.execCommand('bold', false, null);
            }
            if (document.queryCommandState('italic')) {
              document.execCommand('italic', false, null);
            }
          } catch (err) {
            console.error("Failed to query or execute format clear command", err);
          }
        }
        return;
      }
    }
    setHasSelection(false);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'b' || key === 'i' || key === 'u') {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : '';
        if (selectedText.length === 0) {
          e.preventDefault();
        }
      }
    }
  };

  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      setValue('content', editorRef.current.innerHTML, { shouldValidate: true, shouldDirty: true });
      checkSelection();
    }
  };

  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      expectedAnswerGuide: '',
      exampleAnswer: '',
      category: 'Kỹ thuật',
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

  useEffect(() => {
    if (id) {
      const fetchDetail = async () => {
        setFetching(true);
        try {
          const data = await adminQuestionBankApi.getById(id);
          reset({
            title: data.title || '',
            content: data.content || '',
            expectedAnswerGuide: data.expectedAnswerGuide || '',
            exampleAnswer: data.exampleAnswer || '',
            category: data.category === 'Technical' ? 'Kỹ thuật' : (data.category || 'Kỹ thuật'),
            role: data.role || 'Software Engineer',
            difficulty: data.difficulty || 'Vừa',
            source: data.source || 'Human',
            aiModel: data.aiModel || 'GPT-4o',
            generationPrompt: data.generationPrompt || '',
            confidenceScore: data.confidenceScore || 92,
            status: data.status || 'Published',
            allowAIUse: data.allowAIUse !== false,
            allowRandomSelection: data.allowRandomSelection !== false,
            adminOnly: data.isClientVisible === false
          });
          isInitialized.current = false;

          if (data.tagsJson) {
            try {
              setTags(JSON.parse(data.tagsJson));
            } catch (e) {
              setTags([]);
            }
          }
          if (data.techStackJson) {
            try {
              setTechStack(JSON.parse(data.techStackJson));
            } catch (e) {
              setTechStack([]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch question details", error);
          setToast({
            type: 'error',
            message: 'Không thể tải chi tiết câu hỏi.'
          });
        } finally {
          setFetching(false);
        }
      };
      fetchDetail();
    }
  }, [id, reset]);

  const watchContent = watch('content') || '';

  useEffect(() => {
    if (editorRef.current && watchContent && !isInitialized.current) {
      editorRef.current.innerHTML = watchContent;
      isInitialized.current = true;
    }
  }, [watchContent]);
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

  // Set default role to 'All' when category is HR
  useEffect(() => {
    if (watchCategory === 'HR') {
      setValue('role', 'All');
    }
  }, [watchCategory, setValue]);

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

    try {
      const payload = {
        title: data.title,
        content: `${data.content}`,
        expectedAnswerGuide: data.expectedAnswerGuide || '',
        exampleAnswer: data.exampleAnswer || '',
        category: data.category === 'Kỹ thuật' ? 'Technical' : data.category,
        role: data.category === 'HR' ? 'All' : data.role,
        difficulty: data.difficulty,
        techStackJson: JSON.stringify(techStack),
        tagsJson: JSON.stringify(tags),
        source: data.source || 'Human',
        status: actionType === 'draft' ? 'Draft' : 'Published',
        allowAIUse: data.allowAIUse,
        allowRandomSelection: data.allowRandomSelection,
        isClientVisible: !data.adminOnly
      };

      if (id) {
        await adminQuestionBankApi.update(id, payload);
      } else {
        await adminQuestionBankApi.create(payload);
      }

      setToast({
        type: 'success',
        message: id
          ? 'Cập nhật câu hỏi thành công!'
          : (actionType === 'draft'
            ? 'Lưu câu hỏi nháp thành công!'
            : 'Xuất bản câu hỏi mới thành công!')
      });

      setTimeout(() => {
        navigate('/admin/question-bank');
      }, 1500);
    } catch (error) {
      console.error(error);
      setToast({
        type: 'error',
        message: 'Đã có lỗi xảy ra khi lưu câu hỏi.'
      });
    } finally {
      setLoading(false);
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
    <div className="pb-32 relative text-foreground">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-soft border ${toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-850'
              : 'bg-rose-50 border-rose-100 text-rose-850'
              }`}
          >
            <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>
            <div className="text-sm font-bold">{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1180px] mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6">
          <span className="hover:text-gray-900 cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-gray-900 cursor-pointer transition-colors" onClick={() => navigate('/admin/question-bank')}>Ngân hàng câu hỏi</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary">{id ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{id ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h1>
            <p className="text-sm text-gray-550 mt-1">{id ? 'Chỉnh sửa chi tiết câu hỏi cho hệ thống phỏng vấn AI.' : 'Tạo câu hỏi mới cho hệ thống phỏng vấn AI.'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-secondary"
            >
              <Eye className="w-4 h-4 text-gray-400" />
              Xem Preview
            </button>
            <button
              type="button"
              onClick={handleSubmit(data => onSubmit(data, 'publish'), onInvalid)}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {id ? 'Cập nhật câu hỏi' : 'Publish Question'}
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Form Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Section A: Question Content */}
            <SectionCard title="Nội dung câu hỏi">
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Tiêu đề câu hỏi <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="Nhập tiêu đề ngắn gọn cho câu hỏi..."
                  className={`w-full px-4 py-3 bg-[#F9FAFB] border ${errors.title ? 'border-rose-350 focus:ring-rose-100' : 'border-gray-250 focus:ring-primary/10'} rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:border-primary transition-all`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-500 font-bold mt-1.5">{errors.title.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Nội dung câu hỏi <span className="text-rose-500">*</span></label>
                  <span className="text-xs text-gray-400 font-semibold">{watchContent.length}/1000</span>
                </div>
                <textarea
                  rows={6}
                  {...register('content')}
                  placeholder="Mô tả chi tiết câu hỏi ở đây..."
                  className={`w-full px-4 py-3 bg-[#F9FAFB] border ${errors.content ? 'border-rose-350 focus:ring-rose-100' : 'border-gray-250 focus:ring-primary/10'} rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:border-primary transition-all resize-none`}
                />
                {errors.content && (
                  <p className="text-xs text-rose-500 font-bold mt-1.5">{errors.content.message}</p>
                )}
              </div>
            </SectionCard>


            {/* Section C: Optional Example Answer */}
            <SectionCard title="Câu trả lời mẫu">
              <textarea
                rows={4}
                {...register('exampleAnswer')}
                placeholder="Nhập ví dụ câu trả lời tốt để AI hoặc người dùng tham khảo..."
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-250 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
              />
            </SectionCard>

            {/* Section D: Tags Input */}
            <SectionCard title="Tags">
              <div className="flex flex-wrap gap-2 p-2.5 bg-[#F9FAFB] border border-gray-205 rounded-xl focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/15 text-primary text-xs font-bold rounded-lg border border-secondary/30">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-primary hover:text-primary-hover transition-colors">
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
                  className="flex-1 min-w-[120px] bg-transparent border-none p-0.5 text-sm focus:outline-none focus:ring-0 text-foreground placeholder-gray-400"
                />
              </div>
              <p className="text-[11px] text-gray-400 font-semibold mt-2">Nhấn Enter để thêm tag. Ví dụ: JWT, Authentication, SQL, etc.</p>
            </SectionCard>

          </div>

          {/* Right Column - Metadata Sidebar */}
          <div className="space-y-6">

            {/* Card 1: Main Metadata Config */}
            <SectionCard title="Thiết lập">
              <div className="space-y-5">
                {/* Category Dropdown */}
                <div>
                  <label className="label-caps mb-2 block">Phân loại</label>
                  <select
                    {...register('category')}
                    className="w-full py-3 px-4 bg-white border border-gray-255 rounded-xl text-sm font-semibold text-gray-750 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="Kỹ thuật">Kỹ thuật</option>
                    <option value="HR">HR</option>
                    <option value="Coding">Coding</option>
                  </select>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="label-caps mb-2 block">Vai trò</label>
                  <select
                    {...register('role')}
                    disabled={watchCategory === 'HR'}
                    className="w-full py-3 px-4 bg-white border border-gray-255 rounded-xl text-sm font-semibold text-gray-755 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {watchCategory === 'HR' ? (
                      <option value="All">All</option>
                    ) : (
                      <>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Fullstack Developer">Fullstack Developer</option>
                        <option value="AI Engineer">AI Engineer</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Difficulty Segmented Selector */}
                <div>
                  <label className="label-caps mb-2 block">Mức độ khó</label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 bg-[#F9FAFB] border border-gray-200 p-1.5 rounded-xl gap-1">
                        {['Dễ', 'Vừa', 'Khó'].map((diff) => {
                          const activeColors = {
                            'Dễ': 'bg-[#6F7E64] text-white shadow-sm',
                            'Vừa': 'bg-[#6B797C] text-white shadow-sm',
                            'Khó': 'bg-[#686069] text-white shadow-sm'
                          };
                          return (
                            <button
                              key={diff}
                              type="button"
                              onClick={() => field.onChange(diff)}
                              className={`py-2 rounded-lg text-xs font-bold text-center transition-all ${
                                field.value === diff
                                  ? activeColors[diff] || 'bg-primary-500 text-white shadow-sm'
                                  : 'text-gray-500 hover:text-primary-500 hover:bg-gray-100'
                              }`}
                            >
                              {diff}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Card 2: Tech Stack Multi-select */}
            <SectionCard title="Tech Stack">
              <div className="relative mb-3.5">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  placeholder="Tìm công nghệ..."
                  className="w-full bg-gray-50 border border-gray-205 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none placeholder-gray-400"
                />
              </div>

              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1.5">
                {filteredTech.map((tech) => (
                  <label key={tech} className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={techStack.includes(tech)}
                      onChange={() => toggleTech(tech)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#6F7E64] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">{tech}</span>
                  </label>
                ))}
                {filteredTech.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4 font-semibold">Không tìm thấy kết quả.</p>
                )}
              </div>
            </SectionCard>



            {/* Card 4: Status & Permissions */}
            <SectionCard title="Trạng thái & Quyền hạn">
              <div className="space-y-5">
                <div>
                  <label className="label-caps mb-2 block">Trạng thái hiện tại</label>
                  <select
                    {...register('status')}
                    className="w-full py-3 px-4 bg-white border border-gray-255 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer bg-white"
                  >
                    <option value="Draft">Bản nháp</option>
                    <option value="Published">Công khai</option>
                    <option value="Disabled">Vô hiệu hóa</option>
                  </select>
                </div>


              </div>
            </SectionCard>

          </div>

        </form>
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-205 px-6 py-4 flex items-center justify-between z-30 shadow-soft">
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
          {!id && (
            <button
              type="button"
              onClick={handleSubmit(data => onSubmit(data, 'draft'), onInvalid)}
              disabled={loading}
              className="px-6 py-2.5 bg-gray-105 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-75"
            >
              Lưu bản nháp
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit(data => onSubmit(data, 'publish'), onInvalid)}
            disabled={loading}
            className="btn-primary"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {id ? 'Cập nhật thay đổi' : 'Lưu & Công khai'}
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
            className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-3xl w-full max-w-2xl overflow-hidden shadow-soft border border-gray-205 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-150/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  <span className="font-bold text-foreground">Xem trước câu hỏi (Real-time Preview)</span>
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
                  <span className="px-3 py-1 bg-secondary/15 text-primary text-xs font-black rounded-full border border-secondary/30">
                    {watchCategory}
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20">
                    {watchRole}
                  </span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    watchDifficulty === 'Dễ' ? 'bg-[#F0F3EF] text-[#6F7E64] border-[#CBD9C6]' :
                    watchDifficulty === 'Vừa' ? 'bg-[#EFF2F3] text-[#6B797C] border-[#C6CFD1]' :
                    watchDifficulty === 'Khó' ? 'bg-[#F1EFF1] text-[#686069] border-[#D2CDD5]' :
                    'bg-amber-50 text-amber-850 border-amber-200'
                  }`}>
                    Mức độ: {watchDifficulty}
                  </span>
                  {watchSource === 'AI Assistant' && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full border border-emerald-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Generative AI
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-extrabold text-foreground">
                    {watchTitle || 'Tiêu đề câu hỏi sẽ hiển thị ở đây...'}
                  </h3>
                  <div
                    className="text-sm text-gray-600 leading-relaxed min-h-[60px] bg-gray-55 p-4 rounded-xl border border-gray-150/40"
                    dangerouslySetInnerHTML={{ __html: watchContent || 'Nội dung chi tiết của câu hỏi sẽ cập nhật tại đây khi bạn nhập vào form...' }}
                  />
                </div>

                {watchExpectedAnswerGuide && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-500 tracking-wide uppercase">Hướng dẫn đáp án mong đợi</h4>
                    <div className="text-sm text-gray-700 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/30 leading-relaxed whitespace-pre-wrap">
                      {watchExpectedAnswerGuide}
                    </div>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-500 tracking-wide uppercase">Tags liên quan</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200">
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
                        <span key={t} className="px-2.5 py-1 bg-secondary/15 text-primary text-xs font-bold rounded-lg border border-secondary/30">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-150/50 flex justify-end">
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn-primary"
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
