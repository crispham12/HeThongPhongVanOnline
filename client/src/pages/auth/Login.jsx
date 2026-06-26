import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data?.user?.role === 1) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#fafafa]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#f1e5ed] blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#c9f0d2] blur-3xl opacity-40"></div>
      
      <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 px-6 py-12 relative z-10 items-center mx-auto">
        
        {/* Left Side: Value Prop (Minimal) */}
        <div className="hidden lg:flex flex-col gap-8 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
              <BrainCircuit className="w-5 h-5 text-[#333333]" />
            </div>
            <span className="font-extrabold text-[#333333] text-xl tracking-tight">AI Interview</span>
          </div>
          
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#151515] leading-[1.1] tracking-tight mb-4">
              Nâng tầm quy trình phỏng vấn của bạn.
            </h1>
            <p className="text-[17px] text-[#66767b] font-medium leading-relaxed">
              Đánh giá ứng viên chính xác, khách quan và tự động với công nghệ AI thông minh, giúp tiết kiệm thời gian và chi phí tuyển dụng.
            </p>
          </div>

          <div className="space-y-4">
            {['Đánh giá chuyên sâu 360 độ', 'Phản hồi chi tiết tức thì', 'Mô phỏng phỏng vấn thực tế'].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d9eccf] flex items-center justify-center border border-[#73836b]/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6f8066]" />
                </div>
                <span className="text-sm font-bold text-[#151515]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] mx-auto lg:ml-auto"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[24px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/30 rounded-[24px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                  <BrainCircuit className="w-4 h-4 text-[#333333]" />
                </div>
                <span className="font-extrabold text-[#333333]">AI Interview</span>
              </div>

              <div className="mb-8">
                <h2 className="text-[24px] font-black text-[#151515]">Đăng nhập</h2>
                <p className="text-[14px] font-medium text-[#66767b] mt-1.5">Vui lòng nhập thông tin để truy cập hệ thống.</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-5 p-3 rounded-xl bg-[#f1e5ed] border border-[#7d7280]/20 text-[#c20f16] text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c20f16] shrink-0" />
                  {error}
                </motion.div>
              )}

              <form id="form-login" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] mb-2" htmlFor="email">Email</label>
                  <input
                    id="email" type="email" required
                    placeholder="alex@company.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full h-[46px] px-4 bg-white/50 border border-white rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:border-[#e8e8e8] focus:ring-4 focus:ring-[#333333]/5 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]" htmlFor="password">Mật khẩu</label>
                    <a href="#" className="text-[11px] font-extrabold text-[#333333] hover:text-[#151515] hover:underline transition-colors">Quên mật khẩu?</a>
                  </div>
                  <div className="relative">
                    <input
                      id="password" type={showPw ? 'text' : 'password'} required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full h-[46px] pl-4 pr-11 bg-white/50 border border-white rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:border-[#e8e8e8] focus:ring-4 focus:ring-[#333333]/5 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b6b3b8] hover:text-[#333333] transition-colors w-6 h-6 flex items-center justify-center rounded-md">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <button id="btn-login-submit" type="submit" disabled={loading} 
                  className="w-full h-[46px] bg-[#2f2f2f] hover:bg-[#151515] text-white text-sm font-extrabold rounded-xl shadow-sm transition-all active:translate-y-px disabled:opacity-50 disabled:active:translate-y-0 flex items-center justify-center gap-2 mt-3">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : 'Đăng nhập vào hệ thống'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-[#dfe4e7]/50 text-center">
                <p className="text-sm font-medium text-[#66767b]">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="font-extrabold text-[#333333] hover:text-[#151515] hover:underline transition-colors">Đăng ký ngay</Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
