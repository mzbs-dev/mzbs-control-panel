"use client";

import { useState, FormEvent } from "react";
import CTASection from "../components/CTASection";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <>
        <section className="pt-24 pb-32 text-center">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-lg">
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-8">
                <h2 className="font-display text-2xl text-ink">Thank you! 🎉</h2>
                <p className="mt-2 text-slate">
                  We've received your message and will get back to you soon.
                </p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl md:text-5xl text-ink">Contact us</h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-slate">
            Have questions? We'd love to hear from you
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-lg px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm text-ink">
                Name <span className="text-warn">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-ink">
                Email <span className="text-warn">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="school" className="mb-1 block text-sm text-ink">
                School name
              </label>
              <input
                id="school"
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm text-ink">
                Message <span className="text-warn">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent resize-none"
              />
            </div>

            {error && <p className="text-sm text-warn">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-accent py-3 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send message"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate">
            <p>Or reach us directly at:</p>
            <p className="mt-1 text-accent">support@mzbs.com</p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <CTASection
            title="Ready to get started?"
            subtitle="Register your school and start managing today."
            cta="Register now"
            href="/signup"
          />
        </div>
      </section>
    </>
  );
}
