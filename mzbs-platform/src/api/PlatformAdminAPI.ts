import { api, authHeaders } from "./client";

export interface Signup {
  id: number;
  school_name: string;
  contact_email: string;
  admin_name: string;
  desired_subdomain?: string;
  selected_plan?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export type TenantStatus = "provisioning" | "active" | "suspended" | "expired";

export interface Tenant {
  id: number;
  tenant_id: string;
  school_name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  logo_url?: string | null;
  contact_email: string;
  contact_phone?: string | null;
  admin_name?: string | null;
  admin_email?: string | null;
  frontend_url?: string | null;
  backend_url?: string | null;
  status: TenantStatus;
  subscription_plan?: string | null;
  subscription_expiry?: string | null;
  last_activity_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantCreatePayload {
  tenant_id: string;
  school_name: string;
  address?: string;
  city?: string;
  country?: string;
  logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  admin_name?: string;
  admin_email?: string;
  frontend_url?: string;
  backend_url?: string;
  raw_connection_string: string;
  subscription_plan?: string;
  subscription_expiry?: string;
  signup_request_id?: number;
}

export async function login(email: string, password: string): Promise<string> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const res = await api.post("/platform-admin/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data.access_token as string;
}

export async function getSignups(token: string, status = "pending"): Promise<Signup[]> {
  const res = await api.get<Signup[]>("/platform-admin/signups", {
    ...authHeaders(token),
    params: { status },
  });
  return res.data;
}

export async function approveSignup(
  token: string,
  signupId: number,
  tenantId: string,
  rawConnectionString: string
) {
  const res = await api.post(
    `/platform-admin/signups/${signupId}/approve`,
    { tenant_id: tenantId, raw_connection_string: rawConnectionString },
    authHeaders(token)
  );
  return res.data;
}

export async function rejectSignup(token: string, signupId: number, reason: string) {
  const res = await api.post(
    `/platform-admin/signups/${signupId}/reject`,
    { rejection_reason: reason },
    authHeaders(token)
  );
  return res.data;
}

// ---------- Phase 5: tenant list / detail / status ----------

export async function getTenants(token: string): Promise<Tenant[]> {
  const res = await api.get<Tenant[]>("/platform-admin/tenants", authHeaders(token));
  return res.data;
}

export async function getTenant(token: string, tenantId: string): Promise<Tenant> {
  const res = await api.get<Tenant>(`/platform-admin/tenants/${tenantId}`, authHeaders(token));
  return res.data;
}

export async function updateTenantStatus(
  token: string,
  tenantId: string,
  status: TenantStatus
): Promise<Tenant> {
  const res = await api.patch<Tenant>(
    `/platform-admin/tenants/${tenantId}/status`,
    { status },
    authHeaders(token)
  );
  return res.data;
}

export interface TenantUpdate {
  school_name?: string;
  address?: string;
  city?: string;
  country?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  admin_name?: string;
  admin_email?: string;
  frontend_url?: string;
  backend_url?: string;
  raw_connection_string?: string; // credential rotation — write-only, never comes back in a response
}

export async function updateTenant(
  token: string,
  tenantId: string,
  payload: TenantUpdate
): Promise<Tenant> {
  const res = await api.patch<Tenant>(
    `/platform-admin/tenants/${tenantId}`,
    payload,
    authHeaders(token)
  );
  return res.data;
}

export async function deleteTenant(token: string, tenantId: string): Promise<void> {
  await api.delete(`/platform-admin/tenants/${tenantId}`, authHeaders(token));
}

export async function createTenant(
  token: string,
  payload: TenantCreatePayload
): Promise<Tenant> {
  const res = await api.post<Tenant>("/platform-admin/tenants", payload, authHeaders(token));
  return res.data;
}
