import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ServiceRequest } from '../../types';
import { CreditCard, QrCode, Banknote, Wallet, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

interface PaymentModalProps {
  booking: ServiceRequest | null;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ booking, onPaymentSuccess }) => {
  const [method, setMethod] = useState<string>('UPI Demo');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!booking) return null;

  const handlePay = async () => {
    setProcessing(true);
    setTimeout(async () => {
      try {
        await api.processPayment(booking.id, method);
        setProcessing(false);
        setSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
        }, 1200);
      } catch (err) {
        console.error(err);
        setProcessing(false);
      }
    }, 1500); // 1.5s simulated payment flow
  };

  return (
    <Modal isOpen={!!booking} onClose={() => {}} title="Simulated Zero-Cost Payment Gateway">
      <div className="space-y-5">
        <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-[11px] text-sky-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>DEMO PAYMENT SYSTEM: No real card or banking credentials required. Safe for college demonstration.</span>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-white">Payment Successful!</h4>
            <p className="text-xs text-slate-400">Transaction ID: TXN-{Date.now()}</p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Payment Method:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('UPI Demo (GPay / PhonePe)')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    method.includes('UPI')
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <QrCode className="w-6 h-6 text-sky-400" />
                  <span className="text-xs">UPI Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Card Demo (Visa / Mastercard)')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    method.includes('Card')
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs">Credit/Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Cash to Mechanic')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    method.includes('Cash')
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Banknote className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs">Cash on Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('MechWallet Demo')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    method.includes('Wallet')
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Wallet className="w-6 h-6 text-amber-400" />
                  <span className="text-xs">MechWallet</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Amount Payable:</span>
              <span className="text-xl font-black text-emerald-400">₹{booking.totalAmount}</span>
            </div>

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/25 hover:opacity-95 transition-opacity uppercase tracking-wider"
            >
              {processing ? 'Processing Payment Authorization...' : `Confirm Payment of ₹${booking.totalAmount}`}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
