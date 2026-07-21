"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedPlatformRoute from "@/components/ProtectedPlatformRoute";
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { usePlatformAdmin } from "@/context/PlatformAdminContext";
import { getTenants, deleteTenant, Tenant, TenantStatus } from "@/api/PlatformAdminAPI";

// Active first, per request — this is also roughly "most to least relevant".
const STATUS_ORDER: TenantStatus[] = ["active", "provisioning", "suspended", "expired"];

const STATUS_STYLES: Record<TenantStatus, string> = {
  active: "bg-accent/10 text-accent",
  provisioning: "bg-slate/10 text-slate",
  suspended: "bg-warn/10 text-warn",
  expired: "bg-warn/10 text-warn",
};

const DELETABLE_STATUSES: TenantStatus[] = ["suspended", "expired"];

function formatDateLocal(dateString: string | null | undefined): string {
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
  }).format(date);
}

function StatusBadge({ status }: { status: TenantStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function TenantRow({
  tenant,
  onDeleteRequested,
}: {
  tenant: Tenant;
  onDeleteRequested: (t: Tenant) => void;
}) {
  const canDelete = DELETABLE_STATUSES.includes(tenant.status);
  return (
    <tr className="hover:bg-slate/5">
      <td className="px-4 py-3">
        <Link href={`/dashboard/${tenant.tenant_id}`} className="font-medium text-ink hover:text-accent">
          {tenant.school_name}
        </Link>
        <p className="text-xs text-slate">{tenant.tenant_id}</p>
      </td>
      <td className="px-4 py-3 text-slate">{tenant.contact_email}</td>
      <td className="px-4 py-3 text-slate">{formatDateLocal(tenant.created_at)}</td>
      <td className="px-4 py-3 text-right">
        {canDelete && (
          <button
            onClick={() => onDeleteRequested(tenant)}
            className="text-xs font-medium text-warn hover:opacity-80"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}

function StatusSection({
  status,
  tenants,
  onDeleteRequested,
}: {
  status: TenantStatus;
  tenants: Tenant[];
  onDeleteRequested: (t: Tenant) => void;
}) {
  if (tenants.length === 0) return null;
  return (
    <div className="mt-8 first:mt-0">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-medium capitalize text-ink">{status}</h2>
        <span className="text-xs text-slate">({tenants.length})</span>
      </div>
      <div className="overflow-hidden rounded-md border border-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-xs uppercase tracking-wide text-slate">
              <th className="px-4 py-3 font-medium">School</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tenants.map((t) => (
              <TenantRow key={t.tenant_id} tenant={t} onDeleteRequested={onDeleteRequested} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TenantsView() {
  const { token, adminName, setToken } = usePlatformAdmin();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<Tenant | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTenants(token);
      setTenants(data);
      setError(null);
    } catch {
      setError("Could not load schools.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const map: Record<TenantStatus, Tenant[]> = {
      active: [],
      provisioning: [],
      suspended: [],
      expired: [],
    };
    for (const t of tenants) {
      map[t.status]?.push(t);
    }
    return map;
  }, [tenants]);

  function requestDelete(t: Tenant) {
    setToDelete(t);
    setConfirmText("");
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!token || !toDelete) return;
    if (confirmText.trim() !== toDelete.tenant_id) {
      setDeleteError("Typed tenant_id doesn't match.");
      return;
    }
    setBusy(true);
    setDeleteError(null);
    try {
      await deleteTenant(token, toDelete.tenant_id);
      setToDelete(null);
      await load();
    } catch (err: any) {
      // Show the backend's error message if available
      const detail = err?.response?.data?.detail;
      if (detail) {
        setDeleteError(detail);
      } else if (err?.response?.status === 500) {
        setDeleteError("Server error — check logs for details.");
      } else {
        setDeleteError("Delete failed — tenant may no longer be suspended/expired.");
      }
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    setToken(null);
    router.replace("/login");
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate">Platform admin</p>
          <h1 className="mt-2 font-display text-2xl text-ink">Schools</h1>
          {adminName && (
            <p className="mt-1 text-sm text-slate">Signed in as {adminName}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLogout}
            className="rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
          >
            Logout
          </button>
          <Link
            href="/dashboard/tenants/create"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90"
          >
            Create Tenant
          </Link>
          <Link
            href="/dashboard/signups"
            className="rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-ink"
          >
            Pending sign-ups
          </Link>
        </div>
      </div>

      {loading && <p className="mt-8 text-sm text-slate">Loading…</p>}
      {error && <p className="mt-8 text-sm text-warn">{error}</p>}

      {!loading && !error && tenants.length === 0 && (
        <p className="mt-8 text-sm text-slate">No schools registered yet.</p>
      )}

      {!loading &&
        !error &&
        STATUS_ORDER.map((status) => (
          <StatusSection
            key={status}
            status={status}
            tenants={grouped[status]}
            onDeleteRequested={requestDelete}
          />
        ))}

      {/* ---------- Delete confirmation: type-to-confirm, since this is irreversible ---------- */}
      {toDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-ink/40 px-6">
          <div className="w-full max-w-sm rounded-md bg-paper p-6 shadow-lg">
            <p className="text-sm text-ink">
              Permanently delete <span className="font-medium">{toDelete.school_name}</span>?
            </p>
            <p className="mt-2 text-xs text-warn">
              This only removes the control-plane record — the school's actual database is
              NOT deleted and will need separate cleanup (e.g. removing the Neon project) if
              that's also wanted. This action cannot be undone here.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs text-slate">
                Type <span className="font-mono">{toDelete.tenant_id}</span> to confirm
              </span>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-warn"
                autoFocus
              />
            </label>
            {deleteError && <p className="mt-2 text-sm text-warn">{deleteError}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setToDelete(null)}
                disabled={busy}
                className="rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={busy || confirmText.trim() !== toDelete.tenant_id}
                className="rounded-md bg-warn px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedPlatformRoute>
      <TenantsView />
      <DashboardNavigation />
    </ProtectedPlatformRoute>
  );
}
