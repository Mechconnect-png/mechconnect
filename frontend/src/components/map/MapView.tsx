import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { fetchRoadRoute, getHaversineDistanceMeters, RouteResult } from '../../services/routing';
import { Navigation, LocateFixed } from 'lucide-react';

export const ARRIVAL_RADIUS_METERS = 30;

interface MechanicMapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isAssigned?: boolean;
}

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  customerLocation?: [number, number];
  mechanicLocations?: MechanicMapLocation[];
  bookingStatus?: string;
  bookingId?: string;
  onArrivalReached?: () => void;
  onProgressUpdate?: (remainingKm: number, etaMins: number) => void;
}

/**
 * Calculates bearing heading angle (0 to 360 deg) from point A to point B
 */
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(radLat2);
  const x =
    Math.cos(radLat1) * Math.sin(radLat2) -
    Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(dLng);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Normalizes rotation delta to prevent 360-degree spinning flip glitches
 */
function getShortestRotationAngle(prevAngle: number, targetAngle: number): number {
  let delta = (targetAngle - prevAngle) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return prevAngle + delta;
}

/**
 * Creates custom top-down 3D vehicle vector icon for assigned mechanic marker
 */
function create3DVehicleIcon(heading: number) {
  return L.divIcon({
    className: 'custom-3d-vehicle-marker',
    html: `
      <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
        <!-- Vehicle Shadow -->
        <div style="
          position: absolute;
          width: 32px;
          height: 48px;
          background: rgba(0, 0, 0, 0.45);
          filter: blur(5px);
          border-radius: 12px;
          transform: rotate(${heading}deg) translate(2px, 4px);
        "></div>
        
        <!-- 3D Vehicle Container with Heading Rotation -->
        <div style="
          position: relative;
          width: 36px;
          height: 52px;
          transform: rotate(${heading}deg);
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        ">
          <!-- Outer Vehicle Body (Top-Down Sports/Service Car) -->
          <svg viewBox="0 0 100 160" width="36" height="52" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
            <defs>
              <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0284c7" />
                <stop offset="50%" stop-color="#0369a1" />
                <stop offset="100%" stop-color="#075985" />
              </linearGradient>
              <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#1e293b" />
              </linearGradient>
              <linearGradient id="lightBeam" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="rgba(255,255,255,0)" />
                <stop offset="100%" stop-color="rgba(56, 189, 248, 0.75)" />
              </linearGradient>
            </defs>

            <!-- Front Headlight Beams -->
            <polygon points="15,25 -10,-15 35,-15" fill="url(#lightBeam)" />
            <polygon points="85,25 65,-15 110,-15" fill="url(#lightBeam)" />

            <!-- Main Chassis -->
            <rect x="12" y="20" width="76" height="120" rx="20" fill="url(#carBody)" stroke="#38bdf8" stroke-width="3" />

            <!-- Front Bumper & Grill -->
            <rect x="22" y="16" width="56" height="8" rx="4" fill="#0f172a" />

            <!-- Front Windshield -->
            <path d="M22 55 L30 36 L70 36 L78 55 Z" fill="#38bdf8" opacity="0.95" />

            <!-- Car Roof -->
            <rect x="24" y="55" width="52" height="50" rx="8" fill="url(#roofGrad)" stroke="#334155" stroke-width="2" />
            
            <!-- Mechanic Wrench Emblem on Roof -->
            <circle cx="50" cy="80" r="14" fill="#0284c7" />
            <text x="50" y="86" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">🔧</text>

            <!-- Rear Glass -->
            <path d="M26 105 L32 118 L68 118 L74 105 Z" fill="#38bdf8" opacity="0.85" />

            <!-- Side Mirrors -->
            <rect x="2" y="44" width="10" height="14" rx="4" fill="#0284c7" />
            <rect x="88" y="44" width="10" height="14" rx="4" fill="#0284c7" />

            <!-- Tail Lights -->
            <rect x="18" y="136" width="16" height="6" rx="2" fill="#ef4444" />
            <rect x="66" y="136" width="16" height="6" rx="2" fill="#ef4444" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28]
  });
}

const customerIcon = L.divIcon({
  className: 'custom-customer-pin',
  html: `
    <div class="relative flex items-center justify-center w-9 h-9">
      <div class="absolute w-9 h-9 bg-sky-500/30 rounded-full animate-ping"></div>
      <div class="relative w-7 h-7 bg-sky-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
        📍
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const unassignedMechanicIcon = L.divIcon({
  className: 'custom-unassigned-mechanic-pin',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="w-8 h-8 bg-amber-500 rounded-full border-2 border-slate-900 shadow-lg flex items-center justify-center text-slate-950 text-xs font-bold">
        🔧
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

/**
 * Map controller component to handle smooth bounds re-centering and manual pan override
 */
const MapCameraController: React.FC<{
  center: [number, number];
  mechanicPos?: [number, number];
  customerPos?: [number, number];
  isNavigating: boolean;
  isAutoFollow: boolean;
  onUserInteraction: () => void;
}> = ({ center, mechanicPos, customerPos, isNavigating, isAutoFollow, onUserInteraction }) => {
  const map = useMap();

  useMapEvents({
    dragstart: () => onUserInteraction(),
    zoomstart: () => onUserInteraction()
  });

  useEffect(() => {
    if (!isAutoFollow) return;

    if (isNavigating && mechanicPos && customerPos) {
      const bounds = L.latLngBounds([mechanicPos, customerPos]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
    } else {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, mechanicPos, customerPos, isNavigating, isAutoFollow, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 14,
  customerLocation,
  mechanicLocations = [],
  bookingStatus,
  bookingId,
  onArrivalReached,
  onProgressUpdate
}) => {
  const isNavigating = bookingStatus === 'EN_ROUTE';
  const assignedMechanic = mechanicLocations.find(m => m.isAssigned);

  // Route & Navigation States
  const [fullRoute, setFullRoute] = useState<RouteResult | null>(null);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const [currentMechanicPos, setCurrentMechanicPos] = useState<[number, number] | null>(null);
  const [headingAngle, setHeadingAngle] = useState<number>(0);
  const [isAutoFollow, setIsAutoFollow] = useState<boolean>(true);

  const prevHeadingRef = useRef<number>(0);
  const movementTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const arrivalFiredRef = useRef<boolean>(false);

  // Load road network route whenever origin or destination changes during EN_ROUTE
  useEffect(() => {
    let isSubscribed = true;

    if (isNavigating && assignedMechanic && customerLocation) {
      fetchRoadRoute(
        assignedMechanic.lat,
        assignedMechanic.lng,
        customerLocation[0],
        customerLocation[1]
      ).then(routeRes => {
        if (isSubscribed) {
          setFullRoute(routeRes);
          setCurrentWaypointIndex(0);
          if (routeRes.coordinates.length > 0) {
            setCurrentMechanicPos(routeRes.coordinates[0]);
          }
        }
      });
    } else {
      setFullRoute(null);
      setCurrentWaypointIndex(0);
      setCurrentMechanicPos(assignedMechanic ? [assignedMechanic.lat, assignedMechanic.lng] : null);
    }

    return () => {
      isSubscribed = false;
    };
  }, [isNavigating, assignedMechanic?.lat, assignedMechanic?.lng, customerLocation?.[0], customerLocation?.[1]]);

  // Navigation movement loop along road route
  useEffect(() => {
    // CRITICAL: Stop movement timer completely if status is NOT EN_ROUTE or route is empty
    if (!isNavigating || !fullRoute || fullRoute.coordinates.length < 2) {
      if (movementTimerRef.current) {
        clearInterval(movementTimerRef.current);
        movementTimerRef.current = null;
      }
      return;
    }

    arrivalFiredRef.current = false;
    const coords = fullRoute.coordinates;

    movementTimerRef.current = setInterval(() => {
      setCurrentWaypointIndex(prevIdx => {
        const nextIdx = prevIdx + 1;

        if (nextIdx >= coords.length) {
          // Reached exact end destination
          if (movementTimerRef.current) {
            clearInterval(movementTimerRef.current);
            movementTimerRef.current = null;
          }

          if (customerLocation) {
            setCurrentMechanicPos(customerLocation);
          }

          if (!arrivalFiredRef.current && onArrivalReached) {
            arrivalFiredRef.current = true;
            onArrivalReached();
          }

          return coords.length - 1;
        }

        const prevPos = coords[prevIdx];
        const nextPos = coords[nextIdx];

        // Update mechanic position smoothly
        setCurrentMechanicPos(nextPos);

        // Compute vehicle rotation heading
        const rawBearing = calculateBearing(prevPos[0], prevPos[1], nextPos[0], nextPos[1]);
        const smoothedAngle = getShortestRotationAngle(prevHeadingRef.current, rawBearing);
        prevHeadingRef.current = smoothedAngle;
        setHeadingAngle(smoothedAngle);

        // Check arrival distance threshold (30 meters)
        if (customerLocation) {
          const distanceToCustomer = getHaversineDistanceMeters(
            nextPos[0],
            nextPos[1],
            customerLocation[0],
            customerLocation[1]
          );

          if (distanceToCustomer <= ARRIVAL_RADIUS_METERS) {
            if (movementTimerRef.current) {
              clearInterval(movementTimerRef.current);
              movementTimerRef.current = null;
            }

            if (!arrivalFiredRef.current && onArrivalReached) {
              arrivalFiredRef.current = true;
              onArrivalReached();
            }
          }

          // Compute remaining route distance & ETA for progress callback
          let remainingDistMeters = 0;
          for (let i = nextIdx; i < coords.length - 1; i++) {
            remainingDistMeters += getHaversineDistanceMeters(
              coords[i][0],
              coords[i][1],
              coords[i + 1][0],
              coords[i + 1][1]
            );
          }

          const remainingKm = Math.round((remainingDistMeters / 1000) * 10) / 10;
          const etaMins = Math.max(1, Math.round(remainingDistMeters / 500)); // ~30 km/h speed assumption

          if (onProgressUpdate) {
            onProgressUpdate(remainingKm, etaMins);
          }
        }

        return nextIdx;
      });
    }, 1200);

    return () => {
      if (movementTimerRef.current) {
        clearInterval(movementTimerRef.current);
        movementTimerRef.current = null;
      }
    };
  }, [isNavigating, fullRoute, customerLocation, onArrivalReached, onProgressUpdate]);

  // Derived polyline segments: Completed route (subtle) vs Remaining route (vibrant)
  const completedPath: Array<[number, number]> = fullRoute
    ? fullRoute.coordinates.slice(0, currentWaypointIndex + 1)
    : [];

  const remainingPath: Array<[number, number]> = fullRoute
    ? fullRoute.coordinates.slice(currentWaypointIndex)
    : [];

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '100vh', background: '#0f172a' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCameraController
          center={center}
          mechanicPos={currentMechanicPos || undefined}
          customerPos={customerLocation}
          isNavigating={isNavigating}
          isAutoFollow={isAutoFollow}
          onUserInteraction={() => setIsAutoFollow(false)}
        />

        {/* Customer Breakdown Location Marker */}
        {customerLocation && (
          <Marker position={customerLocation} icon={customerIcon}>
            <Popup className="custom-popup">
              <div className="p-1 font-sans text-xs font-semibold text-slate-800">
                📍 Customer Breakdown Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Mechanics Markers */}
        {mechanicLocations.map(mech => {
          if (mech.isAssigned) {
            const pos: [number, number] = currentMechanicPos || [mech.lat, mech.lng];
            const icon3D = create3DVehicleIcon(headingAngle);

            return (
              <Marker key={mech.id} position={pos} icon={icon3D}>
                <Popup>
                  <div className="p-1 font-sans text-xs text-slate-800">
                    <strong className="block text-slate-900">{mech.name}</strong>
                    <span className="text-sky-600 font-extrabold">
                      {isNavigating ? '🚗 EN ROUTE TO CUSTOMER' : '📍 ARRIVED AT DESTINATION'}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          }

          return (
            <Marker key={mech.id} position={[mech.lat, mech.lng]} icon={unassignedMechanicIcon}>
              <Popup>
                <div className="p-1 font-sans text-xs text-slate-800 font-bold">
                  {mech.name} (Available)
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Completed Route Segment (Subtle Gray/Blue) */}
        {completedPath.length > 1 && (
          <Polyline
            positions={completedPath}
            pathOptions={{ color: '#64748b', weight: 4, opacity: 0.5 }}
          />
        )}

        {/* Remaining Active Road Route Polyline (Vibrant Navigation Style) */}
        {remainingPath.length > 1 && (
          <>
            {/* Outer Route Glow/Outline */}
            <Polyline
              positions={remainingPath}
              pathOptions={{ color: '#0369a1', weight: 9, opacity: 0.4 }}
            />
            {/* Primary Road Polyline */}
            <Polyline
              positions={remainingPath}
              pathOptions={{ color: '#0284c7', weight: 5, opacity: 0.95 }}
            />
          </>
        )}
      </MapContainer>

      {/* Recenter Button when user pans away from active navigation camera */}
      {isNavigating && !isAutoFollow && (
        <button
          onClick={() => setIsAutoFollow(true)}
          className="absolute top-24 right-4 z-[900] bg-slate-900/90 hover:bg-slate-800 border border-sky-500/50 text-sky-400 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 transition-all active:scale-95"
        >
          <LocateFixed className="w-4 h-4 text-sky-400 animate-spin" />
          <span>◎ Recenter Vehicle</span>
        </button>
      )}
    </div>
  );
};
