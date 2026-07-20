"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedPlatformRoute from "@/components/ProtectedPlatformRoute";
import { usePlatformAdmin } from "@/context/PlatformAdminContext";
import { createTenant, TenantCreatePayload } from "@/api/PlatformAdminAPI";
import PasswordInput from "@/components/PasswordInput";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function CreateTenantForm() {
  const router = useRouter();
  const { token } = usePlatformAdmin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [tenantId, setTenantId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [frontendUrl, setFrontendUrl] = useState("");
  const [backendUrl, setBackendUrl] = useState("");
  const [rawConnectionString, setRawConnectionString] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("standard");

  const handleSchoolNameChange = (value: string) => {
    setSchoolName(value);
    if (!tenantId || tenantId === slugify(schoolName)) {
      setTenantId(slugify(value));
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (!tenantId.trim()) {
      setError("Tenant ID is required.");
      return;
    }
    if (!schoolName.trim()) {
      setError("School name is required.");
      return;
    }
    if (!contactEmail.trim()) {
      setError("Contact email is required.");
      return;
    }
    if (!rawConnectionString.trim()) {
      setError("Connection string is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload: TenantCreatePayload = {
      tenant_id: tenantId.trim().toLowerCase(),
      school_name: schoolName.trim(),
      contact_email: contactEmail.trim(),
      raw_connection_string: rawConnectionString.trim(),
    };

    if (address.trim()) payload.address = address.trim();
    if (city.trim()) payload.city = city.trim();
    if (country.trim()) payload.country = country.trim();
    if (logoUrl.trim()) payload.logo_url = logoUrl.trim();
    if (contactPhone.trim()) payload.contact_phone = contactPhone.trim();
    if (adminName.trim()) payload.admin_name = adminName.trim();
    if (adminEmail.trim()) payload.admin_email = adminEmail.trim();
    if (frontendUrl.trim()) payload.frontend_url = frontendUrl.trim();
    if (backendUrl.trim()) payload.backend_url = backendUrl.trim();
    if (subscriptionPlan) payload.subscription_plan = subscriptionPlan;

    try {
      await createTenant(token, payload);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (err?.response?.status === 400) {
        setError("Validation error — please check your input.");
      } else {
        setError("Failed to create tenant. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-md border border-accent/30 bg-accent/10 p-6 text-center">
          <p className="text-lg font-medium text-accent">✅ Tenant created successfully!</p>
          <p className="mt-2 text-sm text-slate">Redirecting to dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/dashboard" className="text-xs uppercase tracking-[0.2em] text-slate hover:text-accent">
        ← Back to schools
      </Link>
      <h1 className="mt-4 font-display text-2xl text-ink">Create Tenant</h1>
      <p className="mt-1 text-sm text-slate">
        Create a new school tenant directly. The tenant will be created in <span className="font-medium">provisioning</span> status.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4 rounded-md border border-line p-4">
          <p className="text-xs uppercase tracking-wide text-slate">Required</p>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">
              Tenant ID <span className="text-warn">*</span>
            </span>
            <input
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="e.g. greenwood_school"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              required
            />
            <span className="mt-1 block text-xs text-slate">
              Lowercase, alphanumeric with underscores or dashes. Used in URLs and as a unique identifier.
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">
              School name <span className="text-warn">*</span>
            </span>
            <input
              value={schoolName}
              onChange={(e) => handleSchoolNameChange(e.target.value)}
              placeholder="e.g. Greenwood High School"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">
              Contact email <span className="text-warn">*</span>
            </span>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="admin@school.edu"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              required
            />
          </label>

          <PasswordInput
            label="Neon connection string"
            value={rawConnectionString}
            onChange={(e) => setRawConnectionString(e.target.value)}
            placeholder="postgresql://user:pass@host/db"
            required
            className="font-mono"
          />
          <span className="mt-1 block text-xs text-slate">
            Encrypted immediately on creation — never shown again after this.
          </span>
        </div>

        <div className="space-y-4 rounded-md border border-line p-4">
          <p className="text-xs uppercase tracking-wide text-slate">Optional</p>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm text-ink">Address</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-ink">City</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">Country</span>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">Logo URL</span>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm text-ink">Contact phone</span>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-ink">Admin name</span>
              <input
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">Admin email</span>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm text-ink">Frontend URL</span>
              <input
                value={frontendUrl}
                onChange={(e) => setFrontendUrl(e.target.value)}
                placeholder="https://school.mzbs.com"
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-ink">Backend URL</span>
              <input
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://api.school.mzbs.com"
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">Subscription plan</span>
            <select
              value={subscriptionPlan}
              onChange={(e) => setSubscriptionPlan(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="trial">Trial</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="rounded-md border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Tenant"}
          </button>
          <Link
            href="/dashboard"
            className="rounded-md border border-line px-6 py-2.5 text-sm text-ink transition hover:border-ink"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

export default function CreateTenantPage() {
  return (
    <ProtectedPlatformRoute>
      <CreateTenantForm />
    </ProtectedPlatformRoute>
  );
}
