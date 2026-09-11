import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { VehicleModal } from '../components/customer/VehicleModal';
import { api } from '../services/api';
import { Vehicle } from '../types';
import { Car, Plus, Trash2, ShieldCheck, Bike, Truck } from 'lucide-react';

export const VehicleManagementPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const res = await api.getVehicles();
      setVehicles(res.vehicles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteVehicle(id);
      loadVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4 sm:px-6">
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Car className="w-6 h-6 text-emerald-400" /> My Vehicle Garage
            </h2>
            <p className="text-xs text-slate-400">Manage registered cars, bikes, and commercial vehicles</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading garage vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-2">
            <Car className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Vehicles Added Yet</h4>
            <p className="text-xs text-slate-400">Add your primary car or bike for fast 1-click roadside requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
                      {v.type === 'TWO_WHEELER' ? <Bike className="w-5 h-5" /> : v.type === 'HEAVY' ? <Truck className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white">{v.brand} {v.model}</h4>
                      <p className="text-xs text-slate-400">{v.year} • {v.fuelType}</p>
                    </div>
                  </div>

                  {v.isPrimary && (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      Primary
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <span className="font-mono font-bold text-sky-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 uppercase">
                    {v.regNumber}
                  </span>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <VehicleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVehicleAdded={() => loadVehicles()}
      />
    </div>
  );
};
