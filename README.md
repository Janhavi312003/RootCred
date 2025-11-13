# rsks-credential-dapp

A Next.js 14 dApp that lets Rootstock-based institutions issue and verify academic credentials using the Rootstock Attestation Service (RAS), the Rootstock deployment of the Ethereum Attestation Service (EAS).

## Prerequisites

- Node.js 18+
- npm 9+
- A Rootstock Testnet wallet (MetaMask, Rabby, etc.) funded with tRBTC

## Environment Setup

1. Copy the sample environment file and populate it with your configuration:

```bash
cp .env.local.example .env.local
```

2. Set the following values in `.env.local`:

- `NEXT_PUBLIC_RPC_URL` – Rootstock Testnet RPC endpoint (public default provided)
- `NEXT_PUBLIC_EAS_CONTRACT` – Address of the Rootstock Attestation Service contract
- `NEXT_PUBLIC_SCHEMA_UID` – UID returned when you register the credential schema
- `NEXT_PUBLIC_SCHEMA_REGISTRY_CONTRACT` *(optional)* – Override if the registry lives at a different address

> Tip: public infrastructure works for development, but production deployments should use a reliable RPC provider.

## Running the Project

```bash
npm install
npm run dev
```

Open http://localhost:3000 to access the landing page. Navigate to `/issuer` to issue credentials and `/verify` to look up an attestation UID.

## Connecting to Rootstock Testnet

1. Add the Rootstock Testnet to your wallet:
   - Network Name: `Rootstock Testnet`
   - RPC URL: `https://public-node.testnet.rsk.co`
   - Chain ID: `31`
   - Currency Symbol: `tRBTC`
   - Block Explorer: `https://explorer.testnet.rsk.co`
2. Request test funds from the [Rootstock Testnet faucet](https://faucet.rsk.co/).
3. Connect your wallet in the `/issuer` page using the “Connect Wallet” button.

## Registering the Credential Schema

Use the helper exported from `src/lib/eas.ts` to register the schema once per deployment:

```ts
import { registerSchema } from '@/lib/eas';

// Must run in a browser with a connected wallet
const schemaUid = await registerSchema();
console.log(schemaUid);
```

This registers the schema:
```
address recipient,
string studentName,
string degreeName,
string institutionName,
uint64 dateAwarded
```

Copy the returned UID into `NEXT_PUBLIC_SCHEMA_UID` in `.env.local`.

## Issuing Credentials

1. Visit `/issuer` and connect your institution wallet.
2. Fill in the credential details (recipient address, student name, degree, institution, and award date).
3. Click “Issue Credential” and confirm the transaction in your wallet.
4. The page displays the attestation UID and a link to the Rootstock explorer entry.

## Verifying Credentials

1. Navigate to `/verify`.
2. Paste the credential UID supplied by the graduate or issuer.
3. The app queries RAS and displays the attestation status, issuer, and decoded credential details.

## Project Structure Highlights

- `src/app` – Next.js App Router pages (landing, issuer, verify) and layout
- `src/components` – Reusable UI elements (e.g., wallet connect button)
- `src/lib/eas.ts` – Encapsulated EAS/RAS helpers for schema registration, issuing, and fetching attestations

## Deployment

1. Ensure environment variables are configured in your hosting provider (Vercel, Netlify, etc.).
2. Build and start:

```bash
npm run build
npm start
```

3. Confirm wallet connectivity and attestation flows against your chosen Rootstock network.

## Troubleshooting

- **Missing environment variables** – The app throws descriptive errors if a contract address or schema UID is undefined. Double-check `.env.local`.
- **Wallet not detected** – Install MetaMask or a compatible wallet and refresh the page.
- **Attestation not found** – Ensure the UID is correct and the transaction has been mined on Rootstock Testnet.

