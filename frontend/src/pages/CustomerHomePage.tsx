import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapView } from '../components/map/MapView';
import { Navbar } from '../components/common/Navbar';
import { AiAssistantModal } from '../components/customer/AiAssistantModal';
import { VehicleModal } from '../components/customer/VehicleModal';
import { MatchingModal } from '../components/customer/MatchingModal';
import { TrackingSheet } from '../components/customer/TrackingSheet';
import { ExtraChargeModal } from '../components/customer/ExtraChargeModal';
import { InvoiceModal } from '../components/customer/InvoiceModal';
import { PaymentModal } from '../components/customer/PaymentModal';
import { RatingModal } from '../components/customer/RatingModal';
import { ChatDrawer } from '../components/customer/ChatDrawer';
import { Modal } from '../components/common/Modal';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { ServiceRequest, ServiceType, Vehicle, AIDiagnosisResult, MatchedMechanicResult, AdditionalCharge } from '../types';
import { Search, MapPin, Bot, Car, Zap, Disc, Fuel, Wrench, Flame, Truck, Cpu, ChevronUp, Plus, ShieldCheck, AlertOctagon, ShieldAlert, PhoneCall } from 'lucide-react';

const DEMO_CHENNAI: [number, number] = [13.0827, 80.2707];

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5 text-amber-400" />,
  Disc: <Disc className="w-5 h-5 text-sky-400" />,
  Fuel: <Fuel className="w-5 h-5 text-emerald-400" />,
  Wrench: <Wrench className="w-5 h-5 text-indigo-400" />,
  Flame: <Flame className="w-5 h-5 text-rose-400" />,
  Truck: <Truck className="w-5 h-5 text-purple-400" />,
  Cpu: <Cpu className="w-5 h-5 text-teal-400" />
};

