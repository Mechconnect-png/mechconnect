import React from 'react';
import { Modal } from '../common/Modal';
import { AdditionalCharge } from '../../types';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface ExtraChargeModalProps {
  charge: AdditionalCharge | null;
  onRespond: (approved: boolean) => void;
}

export const ExtraChargeModal: React.FC<ExtraChargeModalProps> = ({ charge, onRespond }) => {
  if (!charge) return null;

  return (
    <Modal isOpen={!!charge} onClose={() => {}} title="Additional Service Request">
      <div className="space-y-4">
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            Your mechanic has requested approval for an additional part or labor expense required to complete the repair.
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl space-y-2 border border-slate-700">
          <div className="flex items-center justify-between text-sm font-extrabold text-white">
            <span>{charge.title}</span>
            <span className="text-sky-400 text-base">₹{charge.amount}</span>
          </div>
          {charge.description && (
            <p className="text-xs text-slate-400">{charge.description}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onRespond(false)}
            className="flex-1 py-3.5 rounded-2xl bg-rose-500/20 text-rose-300 font-extrabold text-xs hover:bg-rose-500/30 transition-colors flex items-center justify-center gap-1.5 uppercase"
          >
            <XCircle className="w-4 h-4" /> Decline Charge
          </button>
          <button
            onClick={() => onRespond(true)}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 uppercase"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve ₹{charge.amount}
          </button>
        </div>
      </div>
    </Modal>
  );
};
