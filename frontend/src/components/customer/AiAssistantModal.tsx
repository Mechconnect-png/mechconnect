import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { Modal } from '../common/Modal';
import { AIDiagnosisResult } from '../../types';
import { api } from '../../services/api';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (serviceKey: string, aiDiagnosis: AIDiagnosisResult) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectService
}) => {
  const [step, setStep] = useState<'QUESTIONS' | 'SCANNING' | 'REPORT'>('QUESTIONS');
  const [symptomsText, setSymptomsText] = useState('');
  const [startsEngine, setStartsEngine] = useState<boolean | undefined>(undefined);
  const [clickingSound, setClickingSound] = useState<boolean | undefined>(undefined);
  const [flatTyre, setFlatTyre] = useState<boolean | undefined>(undefined);
  const [smokeOrHeat, setSmokeOrHeat] = useState<boolean | undefined>(undefined);
  const [stoppedSuddenly, setStoppedSuddenly] = useState<boolean | undefined>(undefined);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosisResult | null>(null);

  const handleDiagnose = async () => {
    setStep('SCANNING');

    setTimeout(async () => {
      try {
        const res = await api.diagnoseAI({
          symptomsText,
          startsEngine,
          clickingSound,
          flatTyre,
          smokeOrHeat,
          stoppedSuddenly
        });
        setDiagnosis(res.diagnosis);
        setStep('REPORT');
      } catch (err) {
        console.error(err);
        setStep('QUESTIONS');
      }
    }, 1800); // 1.8s scanning effect
  };

  const handleReset = () => {
    setStep('QUESTIONS');
    setSymptomsText('');
    setStartsEngine(undefined);
    setClickingSound(undefined);
    setFlatTyre(undefined);
    setSmokeOrHeat(undefined);
    setStoppedSuddenly(undefined);
    setDiagnosis(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            AI Vehicle Assistant
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Intelligent Diagnosis
            </span>
          </h3>
          <p className="text-xs text-slate-400">Rule-based zero-cost vehicle breakdown engine</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: QUESTIONNAIRE */}
        {step === 'QUESTIONS' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Describe symptoms (Optional write-in):
              </label>
              <input
                type="text"
                placeholder='e.g., "Bike won&#39;t start and I hear clicking sound"'
                value={symptomsText}
                onChange={e => setSymptomsText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-xs font-medium text-slate-300 mb-2">Does the engine start?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStartsEngine(true)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      startsEngine === true
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setStartsEngine(false)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      startsEngine === false
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-xs font-medium text-slate-300 mb-2">Hear rapid clicking sound?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setClickingSound(true)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      clickingSound === true
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setClickingSound(false)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      clickingSound === false
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-xs font-medium text-slate-300 mb-2">Visible smoke or overheating?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSmokeOrHeat(true)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      smokeOrHeat === true
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setSmokeOrHeat(false)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      smokeOrHeat === false
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800">
                <p className="text-xs font-medium text-slate-300 mb-2">Flat tyre or air leak?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFlatTyre(true)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      flatTyre === true
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFlatTyre(false)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      flatTyre === false
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleDiagnose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4" /> Run AI Vehicle Analysis
            </button>
          </motion.div>
        )}

        {/* STEP 2: AI SCANNING ANIMATION */}
        {step === 'SCANNING' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="py-12 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-sky-500/20 rounded-full animate-ping" />
              <div className="absolute inset-2 bg-indigo-500/30 rounded-full animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-2xl">
                <Bot className="w-8 h-8 text-white animate-bounce" />
              </div>
            </div>
            <h4 className="text-lg font-bold text-white">Analyzing Vehicle Symptoms...</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              MechConnect AI rule engine is matching electrical, mechanical, and thermal sensor logic patterns.
            </p>
          </motion.div>
        )}

        {/* STEP 3: DIAGNOSIS REPORT */}
        {step === 'REPORT' && diagnosis && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Header Badge */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Likely Issue</span>
                <h4 className="text-lg font-black text-white">{diagnosis.problem}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {diagnosis.confidence}% Confidence
                </span>
                <div className="text-[11px] text-slate-400 mt-1">Severity: <span className="text-amber-400 font-bold">{diagnosis.severity}</span></div>
              </div>
            </div>

            {/* Explanation & Cost */}
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">{diagnosis.explanation}</p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                <span className="text-slate-400">Estimated Service Cost:</span>
                <span className="font-extrabold text-sky-400 text-sm">{diagnosis.estimatedCostRange}</span>
              </div>
            </div>

            {/* Action steps */}
            <div>
              <h5 className="text-xs font-bold text-slate-300 mb-2">Recommended Immediate Actions:</h5>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {diagnosis.actionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={handleReset}
                className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Retake AI Diagnosis"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onSelectService(diagnosis.recommendedServiceKey, diagnosis);
                  onClose();
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs tracking-wider shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 uppercase"
              >
                Request {diagnosis.recommendedServiceName} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
