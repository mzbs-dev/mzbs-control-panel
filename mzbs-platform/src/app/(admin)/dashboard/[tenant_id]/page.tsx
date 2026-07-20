"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedPlatformRoute from "@/components/ProtectedPlatformRoute";
import { usePlatformAdmin } from "@/context/PlatformAdminContext";
import {
  getTenant,
  updateTenantStatus,
  updateTenant,
  Tenant,
  TenantStatus,
  TenantUpdate,
} from "@/api/PlatformAdminAPI";

const ALL_STATUSES: TenantStatus[] = ["provisioning", "active", "suspended", "expired"];

const EDITABLE_FIELDS: { key: keyof TenantUpdate; label: string }[] = [
  { key: "school_name", label: "School name" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "admin_name", label: "Admin name" },
  { key: "admin_email", label: "Admin email" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "frontend_url", label: "Frontend URL" },
  { key: "backend_url", label: "Backend URL" },
  { key: "logo_url", label: "Logo URL" },
];

function formatDateTimeLocal(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const normalized = /[zZ]$/.test(dateString) || /[+-]\d{2}:\d{2}$/.test(dateString)
    ? dateString
    : `${dateString.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-line py-3 text-sm last:border-0">
      <span className="text-slate">{label}</span>
      <span className="text-ink">{value || "—"}</span>
    </div>
  );
}

function TenantDetail() {
  const { token } = usePlatformAdmin();
  const params = useParams();
  const tenantId = params.tenant_id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [pendingStatus, setPendingStatus] = useState<TenantStatus | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<TenantUpdate>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const [rotating, setRotating] = useState(false);
  const [newConnectionString, setNewConnectionString] = useState("");
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTenant(token, tenantId);
      setTenant(data);
      setError(null);
    } catch {
      setError("Could not load this school.");
    } finally {
      setLoading(false);
    }
  }, [token, tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  function startEditing() {
    if (!tenant) return;
    setForm({
      school_name: tenant.school_name,
      contact_email: tenant.contact_email,
      contact_phone: tenant.contact_phone ?? "",
      admin_name: tenant.admin_name ?? "",
      admin_email: tenant.admin_email ?? "",
      address: tenant.address ?? "",
      city: tenant.city ?? "",
      country: tenant.country ?? "",
      frontend_url: tenant.frontend_url ?? "",
      backend_url: tenant.backend_url ?? "",
      logo_url: tenant.logo_url ?? "",
    });
    setSaveError(null);
    setEditing(true);
  }

  async function saveEdits() {
    if (!token) return;
    setBusy(true);
    setSaveError(null);
    try {
      const updated = await updateTenant(token, tenantId, form);
      setTenant(updated);
      setEditing(false);
    } catch (err: any) {
      setSaveError(err?.response?.data?.detail ?? "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmStatusChange() {
    if (!token || !pendingStatus) return;
    setBusy(true);
    try {
      const updated = await updateTenantStatus(token, tenantId, pendingStatus);
      setTenant(updated);
      setPendingStatus(null);
    } catch {
      setError("Status change failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmRotateConnectionString() {
    if (!token || !newConnectionString.trim()) return;
    setBusy(true);
    setRotateError(null);
    try {
      const updated = await updateTenant(token, tenantId, {
        raw_connection_string: newConnectionString.trim(),
      });
      setTenant(updated);
      setNewConnectionString("");
      setRotating(false);
      setConfirmRotate(false);
    } catch (err: any) {
      setRotateError(err?.response?.data?.detail ?? "Rotation failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-2xl px-6 py-12 text-sm text-slate">Loading…</main>;
  }

  if (error || !tenant) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm text-warn">{error ?? "School not found."}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-accent">
          Back to schools
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/dashboard" className="text-xs uppercase tracking-[0.2em] text-slate">
        Schools
      </Link>
      <h1 className="mt-2 font-display text-2xl text-ink">{tenant.school_name}</h1>
      <p className="mt-1 text-sm text-slate">{tenant.tenant_id}</p>

      <div className="mt-8 rounded-md border border-line p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">School info</p>
          {!editing && (
            <button
              onClick={startEditing}
              className="text-xs font-medium text-accent hover:opacity-80"
            >
              Edit
            </button>
          )}
        </div>

        {!editing ? (
          <>
            <DetailRow label="Status" value={tenant.status} />
            <DetailRow label="Contact email" value={tenant.contact_email} />
            <DetailRow label="Contact phone" value={tenant.contact_phone} />
            <DetailRow label="Admin" value={tenant.admin_name} />
            <DetailRow label="Admin email" value={tenant.admin_email} />
            <DetailRow
              label="Address"
              value={[tenant.address, tenant.city, tenant.country].filter(Boolean).join(", ")}
            />
            <DetailRow label="Frontend URL" value={tenant.frontend_url} />
            <DetailRow label="Backend URL" value={tenant.backend_url} />
            <DetailRow label="Subscription plan" value={tenant.subscription_plan} />
            <DetailRow
              label="Last activity"
              value={formatDateTimeLocal(tenant.last_activity_at)}
            />
            <DetailRow label="Last updated" value={formatDateTimeLocal(tenant.updated_at)} />
            <DetailRow label="Joined" value={formatDateTimeLocal(tenant.created_at)} />
          </>
        ) : (
          <div className="space-y-3">
            {EDITABLE_FIELDS.map(({ key, label }) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs text-slate">{label}</span>
                <input
                  value={form[key] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
            ))}

            {saveError && <p className="text-sm text-warn">{saveError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={saveEdits}
                disabled={busy}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={busy}
                className="rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-ink disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="mb-2 text-sm text-ink">Change status</p>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              disabled={s === tenant.status || busy}
              onClick={() => setPendingStatus(s)}
              className="rounded-md border border-line px-3 py-1.5 text-sm capitalize text-ink transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-md border border-warn/40 p-4">
        <p className="text-sm font-medium text-ink">Database connection string</p>
        <p className="mt-1 text-xs text-slate">
          Encrypted at rest; never displayed once saved. Only rotate this if you're changing
          this school's actual Neon credentials.
        </p>

        {!rotating ? (
          <button
            onClick={() => setRotating(true)}
            className="mt-3 rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-warn hover:text-warn"
          >
            Rotate connection string
          </button>
        ) : (
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate">New raw connection string</span>
              <input
                value={newConnectionString}
                onChange={(e) => setNewConnectionString(e.target.value)}
                placeholder="postgresql://..."
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-warn"
              />
            </label>
            {rotateError && <p className="text-sm text-warn">{rotateError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRotate(true)}
                disabled={!newConnectionString.trim() || busy}
                className="rounded-md bg-warn px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
              >
                Rotate
              </button>
              <button
                onClick={() => {
                  setRotating(false);
                  setNewConnectionString("");
                  setRotateError(null);
                }}
                disabled={busy}
                className="rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-ink disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {pendingStatus && (
        <div className="fixed inset-0 flex items-center justify-center bg-ink/40 px-6">
          <div className="w-full max-w-sm rounded-md bg-paper p-6 shadow-lg">
            <p className="text-sm text-ink">
              Change <span className="font-medium">{tenant.school_name}</span>&rsquo;s status
              from <span className="font-medium capitalize">{tenant.status}</span> to{" "}
              <span className="font-medium capitalize">{pendingStatus}</span>?
            </p>
            {pendingStatus === "suspended" && (
              <p className="mt-2 text-xs text-warn">
                This immediately blocks login for this school, even for users with an
                already-issued, still-valid token.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setPendingStatus(null)}
                disabled={busy}
                className="rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={busy}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Updating…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmRotate && (
        <div className="fixed inset-0 flex items-center justify-center bg-ink/40 px-6">
          <div className="w-full max-w-sm rounded-md bg-paper p-6 shadow-lg">
            <p className="text-sm text-ink">
              Rotate the database connection string for{" "}
              <span className="font-medium">{tenant.school_name}</span>?
            </p>
            <p className="mt-2 text-xs text-warn">
              If the new connection string is wrong, this school will be unable to log in
              until it's corrected. Double-check it before confirming.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmRotate(false)}
                disabled={busy}
                className="rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRotateConnectionString}
                disabled={busy}
                className="rounded-md bg-warn px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Rotating…" : "Confirm rotation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TenantDetailPage() {
  return (
    <ProtectedPlatformRoute>
      <TenantDetail />
    </ProtectedPlatformRoute>
  );
}
