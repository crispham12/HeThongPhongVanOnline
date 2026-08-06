import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { BrainCircuit, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setError('Đường dẫn khôi phục mật khẩu không hợp lệ.');
    }
  }, [email, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Mật khẩu phải dài tối thiểu 8 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', { email, token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#fafafa]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#e5eff1] blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#f0c9f0] blur-3xl opacity-40"></div>
      
      <div className="w-full max-w-[480px] px-6 py-12 relative z-10 items-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[24px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/30 rounded-[24px] pointer-events-none" />
            
            <div className="relative z-10">


              {success ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className="w-16 h-16 bg-[#d9eccf] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#73836b]/20">
                    <CheckCircle2 className="w-8 h-8 text-[#6f8066]" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#151515] mb-2">Đổi mật khẩu thành công!</h3>
                  <p className="text-[#66767b] text-[14px] font-medium mb-6">
                    Mật khẩu của bạn đã được thay đổi. Đang tự động chuyển hướng về trang đăng nhập...
                  </p>
                  <Link to="/login" className="text-[13px] font-extrabold text-[#333333] hover:underline">
                    Đăng nhập ngay
                  </Link>
                </motion.div>
              ) : (
                <>
                  <div className="mb-8 text-center">
                    <h2 className="text-[24px] font-black text-[#151515]">Tạo mật khẩu mới</h2>
                    <p className="text-[14px] font-medium text-[#66767b] mt-2">
                      Vui lòng nhập mật khẩu mới cho tài khoản <strong className="text-[#333333]">{email}</strong>
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-5 p-3 rounded-xl bg-[#f1e5ed] border border-[#7d7280]/20 text-[#c20f16] text-xs font-bold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c20f16] shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] mb-2 block" htmlFor="password">Mật khẩu mới</label>
                      <div className="relative">
                        <input
                          id="password" type={showPw ? 'text' : 'password'} required minLength={8}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full h-[46px] pl-4 pr-11 bg-white/50 border border-white rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:border-[#e8e8e8] focus:ring-4 focus:ring-[#333333]/5 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm"
                        />
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b6b3b8] hover:text-[#333333] transition-colors w-6 h-6 flex items-center justify-center rounded-md">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] mb-2 block" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                      <div className="relative">
                        <input
                          id="confirmPassword" type={showConfirmPw ? 'text' : 'password'} required minLength={8}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full h-[46px] pl-4 pr-11 bg-white/50 border border-white rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:border-[#e8e8e8] focus:ring-4 focus:ring-[#333333]/5 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm"
                        />
                        <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b6b3b8] hover:text-[#333333] transition-colors w-6 h-6 flex items-center justify-center rounded-md">
                          {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <button type="submit" disabled={loading || !email || !token} 
                      className="w-full h-[46px] bg-[#B4F290] text-[#111827] hover:bg-[#151515]  text-sm font-extrabold rounded-xl shadow-sm transition-all active:translate-y-px disabled:opacity-50 disabled:active:translate-y-0 flex items-center justify-center gap-2 mt-3">
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : 'Lưu mật khẩu mới'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
