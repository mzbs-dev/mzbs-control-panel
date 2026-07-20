import SectionTitle from "../components/SectionTitle";
import PricingCard from "../components/PricingCard";
import CTASection from "../components/CTASection";

const plans = [
  {
    name: "Trial",
    price: "Free",
    description: "Perfect for exploring the platform",
    features: [
      "All core features",
      "Limited to 50 students",
      "5 staff accounts",
      "Standard support",
    ],
    cta: "Start trial",
    href: "/signup",
    featured: false,
  },
  {
    name: "Standard",
    price: "₹2,999",
    description: "Perfect for growing schools",
    features: [
      "All core features",
      "Unlimited students",
      "Unlimited staff",
      "Advanced reporting",
      "Priority support",
      "Customization options",
    ],
    cta: "Get started",
    href: "/signup",
    featured: true,
  },
  {
    name: "Premium",
    price: "₹5,999",
    description: "For large institutions",
    features: [
      "All Standard features",
      "Multi-campus support",
      "Advanced analytics",
      "Dedicated support",
      "Custom training",
      "API access",
    ],
    cta: "Contact us",
    href: "/contact",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl md:text-5xl text-ink">Simple, transparent pricing</h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-slate">
            Choose the plan that fits your school's needs.
            <br />
            All plans include a free trial.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <CTASection
            title="Still have questions?"
            subtitle="Our team is here to help you find the right plan for your school."
            cta="Contact us"
            href="/contact"
          />
        </div>
      </section>
    </>
  );
}
