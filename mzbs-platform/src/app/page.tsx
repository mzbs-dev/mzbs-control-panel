"use client";

import Link from "next/link";
import { useState } from "react";
import { Icons } from "./(marketing)/components/FeatureIcons";

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <h2 className="font-display text-3xl md:text-4xl text-ink">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-slate max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-line/40 bg-paper p-6 transition hover:shadow-md hover:border-accent/20">
      <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3 text-accent">{icon}</div>
      <h3 className="text-lg font-medium text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, role, school }: { quote: string; name: string; role: string; school: string }) {
  return (
    <div className="rounded-xl border border-line/40 bg-paper p-6">
      <div className="flex items-center gap-1 text-accent">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <blockquote className="mt-4 text-sm text-slate leading-relaxed italic">"{quote}"</blockquote>
      <div className="mt-4">
        <p className="text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-slate">{role}, {school}</p>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  href,
  featured = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-8 ${featured ? "border-accent bg-accent/5 shadow-lg relative" : "border-line/40 bg-paper"}`}>
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-medium text-paper">
          Most popular
        </span>
      )}
      <div className="text-center">
        <h3 className="text-xl font-medium text-ink">{name}</h3>
        <div className="mt-2">
          <span className="font-display text-4xl text-ink">{price}</span>
          {price !== "Free" && <span className="text-slate"> / month</span>}
        </div>
        <p className="mt-2 text-sm text-slate">{description}</p>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-slate">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link href={href} className={`mt-8 block w-full rounded-md py-3 text-center text-sm font-medium transition ${featured ? "bg-accent text-paper hover:opacity-90" : "border border-accent text-accent hover:bg-accent/10"}`}>
        {cta}
      </Link>
    </div>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "Testimonials", id: "testimonials" },
    { label: "FAQ", id: "faq" },
    { label: "Contact", id: "contact" },
  ];

  const features = [
    {
      icon: Icons.Students,
      title: "Student Management",
      description: "Comprehensive student profiles, enrollment tracking, and academic history — all in one place.",
    },
    {
      icon: Icons.Attendance,
      title: "Attendance Tracking",
      description: "Mark and monitor attendance with ease. Real-time tracking for students and staff.",
    },
    {
      icon: Icons.Exam,
      title: "Exam Management",
      description: "Create exams, record marks, and generate performance reports automatically.",
    },
    {
      icon: Icons.Staff,
      title: "Staff Management",
      description: "Manage staff profiles, assignments, and performance — everything for your team.",
    },
    {
      icon: Icons.Fees,
      title: "Fee Management",
      description: "Track payments, generate invoices, and manage fee structures effortlessly.",
    },
    {
      icon: Icons.Accounting,
      title: "Income & Expenses",
      description: "Complete accounting with income tracking, expense management, and financial reporting.",
    },
  ];

  const testimonials = [
    {
      quote: "mzbs has completely transformed how we manage our school. Everything is in one place, and our teachers love it.",
      name: "Sarah Ahmed",
      role: "Principal",
      school: "Greenwood High School",
    },
    {
      quote: "The attendance and exam modules alone have saved us countless hours. I can't imagine going back.",
      name: "Dr. Usman Malik",
      role: "Administrator",
      school: "City School System",
    },
    {
      quote: "Being able to customize permissions per role has been a game-changer for our school's workflow.",
      name: "Fatima Khan",
      role: "Chief Principal",
      school: "National School Network",
    },
  ];

  const plans = [
    {
      name: "Trial",
      price: "Free",
      description: "Perfect for exploring the platform",
      features: ["All core features", "Limited to 50 students", "5 staff accounts", "Standard support"],
      cta: "Start trial",
      href: "/signup",
      featured: false,
    },
    {
      name: "Standard",
      price: "₹2,999",
      description: "Perfect for growing schools",
      features: ["All core features", "Unlimited students", "Unlimited staff", "Advanced reporting", "Priority support"],
      cta: "Get started",
      href: "/signup",
      featured: true,
    },
    {
      name: "Premium",
      price: "₹5,999",
      description: "For large institutions",
      features: ["All Standard features", "Multi-campus support", "Advanced analytics", "Dedicated support"],
      cta: "Contact us",
      href: "/contact",
      featured: false,
    },
  ];

  const faqs = [
    { q: "What is mzbs?", a: "mzbs is a comprehensive school management platform that helps schools manage students, attendance, exams, staff, fees, and more — all in one place." },
    { q: "Is my school's data secure?", a: "Yes. Each school gets its own dedicated database with full data isolation. All sensitive data is encrypted." },
    { q: "How long does it take to set up?", a: "Once your school is approved, we handle the setup for you. Your school's ADMIN can log in and start managing immediately." },
    { q: "Can I customize permissions for different roles?", a: "Absolutely. School Admins can adjust what each role can see and do within the platform." },
    { q: "Is there a free trial?", a: "Yes! Every school starts with a free trial so you can explore all features before committing." },
    { q: "How do I register my school?", a: "Simply fill out the registration form on our sign-up page. Our team will review and reach out to get you started." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="border-b border-line/30 bg-paper/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-paper font-display text-lg font-bold">m</div>
              <span className="font-display text-xl text-ink group-hover:text-accent transition">mzbs</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-slate hover:text-ink transition cursor-pointer">
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm text-slate hover:text-ink transition">Admin login</Link>
              <Link href="/signup" className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-paper transition hover:opacity-90">
                Register school
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate hover:text-ink transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-3.75 5.25h-16.5" />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-line/30 py-4 space-y-3">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="block w-full text-left text-sm text-slate hover:text-ink transition">
                  {item.label}
                </button>
              ))}
              <div className="pt-3 border-t border-line/30 flex flex-col gap-3">
                <Link href="/login" className="text-sm text-slate hover:text-ink transition">Admin login</Link>
                <Link href="/signup" className="inline-block rounded-md bg-accent px-5 py-2 text-sm font-medium text-paper text-center">
                  Register school
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section id="hero" className="relative overflow-hidden pt-20 pb-32">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent">
              🎓 Trusted by schools worldwide
            </div>
            <h1 className="mt-6 font-display text-4xl md:text-6xl text-ink leading-tight">
              Modern school management,
              <br />
              <span className="text-accent">for every school</span>
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-slate">
              Manage students, attendance, exams, staff, fees, and more — all in one platform.
              Built for schools of every size.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-paper transition hover:opacity-90">
                Register your school
              </Link>
              <Link href="/login" className="rounded-md border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink">
                Admin login
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate">🚀 No credit card required — start with a free trial</p>
          </div>
        </section>

        <section id="features" className="py-24 border-y border-line/30">
          <div className="mx-auto max-w-7xl px-6">
            <SectionTitle
              title="Everything you need to run your school"
              subtitle="From attendance to accounting — mzbs brings it all together in one unified platform."
            />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 border-b border-line/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="font-display text-3xl md:text-4xl text-accent">25+</div>
                <p className="mt-1 text-sm text-slate">Schools</p>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl md:text-4xl text-accent">15K+</div>
                <p className="mt-1 text-sm text-slate">Students</p>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl md:text-4xl text-accent">1.2K+</div>
                <p className="mt-1 text-sm text-slate">Teachers</p>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl md:text-4xl text-accent">5K+</div>
                <p className="mt-1 text-sm text-slate">Monthly transactions</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 border-b border-line/30">
          <div className="mx-auto max-w-7xl px-6">
            <SectionTitle title="Simple, transparent pricing" subtitle="Choose the plan that fits your school's needs." />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <PricingCard key={plan.name} {...plan} />
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-24 bg-accent/5 border-b border-line/30">
          <div className="mx-auto max-w-7xl px-6">
            <SectionTitle title="What school leaders say" subtitle="Schools that have made the switch to mzbs" />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 border-b border-line/30">
          <div className="mx-auto max-w-3xl px-6">
            <SectionTitle title="Frequently asked questions" />
            <div className="mt-12 space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="rounded-lg border border-line/30 bg-paper p-4">
                  <summary className="cursor-pointer text-sm font-medium text-ink hover:text-accent transition">
                    {faq.q}
                  </summary>
                  <p className="mt-2 text-sm text-slate leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-2xl bg-accent/5 border border-accent/20 p-12 text-center">
              <h2 className="font-display text-3xl md:text-4xl text-ink">Ready to transform your school management?</h2>
              <p className="mt-3 text-lg text-slate max-w-2xl mx-auto">
                Join schools already using mzbs to streamline their operations.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link href="/signup" className="rounded-md bg-accent px-8 py-3 text-sm font-medium text-paper transition hover:opacity-90">
                  Register your school
                </Link>
                <Link href="/contact" className="rounded-md border border-line px-8 py-3 text-sm font-medium text-ink transition hover:border-ink">
                  Contact sales
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line/30 bg-paper/50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-medium text-ink">Product</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate">
                <li><button onClick={() => scrollToSection("features")} className="hover:text-ink transition cursor-pointer">Features</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="hover:text-ink transition cursor-pointer">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink">Support</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate">
                <li><button onClick={() => scrollToSection("faq")} className="hover:text-ink transition cursor-pointer">FAQ</button></li>
                <li><Link href="/contact" className="hover:text-ink transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink">Legal</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate">
                <li><Link href="/privacy" className="hover:text-ink transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-ink transition">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink">Connect</h3>
              <p className="mt-4 text-sm text-slate">
                Have questions?<br />
                <Link href="/contact" className="text-accent hover:underline">Get in touch</Link>
              </p>
            </div>
          </div>
          <div className="mt-12 border-t border-line/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate">
            <p>&copy; {new Date().getFullYear()} mzbs. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-ink transition">Privacy</Link>
              <Link href="/terms" className="hover:text-ink transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
