"use client";

import { useState } from "react";
import CTASection from "../components/CTASection";

const faqs = [
  {
    q: "What is mzbs?",
    a: "mzbs is a comprehensive school management platform that helps schools manage students, attendance, exams, staff, fees, and more — all in one place.",
  },
  {
    q: "Is my school's data secure?",
    a: "Yes. Each school gets its own dedicated database with full data isolation. All sensitive data is encrypted, and we follow industry best practices for security.",
  },
  {
    q: "How long does it take to set up?",
    a: "Once your school is approved, we handle the setup for you. Your school's ADMIN can log in and start managing immediately.",
  },
  {
    q: "Can I customize permissions for different roles?",
    a: "Absolutely. School Admins can adjust what each role (Teacher, Staff, Accountant, etc.) can see and do within the platform.",
  },
  {
    q: "What support do you offer?",
    a: "All plans include support. Standard and Premium plans include priority and dedicated support for faster response times.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. You can switch plans at any time. Contact our team and we'll help you make the transition.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Every school starts with a free trial so you can explore all features before committing.",
  },
  {
    q: "How do I register my school?",
    a: "Simply fill out the registration form on our sign-up page. Our team will review and reach out to get you started.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line/30 last:border-0 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-ink">{question}</span>
        <span className="ml-4 flex-shrink-0 text-accent">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <p className="mt-2 text-sm text-slate leading-relaxed">{answer}</p>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl md:text-5xl text-ink">Frequently Asked Questions</h1>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-slate">
            Everything you need to know about mzbs
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-xl border border-line/30 bg-paper p-6">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <CTASection
            title="Still have questions?"
            subtitle="Our team is here to help."
            cta="Contact us"
            href="/contact"
          />
        </div>
      </section>
    </>
  );
}
