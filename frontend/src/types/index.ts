export type Role = 'CUSTOMER' | 'MECHANIC' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  avatar?: string;
  customerId?: string;
  mechanicId?: string;
  vehicles?: Vehicle[];
  mechanicInfo?: Mechanic;
}

export interface Vehicle {
  id: string;
  customerId: string;
  type: 'TWO_WHEELER' | 'FOUR_WHEELER' | 'HEAVY';
  brand: string;
  model: string;
  year: number;
  regNumber: string;
  fuelType: string;
  isPrimary: boolean;
}

export interface ServiceType {
  id: string;
  key: string;
  name: string;
  category: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  iconName: string;
  description: string;
}

export interface Mechanic {
  id: string;
  userId: string;
  bio?: string;
  skillsJson: string;
  isOnline: boolean;
  isVerified: boolean;
  experienceYears: number;
  hourlyRate: number;
  rating: number;
  totalRatings: number;
  lat?: number;
  lng?: number;
  user?: User;
}

export type BookingStatus =
  | 'CREATED'
  | 'SEARCHING'
  | 'MATCHED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'SERVICING'
  | 'COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'RATED'
  | 'CANCELLED'
  | 'NO_MECHANIC_AVAILABLE';

export interface AdditionalCharge {
  id: string;
  serviceRequestId: string;
  title: string;
  description?: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  serviceRequestId: string;
  senderId: string;
  senderRole: Role;
  message: string;
  timestamp: string;
}

export interface ServiceRequest {
  id: string;
  bookingCode: string;
  customerId: string;
  mechanicId?: string;
  vehicleId: string;
  serviceTypeId: string;
  status: BookingStatus;
  priority?: 'NORMAL' | 'URGENT';
  issueDescription?: string;
  aiDiagnosisJson?: string;
  customerLat: number;
  customerLng: number;
  customerAddress?: string;
  baseAmount: number;
  extraChargesAmount: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  mechanic?: Mechanic;
  customer?: { id: string; user: User };
  vehicle?: Vehicle;
  serviceType?: ServiceType;
  additionalCharges?: AdditionalCharge[];
  chatMessages?: ChatMessage[];
  ratings?: Array<{ id: string; stars: number; reviewText?: string }>;
}

export interface AIDiagnosisResult {
  problem: string;
  confidence: number;
  recommendedServiceKey: string;
  recommendedServiceName: string;
  estimatedCostRange: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  actionSteps: string[];
  explanation: string;
}

export interface MatchedMechanicResult {
  mechanicId: string;
  userId: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalRatings: number;
  experienceYears: number;
  hourlyRate: number;
  skills: string[];
  distanceKm: number;
  etaMinutes: number;
  matchScore: number;
  breakdownScore: {
    distanceScore: number;
    skillScore: number;
    ratingScore: number;
    availabilityScore: number;
  };
  lat: number;
  lng: number;
}
