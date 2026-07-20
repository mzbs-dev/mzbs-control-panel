import Link from "next/link";
import CTASection from "../components/CTASection";

export default function AboutPage() {
  return (
    <>
      <section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl md:text-5xl text-ink">About mzbs</h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-slate">
            Building modern school management for schools of every size
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6 space-y-8 text-slate leading-relaxed">
          <div>
            <h2 className="text-2xl font-display text-ink">Our mission</h2>
            <p className="mt-2">
              At mzbs, we believe that every school deserves access to modern, efficient management tools.
              Our platform is built to simplify school administration so educators can focus on what matters most:
              educating the next generation.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display text-ink">Built for schools, by educators</h2>
            <p className="mt-2">
              We understand the challenges schools face — from managing student records and attendance to
              handling finances and staff. mzbs brings everything together in one intuitive platform,
              designed with real school workflows in mind.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-display text-ink">What makes us different</h2>
            <ul className="mt-2 space-y-3">
              <li className="flex gap-3">
                <span className="text-accent">✓</span>
                <span><strong className="text-ink">Complete isolation</strong> — Each school gets its own dedicated database, ensuring full data privacy and security.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">✓</span>
                <span><strong className="text-ink">Flexible permissions</strong> — Schools can customize role permissions to match their unique staff structure.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">✓</span>
                <span><strong className="text-ink">Purpose-built features</strong> — Everything from student management to financial reporting, all in one place.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent">✓</span>
                <span><strong className="text-ink">Scalable</strong> — Whether you have 50 students or 5,000, mzbs grows with you.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-line/30 bg-accent/5 p-6 text-center">
            <p className="text-lg font-medium text-ink">Ready to bring mzbs to your school?</p>
            <Link
              href="/signup"
              className="mt-3 inline-block rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-paper transition hover:opacity-90"
            >
              Register your school
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <CTASection
            title="Join the mzbs community"
            subtitle="Start your journey to modern school management today."
            cta="Get started"
            href="/signup"
          />
        </div>
      </section>
    </>
  );
}
