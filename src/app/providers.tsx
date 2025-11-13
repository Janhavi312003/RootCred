'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

const defaultRpcUrl = 'https://public-node.testnet.rsk.co';
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || defaultRpcUrl;

if (!process.env.NEXT_PUBLIC_RPC_URL) {
    console.warn(
        'NEXT_PUBLIC_RPC_URL is not set. Falling back to the public Rootstock Testnet RPC. Update .env.local to use your own node.'
    );
}

// Minimal Rootstock Testnet chain definition used across wagmi and viem utilities.
const rootstockTestnet = defineChain({
    id: 31,
    name: 'Rootstock Testnet',
    network: 'rootstock-testnet',
    nativeCurrency: {
        name: 'Test RBTC',
        symbol: 'tRBTC',
        decimals: 18,
    },
    rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
    },
    blockExplorers: {
        default: {
            name: 'Rootstock Explorer',
            url: 'https://explorer.testnet.rsk.co',
        },
    },
});

// Global wagmi configuration enabling injected wallets (MetaMask, Rabby, etc.).
const wagmiConfig = createConfig({
    chains: [rootstockTestnet],
    connectors: [injected({ shimDisconnect: true })],
    ssr: true,
    transports: {
        [rootstockTestnet.id]: http(rpcUrl),
    },
});

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    // Create a single QueryClient so React Query caches remain stable across renders.
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    );
}
