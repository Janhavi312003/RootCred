import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 py-20">
      {/* Hero section summarising the dApp value proposition. */}
      <section className="rounded-3xl bg-slate-900 px-10 py-16 text-white shadow-xl">
        <div className="max-w-3xl space-y-6">
          <span className="rounded-full bg-slate-800 px-4 py-1 text-sm font-medium uppercase tracking-wide text-teal-300">
            Rootstock Attestation Service
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Issue tamper-proof academic credentials with verifiable on-chain
            attestations.
          </h1>
          <p className="text-lg text-slate-200">
            Empower your institution to publish diplomas, certificates, and badges
            as Ethereum Attestation Service (EAS) records on the Rootstock
            network. Graduates control their credentials and employers can verify
            them instantly.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/issuer"
              className="rounded-full bg-teal-400 px-6 py-3 text-center text-base font-semibold text-slate-900 transition hover:bg-teal-300"
            >
              Issue a Credential
            </Link>
            <Link
              href="/verify"
              className="rounded-full border border-white/40 px-6 py-3 text-center text-base font-semibold text-white transition hover:bg-white/10"
            >
              Verify a Credential
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards explaining the workflow and benefits. */}
      <section className="grid gap-8 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Trusted Issuance</h2>
          <p className="mt-3 text-sm text-slate-600">
            Publish credentials directly from your institution&apos;s wallet using a
            reusable attestation schema purpose-built for academic records.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Instant Verification</h2>
          <p className="mt-3 text-sm text-slate-600">
            Anyone can validate authenticity by querying the attestation UID on the
            Rootstock Attestation Service in seconds.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Privacy by Design</h2>
          <p className="mt-3 text-sm text-slate-600">
            Share only the essential credential metadata on-chain while keeping any
            sensitive student records off-chain by default.
          </p>
        </article>
      </section>
    </main>
  );
}
