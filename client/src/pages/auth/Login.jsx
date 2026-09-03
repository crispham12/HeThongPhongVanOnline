import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const data = await loginWithGoogle(tokenResponse.access_token);
        if (data?.user?.role === 1) navigate('/admin/dashboard');
        else navigate('/dashboard');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Đăng nhập bằng Google thất bại.')
  });

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


              <div className="mb-8">
                <h2 className="text-[24px] font-black text-[#151515]">Đăng nhập</h2>
                <p className="text-[14px] font-medium text-[#66767b] mt-1.5">Vui lòng nhập thông tin để truy cập hệ thống.</p>
              </div>


              <form id="form-login" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] mb-2" htmlFor="email">Email</label>
                  <input
                    id="email" type="email" required
                    placeholder="alex@company.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className={`w-full h-[46px] px-4 bg-white/50 border ${error ? 'border-[#c20f16] focus:border-[#c20f16] focus:ring-[#c20f16]/10' : 'border-white focus:border-[#e8e8e8] focus:ring-[#333333]/5'} rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:ring-4 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm`}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]" htmlFor="password">Mật khẩu</label>
                    <Link to="/forgot-password" className="text-[11px] font-extrabold text-[#333333] hover:text-[#151515] hover:underline transition-colors">Quên mật khẩu?</Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password" type={showPw ? 'text' : 'password'} required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      className={`w-full h-[46px] pl-4 pr-11 bg-white/50 border ${error ? 'border-[#c20f16] focus:border-[#c20f16] focus:ring-[#c20f16]/10' : 'border-white focus:border-[#e8e8e8] focus:ring-[#333333]/5'} rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:ring-4 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b6b3b8] hover:text-[#333333] transition-colors w-6 h-6 flex items-center justify-center rounded-md">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#c20f16] text-[12px] font-bold mt-1.5">
                    {error}
                  </motion.p>
                )}
                
                <button id="btn-login-submit" type="submit" disabled={loading} 
                    className="w-full h-[46px] bg-[#B4F290] text-[#111827] hover:bg-[#9de675] text-sm font-extrabold rounded-xl shadow-sm transition-all active:translate-y-px disabled:opacity-50 disabled:active:translate-y-0 flex items-center justify-center gap-2 mt-3">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : 'Đăng nhập vào hệ thống'}
                </button>

                <div className="flex items-center gap-4 mt-6">
                  <div className="h-px bg-[#dfe4e7] flex-1"></div>
                  <span className="text-[11px] font-extrabold text-[#8d8a91] uppercase tracking-wider">Hoặc</span>
                  <div className="h-px bg-[#dfe4e7] flex-1"></div>
                </div>

                <button type="button" onClick={() => googleLogin()} disabled={loading} className="w-full h-[46px] bg-white border border-[#e8e8e8] hover:bg-[#fafafa] text-[#333333] text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Đăng nhập bằng Google
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
