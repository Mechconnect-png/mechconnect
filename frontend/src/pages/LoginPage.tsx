import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wrench, Mail, Lock, LogIn, UserCheck, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);

      if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (res.user.role === 'MECHANIC') {
        navigate('/mechanic');
      } else {
        navigate('/customer');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <Navbar />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 mt-16">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Sign In to MechConnect</h2>
          <p className="text-xs text-slate-400">Roadside assistance platform sign in</p>
        </div>

        {/* Viva Quick Demo Credentials Shortcuts */}
        <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl space-y-2 text-center">
          <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
            ⚡ Quick Viva Demo Accounts (1-Click Fill)
          </span>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => fillDemoAccount('customer@mechconnect.com', 'CUSTOMER')}
              className="py-1.5 px-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold hover:bg-sky-500/30 transition-colors"
            >
              👤 Customer
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('mechanic@mechconnect.com', 'MECHANIC')}
              className="py-1.5 px-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/30 transition-colors"
            >
              🔧 Mechanic
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('admin@mechconnect.com', 'ADMIN')}
              className="py-1.5 px-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold hover:bg-rose-500/30 transition-colors"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@mechconnect.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-xl shadow-sky-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <LogIn className="w-4 h-4" /> {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-400 font-bold hover:underline">
            Register Free
          </Link>
        </p>
      </div>
    </div>
  );
};
