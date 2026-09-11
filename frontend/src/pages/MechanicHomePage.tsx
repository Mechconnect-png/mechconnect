import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapView } from '../components/map/MapView';
import { Navbar } from '../components/common/Navbar';
import { IncomingRequestModal } from '../components/mechanic/IncomingRequestModal';
import { JobTracker } from '../components/mechanic/JobTracker';
import { ChatDrawer } from '../components/customer/ChatDrawer';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { ServiceRequest } from '../types';
import { Power, DollarSign, Star, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

const DEMO_MECH_COORDS: [number, number] = [13.0890, 80.2750];

export const MechanicHomePage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeJob, setActiveJob] = useState<ServiceRequest | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<ServiceRequest | null>(null);
  const [earningsSummary, setEarningsSummary] = useState<{ totalEarnings: number; completedJobsCount: number } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const joinedBookingRef = useRef<string>('');

  useEffect(() => {
    loadMechanicData();
  }, []);

  const loadMechanicData = async () => {
    try {
      const [pRes, reqsRes, earnRes] = await Promise.all([
        api.getMechanicProfile().catch(() => ({ mechanic: null })),
        api.getMechanicRequests().catch(() => ({ requests: [] })),
        api.getMechanicEarnings().catch(() => ({ summary: null }))
      ]);

      if (pRes.mechanic) {
        setIsOnline(pRes.mechanic.isOnline);
      }

      const active = reqsRes.requests.find(r => ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'SERVICING'].includes(r.status));
      if (active) {
        setActiveJob(active);
        setIncomingRequest(null);
      } else {
        const searching = reqsRes.requests.find(r => r.status === 'SEARCHING');
        if (searching) {
          setIncomingRequest(searching);
        }
      }

      setEarningsSummary(earnRes.summary);
    } catch (err) {
      console.error(err);
    }
  };

  // Socket.IO event listener for new incoming requests
  useEffect(() => {
    if (!socket || !user?.mechanicId) return;

    const handleNewRequest = (data: { request?: ServiceRequest; booking?: ServiceRequest }) => {
      const req = data.request || data.booking || (data as any);
      if (req && req.id && !activeJob) {
        setIsOnline(true);
        setIncomingRequest(req);
      }
    };

    socket.on('request:new', handleNewRequest);

    return () => {
      socket.off('request:new', handleNewRequest);
    };
  }, [socket, user?.mechanicId, activeJob]);

  // Socket.IO event listener for active job updates
  useEffect(() => {
    if (!socket || !activeJob?.id) return;

    if (joinedBookingRef.current !== activeJob.id) {
      joinedBookingRef.current = activeJob.id;
      socket.emit('join:booking', activeJob.id);
    }

    const handleStatusChange = (data: { status?: string; booking?: ServiceRequest; type?: string }) => {
      if (data.booking) {
        if (['COMPLETED', 'PAID', 'RATED', 'CANCELLED'].includes(data.booking.status)) {
          setActiveJob(null);
          loadMechanicData();
        } else {
          setActiveJob(data.booking);
        }
      }
    };

    socket.on('booking:status_change', handleStatusChange);

    return () => {
      socket.off('booking:status_change', handleStatusChange);
    };
  }, [socket, activeJob?.id]);

  const handleToggleOnline = async () => {
    try {
      const res = await api.toggleAvailability(!isOnline);
      setIsOnline(res.isOnline);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeJob) return;
    try {
      const res = await api.updateBookingStatus(activeJob.id, newStatus as any);
      setActiveJob(res.booking);
      if (['COMPLETED', 'PAID', 'RATED', 'CANCELLED'].includes(newStatus)) {
        setActiveJob(null);
        loadMechanicData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      <Navbar />

      {/* MAP BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <MapView
          center={DEMO_MECH_COORDS}
          zoom={14}
          customerLocation={activeJob ? [activeJob.customerLat, activeJob.customerLng] : undefined}
          mechanicLocations={[
            {
              id: user?.mechanicId || 'm1',
              name: user?.name || 'Mechanic',
              lat: DEMO_MECH_COORDS[0],
              lng: DEMO_MECH_COORDS[1],
              isAssigned: !!activeJob
            }
          ]}
          bookingStatus={activeJob?.status}
          bookingId={activeJob?.id}
          onArrivalReached={async () => {
            if (activeJob && activeJob.status === 'EN_ROUTE') {
              try {
                const res = await api.updateBookingStatus(activeJob.id, 'ARRIVED', 'Mechanic reached customer location radius (30m)');
                setActiveJob(res.booking);
              } catch (err) {
                console.error('Error auto-triggering arrival on mechanic side:', err);
              }
            }
          }}
        />
      </div>

      {/* Floating Status Header (Online/Offline Toggle & Earnings Summary) */}
      <div className="absolute top-20 left-4 right-4 z-[900] max-w-xl mx-auto flex items-center justify-between gap-3">
        {/* Online Toggle Button */}
        <button
          onClick={handleToggleOnline}
          className={`px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-2.5 transition-all font-extrabold text-xs ${
            isOnline
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-emerald-500/10'
              : 'bg-slate-900/90 border-slate-800 text-slate-400'
          }`}
        >
          <Power className={`w-4 h-4 ${isOnline ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span>{isOnline ? 'ONLINE & READY FOR JOBS' : 'OFFLINE'}</span>
        </button>

        {/* Earnings pill */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-amber-400" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Earnings</span>
            <span className="text-xs font-black text-white">₹{earningsSummary?.totalEarnings || 0}</span>
          </div>
        </div>
      </div>

      {/* ACTIVE JOB TRACKER */}
      {activeJob && (
        <JobTracker
          booking={activeJob}
          onUpdateStatus={handleUpdateStatus}
          onOpenChat={() => setShowChat(true)}
        />
      )}

      {/* 15-SECOND INCOMING REQUEST ALERT MODAL */}
      <IncomingRequestModal
        request={incomingRequest}
        onAccept={booking => {
          setIncomingRequest(null);
          setActiveJob(booking);
        }}
        onDecline={() => setIncomingRequest(null)}
      />

      {/* Realtime Chat Drawer */}
      {activeJob && (
        <ChatDrawer
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          bookingId={activeJob.id}
          initialMessages={activeJob.chatMessages || []}
        />
      )}
    </div>
  );
};
