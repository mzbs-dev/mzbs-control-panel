import Link from "next/link";
import SectionTitle from "./components/SectionTitle";
import FeatureCard from "./components/FeatureCard";
import TestimonialCard from "./components/TestimonialCard";
import CTASection from "./components/CTASection";
import StatsSection from "./components/StatsSection";
import { Icons } from "./components/FeatureIcons";

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

const stats = [
  { label: "Schools", value: 25 },
  { label: "Students", value: 15000 },
  { label: "Teachers", value: 1200 },
  { label: "Monthly transactions", value: 5000 },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden pt-20 pb-32">
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
            <Link
              href="/signup"
              className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-paper transition hover:opacity-90"
            >
              Register your school
            </Link>
            <Link
              href="/features"
              className="rounded-md border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
            >
              Explore features
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate">
            🚀 No credit card required — start with a free trial
          </p>
        </div>
      </section>

      <section className="py-16 border-y border-line/30">
        <div className="mx-auto max-w-7xl px-6">
          <StatsSection stats={stats} />
        </div>
      </section>

      <section className="py-24">
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

      <section className="py-24 bg-accent/5 border-y border-line/30">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle
            title="What school leaders say"
            subtitle="Schools that have made the switch to mzbs"
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <CTASection
            title="Ready to transform your school management?"
            subtitle="Join schools already using mzbs to streamline their operations."
            cta="Register your school"
            href="/signup"
          />
        </div>
      </section>
    </>
  );
}
