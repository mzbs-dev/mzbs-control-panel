"use client";

import { useEffect, useState } from "react";

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}

interface StatsSectionProps {
  stats: StatItem[];
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    stats.forEach((stat, index) => {
      let current = 0;
      const increment = stat.value / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = Math.round(current);
          return newCounts;
        });
      }, interval);

      return () => clearInterval(timer);
    });
  }, [stats]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div key={stat.label} className="text-center">
          <div className="font-display text-3xl md:text-4xl text-accent">
            {counts[index]}
            {stat.suffix}
          </div>
          <p className="mt-1 text-sm text-slate">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
