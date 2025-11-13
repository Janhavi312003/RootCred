'use client';

import { FormEvent, useMemo, useState } from 'react';
import { SCHEMA_DEFINITION, getAttestation } from '@/lib/eas';
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

interface DecodedCredential {
    recipient?: string;
    studentName?: string;
    degreeName?: string;
    institutionName?: string;
    dateAwarded?: string;
}

function formatDateFromSeconds(value?: string) {
    if (!value) return 'Unknown';
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds <= 0) return 'Unknown';
    return new Date(seconds * 1000).toLocaleDateString();
}

export default function VerifyPage() {
    const [uidInput, setUidInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [attestationState, setAttestationState] = useState<DecodedCredential | null>(null);
    const [attester, setAttester] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [timestamp, setTimestamp] = useState<number | null>(null);

    // Decoder maps the on-chain encoded bytes back to structured fields.
    const schemaDecoder = useMemo(() => new SchemaEncoder(SCHEMA_DEFINITION), []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            // Retrieve the attestation by UID from the Rootstock Attestation Service.
            const attestation = await getAttestation(uidInput.trim());

            if (!attestation) {
                setErrorMessage('No attestation found for that UID.');
                setAttestationState(null);
                return;
            }

            const decoded = schemaDecoder.decodeData(attestation.data);

            // Convert the decoded fields into a friendlier object keyed by field name.
            const mapped: DecodedCredential = decoded.reduce((accumulator, current) => {
                accumulator[current.name as keyof DecodedCredential] = String(current.value.value);
                return accumulator;
            }, {} as DecodedCredential);

            setAttestationState(mapped);
            setAttester(attestation.attester);
            setTimestamp(Number(attestation.time));

            const isRevoked = attestation.revocationTime > 0;
            const isExpired =
                Number(attestation.expirationTime) !== 0 &&
                Number(attestation.expirationTime) < Date.now() / 1000;

            if (isRevoked) {
                setStatusMessage('Revoked');
            } else if (isExpired) {
                setStatusMessage('Expired');
            } else {
                setStatusMessage('Valid');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to load attestation.';
            setErrorMessage(message);
            setAttestationState(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
            <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <header className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-900">Verify Credential</h1>
                    <p className="text-sm text-slate-600">
                        Paste the UID from an issued credential to fetch its attestation details directly
                        from the Rootstock Attestation Service.
                    </p>
                </header>

                {/* Lookup form that triggers the attestation fetch. */}
                <form className="flex flex-col gap-4 sm:flex-row" onSubmit={handleSubmit}>
                    <input
                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                        placeholder="Enter attestation UID"
                        value={uidInput}
                        onChange={(event) => setUidInput(event.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying…' : 'Verify'}
                    </button>
                </form>

                {errorMessage ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </p>
                ) : null}

                {attestationState ? (
                    <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                        {/* High-level status indicators including revocation and issuer details. */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
                                Status: {statusMessage}
                            </span>
                            {attester ? (
                                <span className="rounded-full bg-white px-4 py-2 font-mono text-xs">
                                    Attester: {attester}
                                </span>
                            ) : null}
                            {timestamp ? (
                                <span className="rounded-full bg-white px-4 py-2 text-xs text-slate-600">
                                    Issued: {new Date(timestamp * 1000).toLocaleString()}
                                </span>
                            ) : null}
                        </div>

                        {/* Detailed credential data decoded from the attestation payload. */}
                        <dl className="grid gap-4 md:grid-cols-2">
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                    Recipient
                                </dt>
                                <dd className="font-mono text-xs md:text-sm">{attestationState.recipient}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                    Student Name
                                </dt>
                                <dd>{attestationState.studentName}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                    Degree Name
                                </dt>
                                <dd>{attestationState.degreeName}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                    Institution
                                </dt>
                                <dd>{attestationState.institutionName}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                    Date Awarded
                                </dt>
                                <dd>{formatDateFromSeconds(attestationState.dateAwarded)}</dd>
                            </div>
                        </dl>
                    </div>
                ) : null}
            </section>
        </main>
    );
}
