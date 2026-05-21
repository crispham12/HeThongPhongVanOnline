import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-6 py-12">
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">InterviewPro AI</span>
        </div>

        <div className="card shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">Start your AI-powered interview preparation journey.</p>

          {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          <form id="form-register" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" required placeholder="Alex Rivers" value={form.name} onChange={set('name')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" type="email" required placeholder="alex@company.com" value={form.email} onChange={set('email')} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPw ? 'text' : 'password'} required placeholder="Min 8 characters"
                  value={form.password} onChange={set('password')} className="input pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" type="password" required placeholder="Re-enter password"
                value={form.confirm} onChange={set('confirm')} className="input" />
            </div>
            <button id="btn-register-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
