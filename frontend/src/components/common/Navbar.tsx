import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Shield, User as UserIcon, LogOut, History, Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-3 left-3 right-3 z-[1000] max-w-7xl mx-auto">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white">MECH<span className="text-sky-400">CONNECT</span></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Connect. Repair. Move.</p>
          </div>
        </Link>

        {/* User Navigation Controls */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Customer quick links */}
              {user.role === 'CUSTOMER' && (
                <>
                  <Link
                    to="/history"
                    className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Booking History"
                  >
                    <History className="w-4 h-4 text-sky-400" />
                    <span className="hidden sm:inline">History</span>
                  </Link>

                  <Link
                    to="/vehicles"
                    className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="My Vehicles"
                  >
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Vehicles</span>
                  </Link>
                </>
              )}

              {/* Role Badge */}
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                user.role === 'ADMIN'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : user.role === 'MECHANIC'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}>
                {user.role}
              </span>

              {/* User Profile name */}
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-100">{user.name}</span>
                <span className="text-[10px] text-slate-400">{user.email}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:opacity-95 transition-opacity"
              >
                Register Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
