import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { RatingModal } from '../components/customer/RatingModal';
import { api } from '../services/api';
import { ServiceRequest } from '../types';
import { History, Wrench, Calendar, MapPin, CheckCircle2, Star } from 'lucide-react';

export const CustomerHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);

  const fetchHistory = () => {
    setLoading(true);
    api.getHistory()
      .then(res => setHistory(res.history || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4 sm:px-6">
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-sky-400" /> Roadside Assistance History
          </h2>
          <p className="text-xs text-slate-400">Past booking receipts, mechanic ratings, and service logs</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading service history...</div>
        ) : history.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-2">
            <Wrench className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Past Roadside Bookings</h4>
            <p className="text-xs text-slate-400">Your completed roadside assistance requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(item => {
              const isRated = item.status === 'RATED' || Boolean(item.ratings && item.ratings.length > 0);
              const canRate = (item.status === 'PAID' || item.status === 'COMPLETED') && !isRated;

              return (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sky-400">Booking #{item.bookingCode}</span>
                      <h4 className="text-base font-black text-white">{item.serviceType?.name || 'Roadside Assistance'}</h4>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                        ₹{item.totalAmount}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{item.customerAddress || 'GPS Location'}</span>
                    </div>
                    <div>Vehicle: <strong className="text-white">{item.vehicle?.brand} {item.vehicle?.model} ({item.vehicle?.regNumber})</strong></div>
                    <div>Mechanic: <strong className="text-white">{item.mechanic?.user?.name || 'Assigned Mechanic'}</strong></div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Status: {item.status}
                    </span>

                    {canRate && (
                      <button
                        onClick={() => setRatingBookingId(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Rate Mechanic
                      </button>
                    )}

                    {isRated && (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Rated ⭐ 5/5
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RatingModal
        bookingId={ratingBookingId}
        onRatingSubmitted={() => {
          setRatingBookingId(null);
          fetchHistory();
        }}
      />
    </div>
  );
};
