export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'law_firm' | 'admin';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  law_firm?: LawFirm;
}

export interface Client {
  id: number;
  user_id: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  phone: string | null;
  preferred_min_rating: number | null;
  preferred_max_distance: number | null;
  preferred_experience: string | null;
  created_at: string;
  updated_at: string;
  specializations?: Specialization[];
  user?: User;
}

export interface LawFirm {
  id: number;
  user_id: number;
  firm_name: string;
  license_number: string | null;
  description: string | null;
  experience_range: string | null;
  lawyers: string[];
  contact_person_name: string | null;
  contact_person_role: string | null;
  contact_person_phone: string | null;
  contact_person_email: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  verified_at: string | null;
  profile_image: string | null;
  profile_image_url: string | null;
  gallery_images?: string[];
  gallery_images_urls?: string[];
  created_at: string;
  updated_at: string;
  specializations?: Specialization[];
  user?: User;
  ratings?: Rating[];
}

export interface Specialization {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  client_id: number;
  law_firm_id: number;
  specialization_id: number | null;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  law_firm?: LawFirm;
  specialization?: Specialization;
  rating?: Rating;
}

export interface Rating {
  id: number;
  client_id: number;
  law_firm_id: number;
  appointment_id: number | null;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  law_firm?: LawFirm;
}

export interface Recommendation {
  law_firm: LawFirm;
  distance_km: number;
  average_rating: number;
  rating_count: number;
  specialization_match: boolean;
  matching_specializations: string[];
  scores: {
    distance: number;
    rating: number;
    specialization: number;
  };
  total_score: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  color: string;
  textColor?: string;
  extendedProps: {
    appointment: Appointment;
  };
}

export interface DashboardStats {
  total_clients: number;
  total_law_firms: number;
  approved_firms: number;
  pending_verifications: number;
  rejected_firms: number;
  total_appointments: number;
  appointments_this_month: number;
  completed_appointments: number;
  average_rating: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
