import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../services/api';

interface MechanicVerificationProps {
  mechanics: any[];
  onRefresh: () => void;
}

export const MechanicVerification: React.FC<MechanicVerificationProps> = ({ mechanics, onRefresh }) => {
  const toggleVerify = async (id: string, currentStatus: boolean) => {
    try {
      await api.verifyMechanic(id, !currentStatus);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" /> Mechanic Verification & Governance
          </h3>
          <p className="text-xs text-slate-400">Review technician credentials, background checks, and verification badges</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <th className="pb-3 px-2">Mechanic Name</th>
              <th className="pb-3 px-2">Contact</th>
              <th className="pb-3 px-2">Skills</th>
              <th className="pb-3 px-2">Exp</th>
              <th className="pb-3 px-2">Status</th>
              <th className="pb-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {mechanics.map(m => (
              <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-2 font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm">
                    👨‍🔧
                  </div>
                  {m.user?.name}
                </td>
                <td className="py-3 px-2 text-slate-300">{m.user?.phone || '+91 98765 43210'}</td>
                <td className="py-3 px-2 text-slate-400">{JSON.parse(m.skillsJson || '[]').slice(0, 2).join(', ')}</td>
                <td className="py-3 px-2 text-slate-300">{m.experienceYears} Yrs</td>
                <td className="py-3 px-2">
                  {m.isVerified ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px]">
                      PENDING
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-right">
                  <button
                    onClick={() => toggleVerify(m.id, m.isVerified)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                      m.isVerified
                        ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    }`}
                  >
                    {m.isVerified ? 'Revoke Verification' : 'Approve Mechanic'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
