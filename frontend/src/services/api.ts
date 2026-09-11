import { AIDiagnosisResult, BookingStatus, ServiceRequest, ServiceType, User, Vehicle } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('mechconnect_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'API Request failed');
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<{ user: User }>('/auth/me'),

  // Customer
  getServiceTypes: () => request<{ serviceTypes: ServiceType[] }>('/customer/service-types'),
  getVehicles: () => request<{ vehicles: Vehicle[] }>('/customer/vehicles'),
  addVehicle: (body: any) => request<{ vehicle: Vehicle }>('/customer/vehicles', { method: 'POST', body: JSON.stringify(body) }),
  deleteVehicle: (id: string) => request<{ message: string }>(`/customer/vehicles/${id}`, { method: 'DELETE' }),
  getActiveBooking: () => request<{ booking: ServiceRequest | null }>('/customer/active-booking'),
  getHistory: () => request<{ history: ServiceRequest[] }>('/customer/history'),

  // Bookings
  createBooking: (body: any) => request<{ booking: ServiceRequest; bestMatch: any; matchedMechanicsCount: number }>('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  cancelBooking: (id: string, reason?: string) => request<{ message: string }>(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  acceptBooking: (id: string) => request<{ booking: ServiceRequest }>(`/bookings/${id}/accept`, { method: 'POST' }),
  updateBookingStatus: (id: string, status: BookingStatus, note?: string) => request<{ booking: ServiceRequest }>(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, note }) }),
  addExtraCharge: (bookingId: string, body: { title: string; description?: string; amount: number }) => request<{ charge: any }>(`/bookings/${bookingId}/extra-charge`, { method: 'POST', body: JSON.stringify(body) }),
  respondExtraCharge: (chargeId: string, approved: boolean) => request<{ charge: any }>(`/bookings/extra-charge/${chargeId}/respond`, { method: 'POST', body: JSON.stringify({ approved }) }),
  processPayment: (bookingId: string, method: string) => request<{ booking: ServiceRequest; payment: any }>(`/bookings/${bookingId}/payment`, { method: 'POST', body: JSON.stringify({ method }) }),
  submitRating: (bookingId: string, body: { stars: number; feedbackTags: string[]; reviewText?: string }) => request<{ rating: any }>(`/bookings/${bookingId}/rating`, { method: 'POST', body: JSON.stringify(body) }),

  // Mechanic
  getMechanicProfile: () => request<{ mechanic: any }>('/mechanic/profile'),
  toggleAvailability: (isOnline: boolean) => request<{ isOnline: boolean }>('/mechanic/availability', { method: 'PUT', body: JSON.stringify({ isOnline }) }),
  updateMechanicLocation: (lat: number, lng: number) => request<{ lat: number; lng: number }>('/mechanic/location', { method: 'POST', body: JSON.stringify({ lat, lng }) }),
  getMechanicRequests: () => request<{ requests: ServiceRequest[] }>('/mechanic/requests'),
  getMechanicEarnings: () => request<{ summary: any; jobs: ServiceRequest[] }>('/mechanic/earnings'),

  // Admin
  getAdminDashboard: () => request<{ stats: any; activeBookings: ServiceRequest[] }>('/admin/dashboard'),
  getAdminMechanics: () => request<{ mechanics: any[] }>('/admin/mechanics'),
  verifyMechanic: (id: string, isVerified: boolean) => request<{ mechanic: any }>(`/admin/mechanics/${id}/verify`, { method: 'PUT', body: JSON.stringify({ isVerified }) }),
  getAdminBookings: () => request<{ bookings: ServiceRequest[] }>('/admin/bookings'),

  // AI Diagnosis
  diagnoseAI: (body: any) => request<{ diagnosis: AIDiagnosisResult }>('/ai/diagnose', { method: 'POST', body: JSON.stringify(body) })
};
