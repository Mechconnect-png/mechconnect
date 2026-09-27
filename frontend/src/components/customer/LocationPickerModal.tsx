import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { MapView } from '../map/MapView';
import { searchLocationSuggestions, fetchAddressFromCoords, LocationSearchResult } from '../../services/routing';
import { Search, MapPin, LocateFixed, Check, ArrowLeft, Loader2, AlertTriangle, Sparkles } from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat: number;
  initialLng: number;
  initialAddress: string;
  onConfirmLocation: (selected: { lat: number; lng: number; address: string }) => void;
}

const EXAMPLE_LOCATIONS = [
  { label: 'Gandhipuram, Coimbatore', lat: 11.0168, lng: 76.9558, address: 'Gandhipuram, Coimbatore, Tamil Nadu' },
  { label: 'RS Puram, Coimbatore', lat: 11.0084, lng: 76.9463, address: 'RS Puram, Coimbatore, Tamil Nadu' },
  { label: 'Anna Nagar, Chennai', lat: 13.0890, lng: 80.2750, address: 'Anna Nagar, Chennai, Tamil Nadu' },
  { label: 'T Nagar, Chennai', lat: 13.0418, lng: 80.2341, address: 'T Nagar, Chennai, Tamil Nadu' },
  { label: 'Avinashi Road, Coimbatore', lat: 11.0183, lng: 76.9742, address: 'Avinashi Road, Coimbatore, Tamil Nadu' }
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialAddress,
  onConfirmLocation
}) => {
  const [step, setStep] = useState<'SEARCH' | 'PREVIEW'>('SEARCH');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gettingGPS, setGettingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Selected Location State
  const [selectedLat, setSelectedLat] = useState<number>(initialLat);
  const [selectedLng, setSelectedLng] = useState<number>(initialLng);
  const [selectedAddress, setSelectedAddress] = useState<string>(initialAddress);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedLat(initialLat);
      setSelectedLng(initialLng);
      setSelectedAddress(initialAddress || 'Selected Assistance Location');
      setStep('SEARCH');
      setQuery('');
      setSuggestions([]);
      setGpsError(null);
    }
  }, [isOpen, initialLat, initialLng, initialAddress]);

  // Debounced Nominatim Geocoding Autocomplete Search
  const handleQueryChange = (text: string) => {
    setQuery(text);
    setGpsError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    debounceTimerRef.current = setTimeout(async () => {
      const results = await searchLocationSuggestions(text);
      setSuggestions(results);
      setSearching(false);
    }, 350);
  };

  const handleSelectSuggestion = (sug: LocationSearchResult) => {
    // Validate coordinates
    if (isNaN(sug.lat) || isNaN(sug.lng) || sug.lat < -90 || sug.lat > 90 || sug.lng < -180 || sug.lng > 180) {
      alert('Invalid location coordinates received. Please select a valid location.');
      return;
    }

    setSelectedLat(sug.lat);
    setSelectedLng(sug.lng);
    setSelectedAddress(sug.displayName);
    setStep('PREVIEW');
  };

  const handleSelectExampleChip = (ex: typeof EXAMPLE_LOCATIONS[0]) => {
    setSelectedLat(ex.lat);
    setSelectedLng(ex.lng);
    setSelectedAddress(ex.address);
    setStep('PREVIEW');
  };

  const handleUseGPS = () => {
    setGettingGPS(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Unable to access your current location. Please search for your location manually.');
      setGettingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSelectedLat(lat);
        setSelectedLng(lng);
        setIsReverseGeocoding(true);
        const addr = await fetchAddressFromCoords(lat, lng);
        setSelectedAddress(addr);
        setIsReverseGeocoding(false);
        setGettingGPS(false);
        setStep('PREVIEW');
      },
      () => {
        setGpsError('Unable to access your current location. Please search for your location manually.');
        setGettingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleMapPinDragged = async (lat: number, lng: number) => {
    // Validate dragged coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

    setSelectedLat(lat);
    setSelectedLng(lng);
    setIsReverseGeocoding(true);
    const addr = await fetchAddressFromCoords(lat, lng);
    setSelectedAddress(addr);
    setIsReverseGeocoding(false);
  };

  const handleFinalConfirm = () => {
    // Validate final coordinates before confirming
    if (
      isNaN(selectedLat) ||
      isNaN(selectedLng) ||
      selectedLat < -90 ||
      selectedLat > 90 ||
      selectedLng < -180 ||
      selectedLng > 180
    ) {
      alert('Invalid breakdown location selected. Please re-select a valid location.');
      return;
    }

    onConfirmLocation({
      lat: selectedLat,
      lng: selectedLng,
      address: selectedAddress || `Location (${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)})`
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Where is your vehicle?">
      <div className="space-y-4">
        {step === 'SEARCH' ? (
          <div className="space-y-4">
            {/* SEARCH INPUT FIELD */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-sky-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Enter your location (e.g. Gandhipuram, Coimbatore)"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                autoFocus
              />
              {searching && (
                <Loader2 className="absolute right-3.5 top-3.5 w-5 h-5 text-sky-400 animate-spin" />
              )}
            </div>

            {/* GPS LOCATION OPTION */}
            <button
              onClick={handleUseGPS}
              disabled={gettingGPS}
              className="w-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              {gettingGPS ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Fetching Current GPS Location...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-4 h-4 text-sky-400" />
                  <span>Use My Current Location</span>
                </>
              )}
            </button>

            {/* GPS ERROR ALERT */}
            {gpsError && (
              <div className="bg-rose-950/80 border border-rose-600/60 rounded-xl p-3 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* QUICK SUGGESTIONS CHIPS */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Popular Quick Locations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_LOCATIONS.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectExampleChip(ex)}
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{ex.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AUTOCOMPLETE SUGGESTIONS LIST */}
            {suggestions.length > 0 && (
              <div className="space-y-1 bg-slate-900 border border-slate-800 rounded-2xl p-2 max-h-60 overflow-y-auto custom-scrollbar">
                <span className="text-[10px] font-extrabold uppercase text-sky-400 px-2 py-1 block">
                  Search Results ({suggestions.length})
                </span>
                {suggestions.map((sug) => (
                  <button
                    key={sug.placeId}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full text-left p-2.5 hover:bg-slate-800 rounded-xl transition-all flex items-start gap-2.5 group"
                  >
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-white block truncate">
                        {sug.displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Lat: {sug.lat.toFixed(4)}, Lng: {sug.lng.toFixed(4)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: LOCATION CONFIRMATION & DRAGGABLE MARKER PREVIEW */
          <div className="space-y-4">
            <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-3 shadow-lg flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-sky-400 block">
                    📍 Confirmed Breakdown Location
                  </span>
                  <span className="text-xs font-bold text-white block leading-relaxed">
                    {isReverseGeocoding ? 'Updating address from pin...' : selectedAddress}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Coordinates: ({selectedLat.toFixed(5)}, {selectedLng.toFixed(5)})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep('SEARCH')}
                className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1 shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>

            {/* INTERACTIVE MAP PREVIEW WITH DRAGGABLE PIN */}
            <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
              <MapView
                center={[selectedLat, selectedLng]}
                zoom={15}
                customerLocation={[selectedLat, selectedLng]}
                mechanicLocations={[]}
                interactivePin={true}
                onLocationSelect={handleMapPinDragged}
              />

              <div className="absolute bottom-2 left-2 right-2 z-[900] bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 text-center text-[10px] font-bold text-slate-300">
                💡 Tip: Drag the blue marker pin on the map to fine-tune your exact breakdown site.
              </div>
            </div>

            {/* CONFIRM BUTTON */}
            <button
              onClick={handleFinalConfirm}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4 text-white" />
              <span>📍 Confirm Breakdown Location</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
