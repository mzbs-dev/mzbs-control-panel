"use client";

import { useState, FormEvent } from "react";
import { submitSignup } from "@/api/SignupAPI";

const PLANS = ["standard", "trial", "premium"];

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [desiredSubdomain, setDesiredSubdomain] = useState("");
  const [studentsCount, setStudentsCount] = useState("");
  const [staffCount, setStaffCount] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [website, setWebsite] = useState(""); // honeypot, always empty for real users

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await submitSignup({
        school_name: schoolName,
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        contact_phone: contactPhone || undefined,
        contact_email: contactEmail,
        admin_name: adminName,
        desired_subdomain: desiredSubdomain || undefined,
        students_count: studentsCount ? Number(studentsCount) : undefined,
        staff_count: staffCount ? Number(staffCount) : undefined,
        selected_plan: selectedPlan,
        website,
      });
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong sending your registration. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Registration received</p>
        <h1 className="font-display text-2xl text-ink">We&apos;ve got your registration</h1>
        <p className="text-slate">
          Our team will review it and be in touch at the email address you provided.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-slate">Register your school</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Bring your school onto mzbs</h1>
      <p className="mt-2 text-slate">
        Tell us about your school. We&apos;ll review this and reach out to set things up.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {/* Honeypot — visually hidden, real users never see or fill this */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="website">Leave this field empty</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <fieldset className="space-y-4 border-t border-line pt-6">
          <legend className="text-xs uppercase tracking-wide text-slate">School</legend>
          <Field label="School name" required>
            <input
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Country">
              <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Address">
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </Field>
        </fieldset>

        <fieldset className="space-y-4 border-t border-line pt-6">
          <legend className="text-xs uppercase tracking-wide text-slate">Contact</legend>
          <Field label="Administrator name" required>
            <input
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact email" required>
              <input
                required
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Contact phone">
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-line pt-6">
          <legend className="text-xs uppercase tracking-wide text-slate">Size &amp; plan</legend>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Number of students">
              <input
                type="number"
                min={0}
                value={studentsCount}
                onChange={(e) => setStudentsCount(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Number of staff">
              <input
                type="number"
                min={0}
                value={staffCount}
                onChange={(e) => setStaffCount(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Desired subdomain" hint="e.g. greenwood — becomes greenwood.mzbs.com">
            <input
              value={desiredSubdomain}
              onChange={(e) => setDesiredSubdomain(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Plan">
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className={inputClass}
            >
              {PLANS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>

        {error && <p className="text-sm text-warn">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent py-3 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send registration"}
        </button>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-accent";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ink">
        {label}
        {required && <span className="text-warn"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate">{hint}</span>}
    </label>
  );
}
