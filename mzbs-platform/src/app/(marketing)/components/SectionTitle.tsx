interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionTitle({ title, subtitle, centered = true }: SectionTitleProps) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h2 className="font-display text-3xl md:text-4xl text-ink">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-lg text-slate max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
