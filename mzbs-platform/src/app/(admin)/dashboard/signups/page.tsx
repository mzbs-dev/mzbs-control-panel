"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedPlatformRoute from "@/components/ProtectedPlatformRoute";
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { usePlatformAdmin } from "@/context/PlatformAdminContext";
import { getSignups, approveSignup, rejectSignup, Signup } from "@/api/PlatformAdminAPI";
import PasswordInput from "@/components/PasswordInput";

function SignupsQueue() {
  const { token } = usePlatformAdmin();
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getSignups(token, "pending");
      setSignups(data);
      setError(null);
    } catch {
      setError("Could not load pending sign-ups.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-slate">Platform admin</p>
      <h1 className="mt-2 font-display text-2xl text-ink">Pending sign-ups</h1>

      {loading && <p className="mt-8 text-sm text-slate">Loading…</p>}
      {error && <p className="mt-8 text-sm text-warn">{error}</p>}

      {!loading && !error && signups.length === 0 && (
        <p className="mt-8 text-sm text-slate">No pending sign-ups right now.</p>
      )}

      <ul className="mt-8 divide-y divide-line border-t border-line">
        {signups.map((s) => (
          <SignupRow key={s.id} signup={s} token={token!} onDone={load} />
        ))}
      </ul>
    </main>
  );
}

function SignupRow({
  signup,
  token,
  onDone,
}: {
  signup: Signup;
  token: string;
  onDone: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tenantId, setTenantId] = useState(signup.desired_subdomain ?? "");
  const [connectionString, setConnectionString] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  async function handleApprove() {
    if (!tenantId || !connectionString) {
      setRowError("tenant_id and connection string are both required to approve.");
      return;
    }
    setBusy(true);
    setRowError(null);
    try {
      await approveSignup(token, signup.id, tenantId, connectionString);
      onDone();
    } catch (err: any) {
      setRowError(err?.response?.data?.detail ?? "Approval failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setRowError("A rejection reason is required.");
      return;
    }
    setBusy(true);
    setRowError(null);
    try {
      await rejectSignup(token, signup.id, rejectReason);
      onDone();
    } catch {
      setRowError("Rejection failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="py-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-medium text-ink">{signup.school_name}</p>
          <p className="text-xs text-slate">
            {signup.admin_name} · {signup.contact_email} · {signup.selected_plan ?? "no plan selected"}
          </p>
        </div>
        <span className="text-xs text-slate">{expanded ? "Hide" : "Review"}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 rounded-md border border-line p-4">
          <div className="text-xs text-slate">
            Submitted {new Date(signup.submitted_at).toLocaleString()}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">tenant_id (confirm or edit)</span>
            <input
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="e.g. greenwood_school"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>

          <PasswordInput
            label="Raw Neon connection string"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder="postgresql://..."
            className="font-mono"
          />
          <span className="mt-1 block text-xs text-slate">
            Encrypted immediately on approval — never shown again after this.
          </span>

          {rowError && <p className="text-sm text-warn">{rowError}</p>}

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              disabled={busy}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
            >
              Approve &amp; create tenant
            </button>
            <button
              onClick={() => setShowReject((v) => !v)}
              className="rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-warn hover:text-warn"
            >
              Reject
            </button>
          </div>

          {showReject && (
            <div className="space-y-2 border-t border-line pt-4">
              <label className="block">
                <span className="mb-1 block text-sm text-ink">Rejection reason</span>
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-warn"
                />
              </label>
              <button
                onClick={handleReject}
                disabled={busy || !rejectReason.trim()}
                className="rounded-md bg-warn px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
              >
                Confirm reject
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function SignupsPage() {
  return (
    <ProtectedPlatformRoute>
      <SignupsQueue />
      <DashboardNavigation />
    </ProtectedPlatformRoute>
  );
}
