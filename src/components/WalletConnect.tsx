'use client';

import { useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function truncateAddress(address?: string) {
    if (!address) return '';
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletConnect() {
    const { address, status } = useAccount();
    const { disconnectAsync, isPending: isDisconnectPending } = useDisconnect();
    const {
        connectAsync,
        connectors,
        isPending: isConnectPending,
        error,
    } = useConnect();

    const handleConnect = useCallback(async () => {
        // Prefer a connector that signals readiness (e.g. MetaMask) but fall back to the first available option.
        const connector = connectors.find((item) => item.ready) ?? connectors[0];

        if (!connector) {
            console.error('No wallet connectors are available.');
            return;
        }

        try {
            await connectAsync({ connector });
        } catch (connectError) {
            console.error(connectError);
        }
    }, [connectAsync, connectors]);

    const handleDisconnect = useCallback(async () => {
        try {
            await disconnectAsync();
        } catch (disconnectError) {
            console.error(disconnectError);
        }
    }, [disconnectAsync]);

    if (status === 'connected') {
        return (
            <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                    {truncateAddress(address || '')}
                </span>
                <button
                    type="button"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    onClick={handleDisconnect}
                    disabled={isDisconnectPending}
                >
                    {isDisconnectPending ? 'Disconnecting…' : 'Disconnect'}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-400"
                onClick={handleConnect}
                disabled={isConnectPending}
            >
                {isConnectPending ? 'Connecting…' : 'Connect Wallet'}
            </button>
            {error ? (
                <p className="text-xs text-red-500">{error.message}</p>
            ) : null}
        </div>
    );
}
