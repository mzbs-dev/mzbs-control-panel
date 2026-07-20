export default function TermsPage() {
  return (
    <>
      <section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl md:text-5xl text-ink">Terms of Service</h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6 prose prose-slate">
          <p className="text-sm text-slate">Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            By using mzbs, you agree to these terms. Please read them carefully.
          </p>
          <h2>Use of the platform</h2>
          <ul>
            <li>You must be authorized to represent your school</li>
            <li>You are responsible for all activity under your account</li>
            <li>You will not misuse or abuse the platform</li>
          </ul>
          <h2>Data ownership</h2>
          <p>
            Your school owns all data you enter into the platform. We do not access or share
            your data except as necessary to provide the service.
          </p>
          <h2>Payment terms</h2>
          <p>
            Plans are billed monthly or annually depending on your subscription.
            All payments are processed securely.
          </p>
          <h2>Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms.
            You may also cancel your account at any time.
          </p>
          <h2>Contact us</h2>
          <p>
            Questions about these terms? Contact us at:
            <br />
            <a href="mailto:legal@mzbs.com">legal@mzbs.com</a>
          </p>
        </div>
      </section>
    </>
  );
}
