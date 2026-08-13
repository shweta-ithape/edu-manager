import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await login(email, password);

      if (user.role === 'ADMIN') navigate('/dashboard/admin');
      else if (user.role === 'TRAINER') navigate('/dashboard/trainer');
      else if (user.role === 'STUDENT') navigate('/dashboard/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Login Demo Helper
  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-8 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl mb-3 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Training Institute Portal</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-sm flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institute.com"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-5">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Create Student Account
            </button>
          </p>
        </div>

        {/* Quick Demo Credentials Selector */}
        <div className="mt-8 pt-6 border-t border-slate-700/60">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Demo Login Options
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('admin@institute.com')}
              className="px-2 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center space-y-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => handleQuickLogin('trainer1@institute.com')}
              className="px-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center space-y-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Trainer</span>
            </button>
            <button
              onClick={() => handleQuickLogin('student1@institute.com')}
              className="px-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center space-y-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-3">Demo Password: <span className="text-slate-300 font-mono">password123</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
