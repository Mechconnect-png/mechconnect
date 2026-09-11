import React from 'react';
import { motion } from 'framer-motion';
import { ServiceRequest } from '../../types';
import { Phone, MessageSquare, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

interface TrackingSheetProps {
  booking: ServiceRequest;
  onOpenChat: () => void;
  onCancel: () => void;
  liveEtaMins?: number;
  liveDistanceKm?: number;
}

export const TrackingSheet: React.FC<TrackingSheetProps> = ({
  booking,
  onOpenChat,
  onCancel,
  liveEtaMins,
  liveDistanceKm
}) => {
  const mechanic = booking.mechanic;

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 1;
      case 'EN_ROUTE': return 2;
      case 'ARRIVED': return 3;
      case 'SERVICING': return 4;
      case 'COMPLETED':
      case 'PAYMENT_PENDING':
      case 'PAID':
      case 'RATED': return 5;
      default: return 0;
    }
  };

  const currentStep = getStatusStepIndex(booking.status);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-4 right-4 z-[1000] max-w-xl mx-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4"
    >
      {/* Drag handle */}
      <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />

      {/* Header Status */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-sky-400">
            Booking #{booking.bookingCode}
          </span>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            {booking.status === 'EN_ROUTE' && '🚗 Mechanic is on the way'}
            {booking.status === 'ARRIVED' && '✓ MECHANIC ARRIVED'}
            {booking.status === 'SERVICING' && '🔧 Repair in progress'}
            {booking.status === 'ACCEPTED' && '✓ Mechanic assigned'}
          </h3>
          {booking.status === 'ARRIVED' && (
            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
              Your mechanic has arrived at your location
            </p>
          )}
        </div>

        <div className="text-right">
          {booking.status === 'EN_ROUTE' && (
            <div className="flex flex-col items-end">
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                ETA: ~{liveEtaMins ?? 8} min
              </span>
              {liveDistanceKm !== undefined && (
                <span className="text-[10px] text-slate-400 font-bold mt-1">
                  {liveDistanceKm} km away
                </span>
              )}
            </div>
          )}

          {booking.status === 'ARRIVED' && (
            <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 uppercase tracking-wider animate-pulse">
              ARRIVED
            </span>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="flex items-center justify-between py-2 border-y border-slate-800 text-[10px] font-bold">
        <div className={`flex flex-col items-center gap-1 ${currentStep >= 1 ? 'text-sky-400' : 'text-slate-600'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-500'}`}>1</div>
          <span>Accepted</span>
        </div>
        <div className={`h-0.5 flex-1 ${currentStep >= 2 ? 'bg-sky-500' : 'bg-slate-800'}`} />
        <div className={`flex flex-col items-center gap-1 ${currentStep >= 2 ? 'text-sky-400' : 'text-slate-600'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-500'}`}>2</div>
          <span>En Route</span>
        </div>
        <div className={`h-0.5 flex-1 ${currentStep >= 3 ? 'bg-emerald-400' : 'bg-slate-800'}`} />
        <div className={`flex flex-col items-center gap-1 ${currentStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>3</div>
          <span>Arrived</span>
        </div>
        <div className={`h-0.5 flex-1 ${currentStep >= 4 ? 'bg-emerald-400' : 'bg-slate-800'}`} />
        <div className={`flex flex-col items-center gap-1 ${currentStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>4</div>
          <span>Servicing</span>
        </div>
      </div>

      {/* Mechanic Info Card */}
      {mechanic && (
        <div className="bg-slate-800/60 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-700 flex items-center justify-center text-xl font-bold text-amber-400 shadow-md">
              👨‍🔧
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                {mechanic.user?.name || 'Assigned Mechanic'}
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h4>
              <p className="text-xs text-slate-400">★ {mechanic.rating} Rating • Service Vehicle</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${mechanic.user?.phone || '+919876543210'}`}
              className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors font-extrabold text-xs flex items-center gap-1"
              title="Call Mechanic"
            >
              <Phone className="w-4 h-4" /> CALL
            </a>
            <button
              onClick={onOpenChat}
              className="p-3 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors relative font-extrabold text-xs flex items-center gap-1"
              title="Chat with Mechanic"
            >
              <MessageSquare className="w-4 h-4" /> CHAT
              {booking.chatMessages && booking.chatMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-sky-500 rounded-full border-2 border-slate-900 animate-ping" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Problem details summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/30 px-3.5 py-2.5 rounded-xl border border-slate-800">
        <span>Service: <strong className="text-slate-200">{booking.serviceType?.name || 'Roadside Assistance'}</strong></span>
        <span>Amount: <strong className="text-sky-400 font-extrabold">₹{booking.totalAmount}</strong></span>
      </div>

      {booking.status === 'ACCEPTED' || booking.status === 'EN_ROUTE' ? (
        <button
          onClick={onCancel}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-bold"
        >
          Cancel Roadside Request
        </button>
      ) : null}
    </motion.div>
  );
};
