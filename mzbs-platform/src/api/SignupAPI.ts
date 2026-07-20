import { api } from "./client";

export interface SignupPayload {
  school_name: string;
  address?: string;
  city?: string;
  country?: string;
  contact_phone?: string;
  contact_email: string;
  admin_name: string;
  desired_subdomain?: string;
  students_count?: number;
  staff_count?: number;
  selected_plan?: string;
  website?: string; // honeypot — must stay empty, never shown to real users
}

export interface SignupResponse {
  id: number;
  school_name: string;
  contact_email: string;
  admin_name: string;
  desired_subdomain?: string;
  selected_plan?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
}

export async function submitSignup(payload: SignupPayload): Promise<SignupResponse> {
  const res = await api.post<SignupResponse>("/signup", payload);
  return res.data;
}
