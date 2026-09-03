import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setGeneralError('');
      try {
        const data = await loginWithGoogle(tokenResponse.access_token, true);
        if (data?.user?.role === 1) navigate('/admin/dashboard');
        else navigate('/dashboard');
      } catch (err) {
        setGeneralError(err.message || 'Đăng ký bằng Google thất bại.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setGeneralError('Đăng ký bằng Google thất bại.')
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});
    if (form.name.trim().length < 2) {
      setGeneralError('Họ tên phải có ít nhất 2 ký tự');
      return;
    }

    if (!form.email.endsWith('@gmail.com')) {
      setFieldErrors({ email: 'Email phải có định dạng @gmail.com' });
      return;
    }
    
    if (form.password.length < 8) {
      setFieldErrors({ password: 'Mật khẩu phải dài tối thiểu 8 ký tự' });
      return;
    }
    
    if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setFieldErrors({ password: 'Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 số' });
      return;
    }
    
    if (form.password !== form.confirm) { 
      setFieldErrors({ confirm: 'Mật khẩu xác nhận không khớp' }); 
      return; 
    }
    
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password);
      if (data?.user?.role === 1) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message?.replace(/\.$/, '') || 'Đăng ký thất bại. Vui lòng thử lại';
      if (errorMsg.includes('Email')) {
        setFieldErrors({ email: errorMsg });
      } else {
        setGeneralError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#fafafa]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#f1e5ed] blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[#c9f0d2] blur-3xl opacity-40"></div>
      
      <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 px-6 py-12 relative z-10 items-center mx-auto">
        
        {/* Left Side: Value Prop (Minimal) */}
        <div className="hidden lg:flex flex-col gap-8 pr-10">

          
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#151515] leading-[1.1] tracking-tight mb-4">
              Bắt đầu hành trình chinh phục nhà tuyển dụng.
            </h1>
            <p className="text-[17px] text-[#66767b] font-medium leading-relaxed">
              Trải nghiệm phỏng vấn mô phỏng với AI sát với thực tế, nhận báo cáo điểm mạnh yếu chi tiết để cải thiện bản thân.
            </p>
          </div>

          <div className="space-y-4">
            {['Hơn 500+ câu hỏi chuyên ngành', 'Phân tích kỹ năng lập trình thời gian thực', 'Đánh giá kỹ năng mềm (HR)'].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d9eccf] flex items-center justify-center border border-[#73836b]/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6f8066]" />
                </div>
                <span className="text-sm font-bold text-[#151515]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Glassmorphism Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] mx-auto lg:ml-auto"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[24px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/30 rounded-[24px] pointer-events-none" />
            
            <div className="relative z-10">


              <div className="mb-8">
                <h2 className="text-[24px] font-black text-[#151515]">Đăng ký tài khoản</h2>
                <p className="text-[14px] font-medium text-[#66767b] mt-1.5">Tạo tài khoản miễn phí để trải nghiệm ngay.</p>
              </div>

              {generalError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-5 p-3 rounded-xl bg-[#f1e5ed] border border-[#7d7280]/20 text-[#c20f16] text-xs font-bold flex items-center gap-2">
                  {generalError}
                </motion.div>
              )}

              <form id="form-register" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] mb-2" htmlFor="reg-name">Họ và tên</label>
                  <input
                    id="reg-name" type="text" required
                    placeholder="Nguyễn Văn A"
                    value={form.name}
                    onChange={set('name')}
                    className="w-full h-[46px] px-4 bg-white/50 border border-white rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:border-[#e8e8e8] focus:ring-4 focus:ring-[#333333]/5 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] mb-2" htmlFor="reg-email">Email</label>
                  <input
                    id="reg-email" type="email" required
                    placeholder="alex@company.com"
                    value={form.email}
                    onChange={set('email')}
                    className={`w-full h-[46px] px-4 bg-white/50 border ${fieldErrors.email ? 'border-[#c20f16] focus:border-[#c20f16] focus:ring-[#c20f16]/10' : 'border-white focus:border-[#e8e8e8] focus:ring-[#333333]/5'} rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:ring-4 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm`}
                  />
                  {fieldErrors.email && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#c20f16] text-[12px] font-bold mt-1.5">
                      {fieldErrors.email}
                    </motion.p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] mb-2" htmlFor="reg-password">Mật khẩu</label>
                  <div className="relative">
                    <input
                      id="reg-password" type={showPw ? 'text' : 'password'} required
                      placeholder="Tối thiểu 8 ký tự"
                      value={form.password}
                      onChange={set('password')}
                      className={`w-full h-[46px] pl-4 pr-11 bg-white/50 border ${fieldErrors.password ? 'border-[#c20f16] focus:border-[#c20f16] focus:ring-[#c20f16]/10' : 'border-white focus:border-[#e8e8e8] focus:ring-[#333333]/5'} rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:ring-4 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-[11px] text-[#b6b3b8] hover:text-[#333333] transition-colors w-6 h-6 flex items-center justify-center rounded-md">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#c20f16] text-[12px] font-bold mt-1.5">
                      {fieldErrors.password}
                    </motion.p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] mb-2" htmlFor="reg-confirm">Xác nhận mật khẩu</label>
                  <input
                    id="reg-confirm" type="password" required
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirm}
                    onChange={set('confirm')}
                    className={`w-full h-[46px] px-4 bg-white/50 border ${fieldErrors.confirm ? 'border-[#c20f16] focus:border-[#c20f16] focus:ring-[#c20f16]/10' : 'border-white focus:border-[#e8e8e8] focus:ring-[#333333]/5'} rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:ring-4 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm`}
                  />
                  {fieldErrors.confirm && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#c20f16] text-[12px] font-bold mt-1.5">
                      {fieldErrors.confirm}
                    </motion.p>
                  )}
                </div>
                
                <button id="btn-register-submit" type="submit" disabled={loading} 
                    className="w-full h-[46px] bg-[#B4F290] text-[#111827] hover:bg-[#9de675] text-sm font-extrabold rounded-xl shadow-sm transition-all active:translate-y-px disabled:opacity-50 disabled:active:translate-y-0 flex items-center justify-center gap-2 mt-4">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : 'Tạo tài khoản'}
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
                  Đăng ký bằng Google
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-[#dfe4e7]/50 text-center">
                <p className="text-sm font-medium text-[#66767b]">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="font-extrabold text-[#333333] hover:text-[#151515] hover:underline transition-colors">Đăng nhập</Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
