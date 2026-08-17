import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không đúng định dạng');
      setLoading(false);
      return;
    }
    
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
    } catch (err) {
      setError(err.response?.data?.message?.replace(/\.$/, '') || 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#fafafa]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#e5f1ed] blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[#f0c9d6] blur-3xl opacity-40"></div>
      
      <div className="w-full max-w-[480px] px-6 py-12 relative z-10 items-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[24px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/30 rounded-[24px] pointer-events-none" />
            
            <div className="relative z-10">


              <div className="mb-8 text-center">
                <h2 className="text-[24px] font-black text-[#151515]">Quên mật khẩu?</h2>
                <p className="text-[14px] font-medium text-[#66767b] mt-2">
                  Đừng lo lắng! Vui lòng nhập email bạn đã đăng ký, chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
                </p>
              </div>

              {isSent ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className="w-16 h-16 bg-[#d9eccf] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#73836b]/20">
                    <svg className="w-8 h-8 text-[#6f8066]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-bold text-[#151515] mb-2">Đã gửi email khôi phục</h3>
                  <p className="text-[#66767b] text-[14px] font-medium mb-6">
                    Vui lòng kiểm tra hộp thư đến của <strong>{email}</strong> và làm theo hướng dẫn.
                  </p>
                  <button onClick={() => setIsSent(false)} className="text-[13px] font-extrabold text-[#333333] hover:underline">
                    Thử email khác
                  </button>
                </motion.div>
              ) : (
                <form id="form-forgot-password" onSubmit={handleSubmit} className="space-y-5">

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] mb-2" htmlFor="email">Email đăng ký</label>
                    <input
                      id="email" type="email" required
                      placeholder="alex@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`w-full h-[46px] px-4 bg-white/50 border ${error ? 'border-[#c20f16] focus:border-[#c20f16] focus:ring-[#c20f16]/10' : 'border-white focus:border-[#e8e8e8] focus:ring-[#333333]/5'} rounded-xl text-sm font-bold text-[#333333] outline-none transition-all focus:bg-white focus:ring-4 placeholder:text-[#b6b3b8] placeholder:font-semibold shadow-sm`}
                    />
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#c20f16] text-[12px] font-bold mt-1.5">
                        {error}
                      </motion.p>
                    )}
                  </div>
                  
                  <button id="btn-forgot-submit" type="submit" disabled={loading} 
                    className="w-full h-[46px] bg-[#B4F290] text-[#111827] hover:opacity-90 text-sm font-extrabold rounded-xl shadow-sm transition-all active:translate-y-px disabled:opacity-50 disabled:active:translate-y-0 flex items-center justify-center gap-2 mt-3">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : 'Gửi liên kết khôi phục'}
                  </button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-[#dfe4e7]/50 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#66767b] hover:text-[#151515] transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
