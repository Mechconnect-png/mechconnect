import React from 'react';
import { Modal } from '../common/Modal';
import { ServiceRequest } from '../../types';
import { FileText, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface InvoiceModalProps {
  booking: ServiceRequest | null;
  onProceedToPayment: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, onProceedToPayment }) => {
  if (!booking) return null;

  return (
    <Modal isOpen={!!booking} onClose={() => {}} title="Service Invoice Breakdown">
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Invoice ID</span>
              <h4 className="text-sm font-extrabold text-white">#INV-{booking.bookingCode}</h4>
            </div>
            <div className="text-right">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Service Completed
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Base Service ({booking.serviceType?.name || 'Assistance'}):</span>
              <span className="font-bold text-white">₹{booking.baseAmount}</span>
            </div>

            {booking.additionalCharges && booking.additionalCharges.filter(c => c.status === 'APPROVED').map(charge => (
              <div key={charge.id} className="flex justify-between text-slate-300">
                <span>Part/Labor ({charge.title}):</span>
                <span className="font-bold text-amber-400">+ ₹{charge.amount}</span>
              </div>
            ))}

            <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
              <span>GST & Digital Invoice Processing:</span>
              <span className="text-emerald-400 font-semibold">₹0 (Zero Cost College Demo)</span>
            </div>

            <div className="flex justify-between text-base font-black text-white pt-3 border-t border-slate-700">
              <span>Total Final Amount:</span>
              <span className="text-sky-400">₹{booking.totalAmount}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onProceedToPayment}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-xl shadow-sky-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          Pay ₹{booking.totalAmount} via Demo Gateway <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Modal>
  );
};
