'use client';

import { FormEvent, useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { SCHEMA_DEFINITION, issueCredential, getExplorerLink } from '@/lib/eas';

interface CredentialFormState {
    recipient: string;
    studentName: string;
    degreeName: string;
    institutionName: string;
    dateAwarded: string;
}

const initialFormState: CredentialFormState = {
    recipient: '',
    studentName: '',
    degreeName: '',
    institutionName: '',
    dateAwarded: '',
};

export default function IssuerPage() {
    const [formState, setFormState] = useState<CredentialFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successUid, setSuccessUid] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessUid(null);
        setTxHash(null);

        const timestamp = Math.floor(new Date(formState.dateAwarded).getTime() / 1000);

        if (!Number.isFinite(timestamp) || timestamp <= 0) {
            setErrorMessage('Please provide a valid award date.');
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await issueCredential({
                recipient: formState.recipient,
                studentName: formState.studentName,
                degreeName: formState.degreeName,
                institutionName: formState.institutionName,
                dateAwarded: timestamp,
            });

            setSuccessUid(result.uid);
            setTxHash(result.transactionHash ?? null);
            setFormState(initialFormState);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to issue credential.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
            <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <header className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-900">Credential Issuer</h1>
                    <p className="text-sm text-slate-600">
                        Connect your institution&apos;s wallet and submit the credential details below to
                        publish an attestation on the Rootstock Attestation Service. All fields are
                        included in the attestation payload defined by the schema listed here.
                    </p>
                </header>

                {/* Show the active schema so issuers understand the on-chain data layout. */}
                <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Active Schema
                    </span>
                    <code className="whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm text-slate-700">
                        {SCHEMA_DEFINITION}
                    </code>
                </div>

                {/* Wallet connection controls handled via wagmi. */}
                <WalletConnect />

                {/* Credential issuance form bound to local component state. */}
                <form className="grid gap-6" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <label htmlFor="recipient" className="text-sm font-medium text-slate-700">
                            Recipient Wallet Address
                        </label>
                        <input
                            id="recipient"
                            name="recipient"
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                            placeholder="0x..."
                            value={formState.recipient}
                            onChange={(event) =>
                                setFormState((previous) => ({ ...previous, recipient: event.target.value }))
                            }
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="studentName" className="text-sm font-medium text-slate-700">
                            Student Name
                        </label>
                        <input
                            id="studentName"
                            name="studentName"
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                            placeholder="Ada Lovelace"
                            value={formState.studentName}
                            onChange={(event) =>
                                setFormState((previous) => ({ ...previous, studentName: event.target.value }))
                            }
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="degreeName" className="text-sm font-medium text-slate-700">
                            Degree or Program Name
                        </label>
                        <input
                            id="degreeName"
                            name="degreeName"
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                            placeholder="Bachelor of Computer Science"
                            value={formState.degreeName}
                            onChange={(event) =>
                                setFormState((previous) => ({ ...previous, degreeName: event.target.value }))
                            }
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="institutionName" className="text-sm font-medium text-slate-700">
                            Institution Name
                        </label>
                        <input
                            id="institutionName"
                            name="institutionName"
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                            placeholder="RootCred University"
                            value={formState.institutionName}
                            onChange={(event) =>
                                setFormState((previous) => ({ ...previous, institutionName: event.target.value }))
                            }
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="dateAwarded" className="text-sm font-medium text-slate-700">
                            Date Awarded
                        </label>
                        <input
                            id="dateAwarded"
                            name="dateAwarded"
                            type="date"
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                            value={formState.dateAwarded}
                            onChange={(event) =>
                                setFormState((previous) => ({ ...previous, dateAwarded: event.target.value }))
                            }
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Issuing Credential…' : 'Issue Credential'}
                    </button>
                </form>

                {errorMessage ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </p>
                ) : null}

                {successUid ? (
                    <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        <p className="font-semibold">Credential issued successfully!</p>
                        <p>
                            UID: <span className="font-mono">{successUid}</span>
                        </p>
                        <a
                            href={getExplorerLink(successUid)}
                            className="font-semibold underline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            View on Rootstock Explorer
                        </a>
                        {txHash ? (
                            <p>
                                Transaction Hash: <span className="font-mono break-all text-xs">{txHash}</span>
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </section>
        </main>
    );
}
