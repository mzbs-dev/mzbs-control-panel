import Link from "next/link";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  href,
  featured = false,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-xl border p-8 ${
        featured
          ? "border-accent bg-accent/5 shadow-lg relative"
          : "border-line/40 bg-paper"
      }`}
    >
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
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-8 block w-full rounded-md py-3 text-center text-sm font-medium transition ${
          featured
            ? "bg-accent text-paper hover:opacity-90"
            : "border border-accent text-accent hover:bg-accent/10"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
