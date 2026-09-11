import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { Vehicle } from '../../types';
import { Car, Bike, Truck } from 'lucide-react';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded: (vehicle: Vehicle) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, onVehicleAdded }) => {
  const [type, setType] = useState<'TWO_WHEELER' | 'FOUR_WHEELER' | 'HEAVY'>('FOUR_WHEELER');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [regNumber, setRegNumber] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [isPrimary, setIsPrimary] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !regNumber) {
      setError('Please fill in Brand, Model, and Registration Number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.addVehicle({
        type,
        brand,
        model,
        year,
        regNumber,
        fuelType,
        isPrimary
      });
      onVehicleAdded(res.vehicle);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Vehicle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Vehicle Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Vehicle Type</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('FOUR_WHEELER')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                type === 'FOUR_WHEELER'
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Car className="w-5 h-5" />
              <span className="text-xs">Car / SUV</span>
            </button>

            <button
              type="button"
              onClick={() => setType('TWO_WHEELER')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                type === 'TWO_WHEELER'
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Bike className="w-5 h-5" />
              <span className="text-xs">Bike / Scooter</span>
            </button>

            <button
              type="button"
              onClick={() => setType('HEAVY')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                type === 'HEAVY'
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Truck className="w-5 h-5" />
              <span className="text-xs">Commercial</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
            <input
              type="text"
              placeholder="e.g. Honda, Hyundai"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
            <input
              type="text"
              placeholder="e.g. City, Creta"
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Fuel Type</label>
            <select
              value={fuelType}
              onChange={e => setFuelType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="EV">Electric (EV)</option>
              <option value="CNG">CNG</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reg No.</label>
            <input
              type="text"
              placeholder="TN 07 CX 1234"
              value={regNumber}
              onChange={e => setRegNumber(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 uppercase"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="primary"
            checked={isPrimary}
            onChange={e => setIsPrimary(e.target.checked)}
            className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-800"
          />
          <label htmlFor="primary" className="text-xs text-slate-300">Set as Primary Vehicle</label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 hover:opacity-95 transition-opacity mt-4 uppercase tracking-wider"
        >
          {submitting ? 'Saving Vehicle...' : 'Save Vehicle'}
        </button>
      </form>
    </Modal>
  );
};
