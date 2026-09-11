import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wrench, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<'CUSTOMER' | 'MECHANIC'>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.register({
        name,
        email,
        phone,
        password,
        role
      });
      login(res.token, res.user);

      if (res.user.role === 'MECHANIC') {
        navigate('/mechanic');
      } else {
        navigate('/customer');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <Navbar />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 mt-16">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Create MechConnect Account</h2>
          <p className="text-xs text-slate-400">Zero-cost registration for customers & mechanics</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              role === 'CUSTOMER'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vehicle Owner (Customer)
          </button>
          <button
            type="button"
            onClick={() => setRole('MECHANIC')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              role === 'MECHANIC'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Service Mechanic
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              required
              placeholder="+91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-xl shadow-sky-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 uppercase tracking-wider mt-4"
          >
            <UserPlus className="w-4 h-4" /> {submitting ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