export const CustomerHomePage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  // Location state
  const [location, setLocation] = useState<[number, number]>(DEMO_CHENNAI);
  const [address, setAddress] = useState<string>('Anna Nagar West, Chennai (Demo GPS)');
  const [gettingGPS, setGettingGPS] = useState(false);

  // Assistance Priority & Emergency SOS Modal
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);

  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [activeBooking, setActiveBooking] = useState<ServiceRequest | null>(null);

  // Modals
  const [showAiModal, setShowAiModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [bestMatch, setBestMatch] = useState<MatchedMechanicResult | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Active Pending Modals
  const [pendingExtraCharge, setPendingExtraCharge] = useState<AdditionalCharge | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);

  // AI State
  const [aiDiagnosis, setAiDiagnosis] = useState<AIDiagnosisResult | null>(null);
  const [liveEtaMins, setLiveEtaMins] = useState<number | undefined>(undefined);
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | undefined>(undefined);
  const joinedBookingRef = useRef<string>('');

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const [vRes, sRes, bRes] = await Promise.all([
        api.getVehicles().catch(() => ({ vehicles: [] })),
        api.getServiceTypes().catch(() => ({ serviceTypes: [] })),
        api.getActiveBooking().catch(() => ({ booking: null }))
      ]);

      const loadedVehicles = vRes.vehicles || [];
      setVehicles(loadedVehicles);
      if (loadedVehicles.length > 0) {
        const primary = loadedVehicles.find(v => v.isPrimary) || loadedVehicles[0];
        setSelectedVehicle(primary);
      }

      const loadedServices = sRes.serviceTypes || [];
      setServiceTypes(loadedServices);
      if (loadedServices.length > 0) {
        setSelectedService(loadedServices[0]);
      }

      if (bRes.booking) {
        setActiveBooking(bRes.booking);
        checkPendingFlows(bRes.booking);
      }
    } catch (err) {
      console.error('Error loading customer data:', err);
    }
  };

  useEffect(() => {
    if (!socket || !activeBooking?.id) return;

    if (joinedBookingRef.current !== activeBooking.id) {
      joinedBookingRef.current = activeBooking.id;
      socket.emit('join:booking', activeBooking.id);
    }

    const handleStatusChange = (data: { status?: string; booking?: ServiceRequest; type?: string; charge?: AdditionalCharge }) => {
      if (data.booking) {
        setActiveBooking(data.booking);
        checkPendingFlows(data.booking);
      } else if (data.type === 'ADDITIONAL_CHARGE_ADDED' && data.charge) {
        setPendingExtraCharge(data.charge);
      }
    };

    socket.on('booking:status_change', handleStatusChange);

    return () => {
      socket.off('booking:status_change', handleStatusChange);
    };
  }, [socket, activeBooking?.id]);

  const checkPendingFlows = (booking: ServiceRequest) => {
    if (booking.status === 'COMPLETED' || booking.status === 'PAYMENT_PENDING') {
      setShowInvoice(true);
    } else if (booking.status === 'PAID') {
      setShowInvoice(false);
      setShowPayment(false);
      setRatingBookingId(booking.id);
    }
  };

  const handleUseCurrentGPS = () => {
    setGettingGPS(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setLocation(coords);
          setAddress(`Current Browser GPS (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
          setGettingGPS(false);
        },
        () => {
          setLocation(DEMO_CHENNAI);
          setAddress('Anna Nagar West, Chennai (Demo GPS Fallback)');
          setGettingGPS(false);
        }
      );
    } else {
      setGettingGPS(false);
    }
  };

  const handleSelectUrgentAssistance = () => {
    setPriority('URGENT');
    setShowEmergencyDialog(true);
  };

  const handleTriggerEmergencySos = async () => {
    setShowEmergencyDialog(false);
    setPriority('URGENT');
    await handleRequestAssistance('URGENT');
  };

  const handleRequestAssistance = async (overridePriority?: 'NORMAL' | 'URGENT') => {
    let vehicleToUse = selectedVehicle;
    if (!vehicleToUse && vehicles.length > 0) {
      vehicleToUse = vehicles[0];
      setSelectedVehicle(vehicleToUse);
    }

    let serviceToUse = selectedService;
    if (!serviceToUse && serviceTypes.length > 0) {
      serviceToUse = serviceTypes[0];
      setSelectedService(serviceToUse);
    }

    const currentPriority = overridePriority || priority;
    setShowMatchingModal(true);

    try {
      const res = await api.createBooking({
        vehicleId: vehicleToUse?.id || '',
        serviceTypeId: serviceToUse?.id || '',
        customerLat: location[0],
        customerLng: location[1],
        customerAddress: address,
        priority: currentPriority,
        issueDescription: currentPriority === 'URGENT'
          ? '🚨 EMERGENCY SOS - Immediate Roadside Assistance Required'
          : (aiDiagnosis ? aiDiagnosis.explanation : 'Roadside assistance request'),
        aiDiagnosisJson: aiDiagnosis
      });

      setBestMatch(res.bestMatch);

      setTimeout(() => {
        setShowMatchingModal(false);
        setActiveBooking(res.booking);
      }, 3000);
    } catch (err: any) {
      console.error('Booking creation error:', err);
      setShowMatchingModal(false);
      alert(err.message || 'Failed to create booking request. Please check backend.');
    }
  };

  const handleSelectAiService = (serviceKey: string, diagnosisResult: AIDiagnosisResult) => {
    const matched = serviceTypes.find(s => s.key === serviceKey);
    if (matched) {
      setSelectedService(matched);
    }
    setAiDiagnosis(diagnosisResult);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      <Navbar />

      {/* MAP-FIRST CONTAINER */}
      <div className="absolute inset-0 z-0">
        <MapView
          center={location}
          zoom={14}
          customerLocation={location}
          mechanicLocations={
            activeBooking?.mechanic
              ? [
                  {
                    id: activeBooking.mechanic.id,
                    name: activeBooking.mechanic.user?.name || 'Assigned Mechanic',
                    lat: activeBooking.mechanic.lat || location[0] + 0.008,
                    lng: activeBooking.mechanic.lng || location[1] + 0.008,
                    isAssigned: true
                  }
                ]
              : [
                  { id: 'm1', name: 'Karthik Raja (Pro Mechanic)', lat: location[0] + 0.005, lng: location[1] + 0.006 },
                  { id: 'm2', name: 'Suresh Kumar (Towing)', lat: location[0] - 0.004, lng: location[1] + 0.008 },
                  { id: 'm3', name: 'Anbarasan (Adyar Express)', lat: location[0] - 0.008, lng: location[1] - 0.005 }
                ]
          }
          bookingStatus={activeBooking?.status}
          bookingId={activeBooking?.id}
          onArrivalReached={async () => {
            if (activeBooking && activeBooking.status === 'EN_ROUTE') {
              try {
                const res = await api.updateBookingStatus(
                  activeBooking.id,
                  'ARRIVED',
                  'Mechanic reached customer location radius (30m)'
                );
                setActiveBooking(res.booking);
              } catch (err) {
                console.error('Error auto-triggering arrival:', err);
              }
            }
          }}
          onProgressUpdate={(remKm, etaMins) => {
            setLiveDistanceKm(remKm);
            setLiveEtaMins(etaMins);
          }}
        />
      </div>

      {/* Floating Location & Emergency Strobe Header */}
      {!activeBooking && (
        <div className="absolute top-20 left-4 right-4 z-[900] max-w-xl mx-auto space-y-2">
          {priority === 'URGENT' && (
            <div className="bg-rose-950/90 border border-rose-500/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2 text-rose-200 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-black">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>🚨 EMERGENCY SOS MODE ACTIVE</span>
              </div>
              <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded uppercase">
                High Priority
              </span>
            </div>
          )}

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <MapPin className="w-5 h-5 text-sky-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Assistance Location</span>
                <span className="text-xs font-bold text-white truncate block">{address}</span>
              </div>
            </div>

            <button
              onClick={handleUseCurrentGPS}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors text-xs font-extrabold shrink-0 border border-sky-500/30"
            >
              {gettingGPS ? 'GPS...' : 'Use GPS'}
            </button>
          </div>
        </div>
      )}

      {/* DRAGGABLE BOTTOM SHEET */}
      {!activeBooking && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-4 right-4 z-[900] max-w-xl mx-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />

          {/* Priority Toggle: Normal vs Emergency SOS */}
          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setPriority('NORMAL')}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
                priority === 'NORMAL'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              NORMAL ASSISTANCE
            </button>
            <button
              type="button"
              onClick={handleSelectUrgentAssistance}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                priority === 'URGENT'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <AlertOctagon className="w-4 h-4" /> 🚨 EMERGENCY SOS
            </button>
          </div>

          {safetyWarning && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{safetyWarning}</span>
            </div>
          )}

          {/* Vehicle Selector Pill Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
              {vehicles.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                    selectedVehicle?.id === v.id
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md'
                      : 'bg-slate-800/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>{v.brand} {v.model}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowVehicleModal(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Add Vehicle"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* AI Vehicle Assistant Banner */}
          <div
            onClick={() => setShowAiModal(true)}
            className="cursor-pointer bg-gradient-to-r from-sky-900/50 via-indigo-900/40 to-slate-900 border border-sky-500/40 p-4 rounded-2xl flex items-center justify-between shadow-lg hover:border-sky-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  AI Vehicle Assistant <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-extrabold">ZERO COST</span>
                </h4>
                <p className="text-[11px] text-slate-300">Clicking sound? Won't start? Let AI diagnose the issue.</p>
              </div>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div>
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-2 block">
              Select Roadside Assistance Type
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {serviceTypes.map(st => {
                const isSelected = selectedService?.id === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedService(st)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all text-left space-y-1.5 ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-500 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-800/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-slate-800">
                        {ICON_MAP[st.iconName] || <Wrench className="w-5 h-5 text-sky-400" />}
                      </div>
                      <span className="text-xs font-black text-emerald-400">₹{st.basePrice}</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-white truncate">{st.name}</h5>
                      <p className="text-[10px] text-slate-400">~{st.estimatedDurationMinutes} mins</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => handleRequestAssistance()}
            className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-2xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2 uppercase tracking-wider ${
              priority === 'URGENT'
                ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white shadow-rose-500/40 animate-pulse'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sky-500/30'
            }`}
          >
            {priority === 'URGENT'
              ? '🚨 DISPATCH EMERGENCY SOS NOW'
              : `Request Assistance for ${selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Your Vehicle'}`}
          </button>
        </motion.div>
      )}

      {/* Emergency SOS Safety & Instant Dispatch Modal */}
      <Modal isOpen={showEmergencyDialog} onClose={() => setShowEmergencyDialog(false)} title="Emergency SOS Dispatch">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center justify-center mx-auto animate-bounce">
            <AlertOctagon className="w-9 h-9" />
          </div>
          <div>
            <h4 className="text-lg font-black text-white">🚨 EMERGENCY SOS DISPATCH</h4>
            <p className="text-xs text-slate-300 mt-1">High-priority alert will be sent immediately to all nearby verified mechanics in Chennai.</p>
          </div>

          {/* Safety Checklist */}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl text-left text-xs space-y-1.5 border border-slate-700">
            <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">Immediate Safety Actions:</span>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Turn ON your vehicle hazard blinkers.
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Move to a safe location away from fast traffic if possible.
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Stay inside with doors locked if on an isolated road.
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleTriggerEmergencySos}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs shadow-xl shadow-rose-500/30 hover:opacity-95 transition-opacity uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <AlertOctagon className="w-4 h-4 animate-spin" /> DISPATCH EMERGENCY SOS NOW
            </button>
            <button
              onClick={() => {
                setPriority('NORMAL');
                setShowEmergencyDialog(false);
              }}
              className="px-4 py-4 rounded-2xl bg-slate-800 text-slate-400 font-extrabold text-xs hover:text-white transition-colors uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ACTIVE BOOKING TRACKING SHEET */}
      {activeBooking && (
        <TrackingSheet
          booking={activeBooking}
          liveEtaMins={liveEtaMins}
          liveDistanceKm={liveDistanceKm}
          onOpenChat={() => setShowChat(true)}
          onCancel={async () => {
            await api.cancelBooking(activeBooking.id);
            setActiveBooking(null);
          }}
        />
      )}

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSelectService={handleSelectAiService}
      />

      {/* Add Vehicle Modal */}
      <VehicleModal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        onVehicleAdded={v => {
          setVehicles([...vehicles, v]);
          setSelectedVehicle(v);
        }}
      />

      {/* Mechanic Matching Modal */}
      <MatchingModal
        isOpen={showMatchingModal}
        bestMatch={bestMatch}
        onCancel={() => setShowMatchingModal(false)}
        isUrgent={priority === 'URGENT'}
      />

      {/* Extra Charge Approval Modal */}
      <ExtraChargeModal
        charge={pendingExtraCharge}
        onRespond={async approved => {
          if (pendingExtraCharge) {
            await api.respondExtraCharge(pendingExtraCharge.id, approved);
            setPendingExtraCharge(null);
            loadCustomerData();
          }
        }}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        booking={showInvoice ? activeBooking : null}
        onProceedToPayment={() => {
          setShowInvoice(false);
          setShowPayment(true);
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        booking={showPayment ? activeBooking : null}
        onPaymentSuccess={() => {
          setShowPayment(false);
          if (activeBooking) {
            setRatingBookingId(activeBooking.id);
          }
        }}
      />

      {/* Rating Modal */}
      <RatingModal
        bookingId={ratingBookingId}
        onRatingSubmitted={() => {
          setRatingBookingId(null);
          setActiveBooking(null);
        }}
      />

      {/* Realtime Chat Drawer */}
      {activeBooking && (
        <ChatDrawer
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          bookingId={activeBooking.id}
          initialMessages={activeBooking.chatMessages || []}
        />
      )}
    </div>
  );
};
