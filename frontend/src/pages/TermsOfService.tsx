export function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 flex flex-col gap-5 text-sm leading-relaxed text-slate">
        <Section title="What Luxura Motors is">
          Luxura Motors is a certified pre-owned vehicle marketplace that connects buyers with individual sellers and
          dealers across India. We provide inspection insights and verified listings — the
          transaction happens directly between buyer and seller with full transparency.
        </Section>
        <Section title="Listings">
          Sellers are responsible for the accuracy of their listings, including the vehicle's condition, ownership
          history, and documentation. Listings are reviewed before going live and may be rejected, suspended, or
          removed if they violate these terms or appear fraudulent.
        </Section>
        <Section title="Verification">
          A "Verified" badge indicates a seller has submitted identity (and for dealers, business) documents that
          Luxura Motors has reviewed. It is not a guarantee of the seller's conduct or the vehicle's condition — always
          inspect a vehicle and verify its documents in person before making a payment.
        </Section>
        <Section title="Payments">
          Luxura Motors does not process payment for vehicles bought or sold through the platform. Fees paid to
          Luxura Motors (subscriptions, featured listings) are for marketplace visibility only.
        </Section>
        <Section title="Account suspension">
          We may suspend accounts or remove listings that violate these terms, including fraudulent listings, spam,
          or abusive behaviour toward other users.
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
