import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ServiceRequest } from '../../types';
import { MapPin, Clock, Wrench, ShieldCheck, CheckCircle2, AlertOctagon, User, Car, DollarSign } from 'lucide-react';
import { api } from '../../services/api';

interface IncomingRequestModalProps {
  request: ServiceRequest | null;
  onAccept: (booking: ServiceRequest) => void;
  onDecline: () => void;
}

export const IncomingRequestModal: React.FC<IncomingRequestModalProps> = ({
  request,
  onAccept,
  onDecline
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [accepting, setAccepting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!request) return;
    setTimeLeft(15);
    setError('');

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [request]);

  if (!request) return null;

  const isUrgent = request.priority === 'URGENT';
  const customerName = request.customer?.user?.name || 'Rahul Sharma';
  const vehicleInfo = request.vehicle
    ? `${request.vehicle.brand} ${request.vehicle.model} (${request.vehicle.regNumber})`
    : 'Honda City (TN 07 CX 4589)';
  const problemName = request.serviceType?.name || 'Emergency Roadside Breakdown';
  const address = request.customerAddress || 'Anna Nagar West, Chennai (Demo GPS)';

  const handleAccept = async () => {
    setAccepting(true);
    setError('');
    try {
      const res = await api.acceptBooking(request.id);
      onAccept(res.booking);
    } catch (err: any) {
      setError(err.message || 'Double booking protection triggered.');
      setTimeout(() => {
        onDecline();
      }, 2000);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md bg-slate-900 border-2 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden ${
          isUrgent ? 'border-rose-500/80 shadow-rose-500/20' : 'border-amber-500/50'
        }`}
      >
        {/* Top 15s Countdown Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${isUrgent ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {isUrgent ? (
            <span className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5" /> 🚨 URGENT EMERGENCY REQUEST
            </span>
          ) : (
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              NEW ROADSIDE REQUEST
            </span>
          )}

          <span className="text-xs font-black text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {timeLeft}s remaining
          </span>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs rounded-xl font-bold">
            {error}
          </div>
        )}

        <div className="text-left space-y-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Problem Reported</span>
            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-sky-400 shrink-0" />
              {problemName}
            </h4>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Customer: {customerName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{vehicleInfo}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-700 font-bold">
            <span className="text-slate-400">Estimated Earnings:</span>
            <span className="text-emerald-400 text-base">₹{request.totalAmount || 450}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-extrabold text-xs hover:bg-rose-500/20 hover:text-rose-400 transition-colors uppercase tracking-wider"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className={`flex-1 py-3.5 rounded-2xl text-white font-extrabold text-xs shadow-xl transition-opacity flex items-center justify-center gap-1.5 uppercase tracking-wider ${
              isUrgent
                ? 'bg-gradient-to-r from-rose-500 to-amber-600 shadow-rose-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> {accepting ? 'Accepting...' : 'Accept Emergency Job'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
