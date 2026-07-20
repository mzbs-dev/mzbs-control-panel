import Link from "next/link";

interface CTASectionProps {
  title: string;
  subtitle?: string;
  cta: string;
  href: string;
}

export default function CTASection({ title, subtitle, cta, href }: CTASectionProps) {
  return (
    <section className="rounded-2xl bg-accent/5 border border-accent/20 p-12 text-center">
      <h2 className="font-display text-3xl md:text-4xl text-ink">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-slate max-w-2xl mx-auto">{subtitle}</p>}
      <Link
        href={href}
        className="mt-6 inline-block rounded-md bg-accent px-8 py-3 text-sm font-medium text-paper transition hover:opacity-90"
      >
        {cta}
      </Link>
    </section>
  );
}
