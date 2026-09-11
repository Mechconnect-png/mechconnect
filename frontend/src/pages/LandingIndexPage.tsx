import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Shield, Bot, MapPin, Zap, ArrowRight, Star } from 'lucide-react';

export const LandingIndexPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Entry Brand Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider">MECH<span className="text-sky-400">CONNECT</span></h1>
            <p className="text-xs text-slate-400 font-medium">Connect. Repair. Move.</p>
          </div>
        </div>

        <Link
          to="/login"
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold"
        >
          Sign In
        </Link>
      </div>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto w-full py-16 text-center space-y-8 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold"
        >
          <Bot className="w-4 h-4" /> AI-Powered Roadside Assistance Platform
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight"
        >
          Vehicle Breakdown? <br />
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Get On-Demand Assistance in Minutes.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Map-first roadside dispatch, zero-cost rule-based AI diagnosis, intelligent mechanic matching, and real-time live tracking.
        </motion.p>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left"
        >
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-2">
            <MapPin className="w-6 h-6 text-sky-400" />
            <h3 className="text-sm font-extrabold text-white">Map-First Booking</h3>
            <p className="text-xs text-slate-400">OpenStreetMap Leaflet tracking with live ETA & polyline routing.</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            <h3 className="text-sm font-extrabold text-white">AI Assistant</h3>
            <p className="text-xs text-slate-400">Zero-cost intelligent rule engine detects breakdown causes instantly.</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-2">
            <Zap className="w-6 h-6 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-white">Realtime Socket.IO</h3>
            <p className="text-xs text-slate-400">Atomic double-booking locks and instant 15s mechanic dispatch.</p>
          </div>
        </motion.div>

        {/* Primary CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
        >
          <Link
            to="/customer"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-sm shadow-2xl shadow-sky-500/30 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            Launch Customer Experience <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-extrabold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            Demo Accounts Sign In
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-900 pt-4">
        MechConnect — Zero-Cost Full-Stack College Final Year Project Architecture
      </footer>
    </div>
  );
};
