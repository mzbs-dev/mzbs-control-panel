import SectionTitle from "../components/SectionTitle";
import FeatureCard from "../components/FeatureCard";
import CTASection from "../components/CTASection";
import { Icons } from "../components/FeatureIcons";

const features = [
  {
    icon: Icons.Students,
    title: "Student Management",
    description: "Complete student profiles with enrollment dates, academic history, and real-time status tracking.",
  },
  {
    icon: Icons.Attendance,
    title: "Attendance Tracking",
    description: "Mark attendance for students and staff. View attendance reports and track patterns over time.",
  },
  {
    icon: Icons.Exam,
    title: "Exam & Grade Management",
    description: "Create exams, record marks, calculate grades, and generate report cards automatically.",
  },
  {
    icon: Icons.Staff,
    title: "Staff Management",
    description: "Manage staff profiles, assignments, and professional development tracking.",
  },
  {
    icon: Icons.Fees,
    title: "Fee Management",
    description: "Set up fee structures, track payments, send reminders, and generate fee reports.",
  },
  {
    icon: Icons.Accounting,
    title: "Income & Expense Management",
    description: "Complete financial tracking with income, expenses, and detailed financial reports.",
  },
  {
    icon: Icons.Reports,
    title: "Reports & Analytics",
    description: "Generate comprehensive reports on students, attendance, exam results, and finances.",
  },
  {
    icon: Icons.Calendar,
    title: "Academic Calendar",
    description: "Manage school events, holidays, and academic sessions with an integrated calendar.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl md:text-5xl text-ink">Features</h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-slate">
            Everything you need to manage your school efficiently
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <CTASection
            title="Ready to get started?"
            subtitle="Join schools already using mzbs."
            cta="Register your school"
            href="/signup"
          />
        </div>
      </section>
    </>
  );
}
