import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-line/40 bg-paper p-6 transition hover:shadow-md hover:border-accent/20">
      <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3 text-accent">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate leading-relaxed">{description}</p>
    </div>
  );
}
