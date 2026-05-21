import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit, Eye, EyeOff, Loader2 } from 'lucide-react';
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
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-primary-700 to-primary-900 flex-col justify-between p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">InterviewPro AI</span>
        </div>
        <div>
          <blockquote className="bg-white/10 rounded-2xl p-6 mb-6">
            <div className="flex mb-3">{[...Array(5)].map((_,i)=><span key={i} className="text-yellow-400 text-sm">★</span>)}</div>
            <p className="text-white/90 text-sm italic mb-4">
              "The most reliable simulator I've used for technical candidate screening. It feels like having a senior engineer on every call."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">DC</div>
              <div>
                <p className="text-white text-sm font-semibold">David Chen</p>
                <p className="text-white/60 text-xs">Director of Engineering, TechScale</p>
              </div>
            </div>
          </blockquote>
          <div className="flex gap-6 text-white/50 text-xs">
            <span>ISO 27001 Certified</span>
            <span>GDPR Compliant</span>
            <span>Enterprise Ready</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          className="w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h1>
          <p className="text-gray-500 text-sm mb-8">Truy cập hệ thống mô phỏng phỏng vấn và phân tích kỹ năng của bạn.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <form id="form-login" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Địa chỉ Email</label>
              <input
                id="email" type="email" required
                placeholder="alex@company.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">Mật khẩu</label>
                <a href="#" className="text-xs text-primary-600 font-medium hover:underline">Quên mật khẩu?</a>
              </div>
              <div className="relative">
                <input
                  id="password" type={showPw ? 'text' : 'password'} required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button id="btn-login-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang đăng nhập…</> : 'Đăng nhập vào InterviewPro'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Đăng ký dùng thử miễn phí</Link>
          </p>

          <div className="mt-6 flex justify-center gap-6 text-xs text-gray-400">
            <span>🔒 Security Verified</span>
            <span>🔐 AES-256 Encrypted</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
