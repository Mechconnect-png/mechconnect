import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, Star, MapPin, Clock, ShieldCheck, ChevronDown, ChevronUp, Award, AlertOctagon, Flame } from 'lucide-react';
import { MatchedMechanicResult } from '../../types';

interface MatchingModalProps {
  isOpen: boolean;
  bestMatch: MatchedMechanicResult | null;
  onCancel: () => void;
  isUrgent?: boolean;
}

export const MatchingModal: React.FC<MatchingModalProps> = ({ isOpen, bestMatch, onCancel, isUrgent = false }) => {
  const [showBreakdown, setShowBreakdown] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1900] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md bg-slate-900 border-2 rounded-3xl p-6 shadow-2xl space-y-5 text-center overflow-y-auto max-h-[90vh] custom-scrollbar ${
          isUrgent ? 'border-rose-500/80 shadow-rose-500/30' : 'border-slate-800'
        }`}
      >
        {/* Animated Radar Pulse */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full animate-ping ${isUrgent ? 'bg-rose-500/30' : 'bg-sky-500/20'}`} />
          <div className={`absolute inset-2 rounded-full animate-pulse ${isUrgent ? 'bg-amber-500/40' : 'bg-indigo-500/30'}`} />
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${
            isUrgent
              ? 'bg-gradient-to-tr from-rose-600 to-amber-600 shadow-rose-500/40'
              : 'bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-sky-500/30'
          }`}>
            {isUrgent ? <AlertOctagon className="w-8 h-8 text-white animate-bounce" /> : <Search className="w-7 h-7 text-white animate-pulse" />}
          </div>
        </div>

        <div>
          {isUrgent ? (
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse inline-flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> EMERGENCY SOS BROADCAST
              </span>
              <h3 className="text-xl font-black text-white">Dispatching Emergency SOS Mechanic...</h3>
              <p className="text-xs text-rose-300">Broadcasting urgent roadside alert to nearest online Chennai technicians</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-black text-white">Finding Best Mechanic...</h3>
              <p className="text-xs text-slate-400 mt-0.5">Analyzing nearby technicians & distance matrix in Chennai</p>
            </div>
          )}
        </div>

        {/* Live Status Checklist */}
        <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-left text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Breakdown GPS Pin Confirmed
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> High-Priority Emergency Signal Active
          </div>
          <div className="flex items-center gap-2 text-rose-400 font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" /> Transmitting SOS Payload to Nearby Mechanics
          </div>
        </div>

        {/* BEST MATCH CARD */}
        {bestMatch && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-sky-500/40 p-4 rounded-2xl text-left space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> BEST MATCH
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {bestMatch.rating} ({bestMatch.totalRatings})
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black text-white">{bestMatch.name}</h4>
              <p className="text-xs text-slate-400">{bestMatch.experienceYears} Years Exp • {bestMatch.skills.join(', ')}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1 text-sky-400 font-semibold">
                <MapPin className="w-3.5 h-3.5" /> {bestMatch.distanceKm} km away
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Clock className="w-3.5 h-3.5" /> ETA {bestMatch.etaMinutes} min
              </div>
              <div className="font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                MATCH SCORE: {bestMatch.matchScore}%
              </div>
            </div>

            {/* EXPANDABLE "WHY THIS MECHANIC?" SECTION */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex items-center justify-between text-xs font-extrabold text-sky-400 hover:text-sky-300 transition-colors py-1"
              >
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Why this mechanic?
                </span>
                {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {showBreakdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1.5 pt-2 text-[11px] text-slate-300"
                  >
                    <div className="flex justify-between bg-slate-800/60 px-2.5 py-1 rounded">
                      <span>Distance Proximity:</span>
                      <strong className="text-sky-400">{bestMatch.breakdownScore.distanceScore} / 40</strong>
                    </div>
                    <div className="flex justify-between bg-slate-800/60 px-2.5 py-1 rounded">
                      <span>Skill Compatibility:</span>
                      <strong className="text-emerald-400">{bestMatch.breakdownScore.skillScore} / 30</strong>
                    </div>
                    <div className="flex justify-between bg-slate-800/60 px-2.5 py-1 rounded">
                      <span>Rating & Reputation:</span>
                      <strong className="text-amber-400">{bestMatch.breakdownScore.ratingScore} / 15</strong>
                    </div>
                    <div className="flex justify-between bg-slate-800/60 px-2.5 py-1 rounded">
                      <span>Availability & Workload:</span>
                      <strong className="text-indigo-400">{bestMatch.breakdownScore.availabilityScore} / 15</strong>
                    </div>
                    <div className="flex justify-between bg-slate-800 px-2.5 py-1.5 rounded font-bold text-white border border-slate-700">
                      <span>Total Computed Score:</span>
                      <span className="text-emerald-400">{bestMatch.matchScore} / 100</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          Cancel Search
        </button>
      </motion.div>
    </div>
  );
};
