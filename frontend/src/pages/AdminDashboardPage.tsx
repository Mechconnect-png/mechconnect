import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { MechanicVerification } from '../components/admin/MechanicVerification';
import { MapView } from '../components/map/MapView';
import { api } from '../services/api';
import { ServiceRequest } from '../types';
import { Users, Wrench, ShieldCheck, DollarSign, Activity, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activeBookings, setActiveBookings] = useState<ServiceRequest[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [dRes, mRes] = await Promise.all([
        api.getAdminDashboard().catch(() => ({ stats: null, activeBookings: [] })),
        api.getAdminMechanics().catch(() => ({ mechanics: [] }))
      ]);

      setStats(dRes.stats);
      setActiveBookings(dRes.activeBookings || []);
      setMechanics(mRes.mechanics || []);
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = [
    { name: 'Mon', bookings: 4, revenue: 1800 },
    { name: 'Tue', bookings: 7, revenue: 3200 },
    { name: 'Wed', bookings: 5, revenue: 2400 },
    { name: 'Thu', bookings: 9, revenue: 4100 },
    { name: 'Fri', bookings: 12, revenue: 5800 },
    { name: 'Sat', bookings: 15, revenue: 7200 },
    { name: 'Sun', bookings: 11, revenue: 5100 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4 sm:px-6">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-400" /> Admin Command Center
          </h2>
          <p className="text-xs text-slate-400">System governance, active map monitoring, revenue reports & verification</p>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Total Users</span>
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.totalUsers || 14}</div>
            <span className="text-[10px] text-sky-400 font-semibold">{stats?.totalCustomers || 10} Customers • {stats?.totalMechanics || 4} Mechanics</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Verified Mechanics</span>
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.verifiedMechanics || 3}</div>
            <span className="text-[10px] text-amber-400 font-semibold">{stats?.pendingMechanics || 1} Verification Pending</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Active Assistance</span>
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-white">{stats?.activeBookingsCount || activeBookings.length}</div>
            <span className="text-[10px] text-emerald-400 font-semibold">Live Socket.IO Dispatch</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Platform Revenue</span>
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">₹{stats?.totalRevenue || 12400}</div>
            <span className="text-[10px] text-purple-400 font-semibold">Zero-Cost Simulated Billing</span>
          </div>
        </div>

        {/* Analytics Chart & Map Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Weekly Booking Trends & Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Bookings Map Monitor */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col">
            <h3 className="text-base font-extrabold text-white">Live Active Assistance Map Monitor</h3>
            <div className="flex-1 min-h-[250px] rounded-2xl overflow-hidden border border-slate-800">
              <MapView
                center={[13.0827, 80.2707]}
                zoom={12}
                mechanicLocations={[
                  { id: 'm1', name: 'Karthik Raja', lat: 13.0890, lng: 80.2750, isAssigned: true },
                  { id: 'm2', name: 'Suresh Kumar', lat: 13.0750, lng: 80.2600, isAssigned: false }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Mechanic Verification Governance Table */}
        <MechanicVerification mechanics={mechanics} onRefresh={loadAdminData} />
      </div>
    </div>
  );
};
