import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ServiceRequest } from '../../types';
import { MapPin, Phone, MessageSquare, Plus, CheckCircle2, Navigation, Wrench } from 'lucide-react';
import { api } from '../../services/api';

interface JobTrackerProps {
  booking: ServiceRequest;
  onUpdateStatus: (newStatus: string) => void;
  onOpenChat: () => void;
}

export const JobTracker: React.FC<JobTrackerProps> = ({
  booking,
  onUpdateStatus,
  onOpenChat
}) => {
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [chargeTitle, setChargeTitle] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeTitle || !chargeAmount) return;

    setAdding(true);
    try {
      await api.addExtraCharge(booking.id, {
        title: chargeTitle,
        amount: Number(chargeAmount)
      });
      setShowAddCharge(false);
      setChargeTitle('');
      setChargeAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-4 right-4 z-[1000] max-w-xl mx-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400">
            ACTIVE JOB #{booking.bookingCode}
          </span>
          <h3 className="text-base font-extrabold text-white">
            {booking.serviceType?.name || 'Roadside Assistance'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${booking.customer?.user?.phone || '+919876543210'}`}
            className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-xs font-bold flex items-center gap-1"
          >
            <Phone className="w-4 h-4" /> Call
          </a>
          <button
            onClick={onOpenChat}
            className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors text-xs font-bold flex items-center gap-1"
          >
            <MessageSquare className="w-4 h-4" /> Chat
          </button>
        </div>
      </div>

      <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
        <div>Customer: <strong className="text-white">{booking.customer?.user?.name || 'Rahul Sharma'}</strong></div>
        <div>Vehicle: <strong className="text-white">{booking.vehicle?.brand} {booking.vehicle?.model} ({booking.vehicle?.regNumber})</strong></div>
        <div className="flex items-center gap-1 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate">{booking.customerAddress || 'Customer GPS Location'}</span>
        </div>
      </div>

      {/* Action Workflow Controls */}
      <div className="space-y-2">
        {booking.status === 'ACCEPTED' && (
          <button
            onClick={() => onUpdateStatus('EN_ROUTE')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Navigation className="w-4 h-4" /> Start Navigation / Mark En Route
          </button>
        )}

        {booking.status === 'EN_ROUTE' && (
          <button
            onClick={() => onUpdateStatus('ARRIVED')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <MapPin className="w-4 h-4" /> Mark Arrived at Customer Location
          </button>
        )}

        {booking.status === 'ARRIVED' && (
          <button
            onClick={() => onUpdateStatus('SERVICING')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Wrench className="w-4 h-4" /> Start Diagnosis / Repair
          </button>
        )}

        {booking.status === 'SERVICING' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddCharge(!showAddCharge)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-amber-300 font-bold text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 border border-amber-500/30"
              >
                <Plus className="w-4 h-4" /> Add Part / Charge
              </button>
              <button
                onClick={() => onUpdateStatus('COMPLETED')}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 uppercase"
              >
                <CheckCircle2 className="w-4 h-4" /> Complete Service
              </button>
            </div>

            {showAddCharge && (
              <form onSubmit={handleAddCharge} className="bg-slate-800 p-3 rounded-2xl space-y-2 border border-slate-700">
                <input
                  type="text"
                  placeholder="Part name (e.g. Jumper Cable / Plug)"
                  value={chargeTitle}
                  onChange={e => setChargeTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount ₹"
                    value={chargeAmount}
                    onChange={e => setChargeAmount(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-400"
                  >
                    Send Approval
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
