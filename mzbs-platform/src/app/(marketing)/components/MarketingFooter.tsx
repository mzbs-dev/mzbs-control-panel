import Link from "next/link";

export default function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line/30 bg-paper/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-medium text-ink">Product</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate">
              <li><Link href="/features" className="hover:text-ink transition">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-ink transition">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-ink transition">About</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-ink">Support</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate">
              <li><Link href="/faq" className="hover:text-ink transition">FAQ</Link></li>
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
              <Link href="/contact" className="text-accent hover:underline">
                Get in touch
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-line/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate">
          <p>&copy; {currentYear} mzbs. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-ink transition">Privacy</Link>
            <Link href="/terms" className="hover:text-ink transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
