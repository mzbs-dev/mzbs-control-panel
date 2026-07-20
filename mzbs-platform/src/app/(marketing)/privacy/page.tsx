export default function PrivacyPage() {
  return (
    <>
      <section className="pt-24 pb-16 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl md:text-5xl text-ink">Privacy Policy</h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6 prose prose-slate">
          <p className="text-sm text-slate">Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            At mzbs, we take your privacy seriously. This policy describes how we collect, use,
            and protect your personal information.
          </p>
          <h2>Information we collect</h2>
          <ul>
            <li>School name, address, and contact details</li>
            <li>Administrator and user contact information</li>
            <li>Usage data within the platform</li>
          </ul>
          <h2>How we use your information</h2>
          <ul>
            <li>To provide and maintain the platform</li>
            <li>To communicate with you about your account</li>
            <li>To improve the platform experience</li>
          </ul>
          <h2>Data security</h2>
          <p>
            Each school's data is stored in its own dedicated database with full data isolation.
            All sensitive data is encrypted both in transit and at rest.
          </p>
          <h2>Contact us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at:
            <br />
            <a href="mailto:privacy@mzbs.com">privacy@mzbs.com</a>
          </p>
        </div>
      </section>
    </>
  );
}
