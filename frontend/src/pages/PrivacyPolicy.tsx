export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose mt-8 flex flex-col gap-5 text-sm leading-relaxed text-slate">
        <Section title="What we collect">
          When you create an account, we collect your name, phone number, and (optionally) your email. Sellers
          applying for verification additionally provide an identity document and, for dealers, business details
          such as a GST number. Vehicle listings include the details you provide about the vehicle and any photos
          or documents you upload.
        </Section>
        <Section title="How we use it">
          We use your information to operate the marketplace: showing your listings to buyers, connecting you with
          sellers you contact, verifying seller identity to build trust across the platform, and sending you
          notifications about activity on your account.
        </Section>
        <Section title="What we share">
          Your name and seller type are visible on listings you post. Contact details are only shared with someone
          you choose to message through an enquiry. We do not sell your personal data to third parties.
        </Section>
        <Section title="Your choices">
          You can edit or remove your listings at any time from your dashboard, and you can request account
          deletion by contacting support.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1.5">{children}</p>
    </div>
  );
}
