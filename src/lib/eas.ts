import { BrowserProvider, JsonRpcProvider, ZeroAddress } from 'ethers';
import {
    EAS,
    SchemaEncoder,
    SchemaRegistry,
    type Attestation,
} from '@ethereum-attestation-service/eas-sdk';

// Pre-computed zero UID used when an attestation does not reference a previous record.
const ZERO_BYTES32 = `0x${'00'.repeat(32)}`;

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://public-node.testnet.rsk.co';
const easContractAddress = process.env.NEXT_PUBLIC_EAS_CONTRACT;
const schemaUidFromEnv = process.env.NEXT_PUBLIC_SCHEMA_UID;
const schemaRegistryAddressOverride = process.env.NEXT_PUBLIC_SCHEMA_REGISTRY_CONTRACT;

if (!process.env.NEXT_PUBLIC_EAS_CONTRACT) {
    console.warn(
        'NEXT_PUBLIC_EAS_CONTRACT is not defined. Set it in .env.local to enable attestation writes.'
    );
}

export const SCHEMA_DEFINITION =
    'address recipient,string studentName,string degreeName,string institutionName,uint64 dateAwarded';

function invariant(variableName: string, value?: string | null): asserts value is string {
    if (!value) {
        throw new Error(`Missing environment variable or configuration value: ${variableName}`);
    }
}

function getReadOnlyEas(): EAS {
    invariant('NEXT_PUBLIC_EAS_CONTRACT', easContractAddress);
    const eas = new EAS(easContractAddress);
    const provider = new JsonRpcProvider(rpcUrl);
    eas.connect(provider);
    return eas;
}

async function getSignerEas(): Promise<EAS> {
    if (typeof window === 'undefined') {
        throw new Error('EAS signing is only available in the browser.');
    }

    invariant('NEXT_PUBLIC_EAS_CONTRACT', easContractAddress);

    const ethereum = (window as typeof window & { ethereum?: unknown }).ethereum;
    if (!ethereum) {
        throw new Error('No injected wallet found. Please install MetaMask or another provider.');
    }

    const provider = new BrowserProvider(ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();

    const eas = new EAS(easContractAddress);
    eas.connect(signer);
    return eas;
}

export interface CredentialPayload {
    recipient: string;
    studentName: string;
    degreeName: string;
    institutionName: string;
    dateAwarded: number;
}

export async function registerSchema() {
    if (typeof window === 'undefined') {
        throw new Error('Schema registration must run in the browser context.');
    }

    invariant('NEXT_PUBLIC_EAS_CONTRACT', easContractAddress);
    const resolvedRegistryAddress = schemaRegistryAddressOverride || easContractAddress;

    const ethereum = (window as typeof window & { ethereum?: unknown }).ethereum;
    if (!ethereum) {
        throw new Error('No injected wallet found. Please install MetaMask or another provider.');
    }

    const provider = new BrowserProvider(ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();

    const registry = new SchemaRegistry(resolvedRegistryAddress);
    registry.connect(signer);

    // Register the schema so future attestations can reference the resulting UID.
    const tx = await registry.register({
        schema: SCHEMA_DEFINITION,
        resolverAddress: ZeroAddress,
        revocable: true,
    });

    const schemaUid = await tx.wait();
    return schemaUid;
}

export interface IssueResult {
    uid: string;
    transactionHash?: string;
}

export async function issueCredential(payload: CredentialPayload): Promise<IssueResult> {
    invariant('NEXT_PUBLIC_SCHEMA_UID', schemaUidFromEnv);

    const eas = await getSignerEas();
    const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITION);

    // Encode the credential fields based on the schema definition so they can be stored on-chain.
    const encodedData = schemaEncoder.encodeData([
        { name: 'recipient', type: 'address', value: payload.recipient },
        { name: 'studentName', type: 'string', value: payload.studentName },
        { name: 'degreeName', type: 'string', value: payload.degreeName },
        { name: 'institutionName', type: 'string', value: payload.institutionName },
        { name: 'dateAwarded', type: 'uint64', value: BigInt(payload.dateAwarded) },
    ]);

    const tx = await eas.attest({
        schema: schemaUidFromEnv,
        data: {
            recipient: payload.recipient,
            expirationTime: 0n,
            revocable: true,
            refUID: ZERO_BYTES32,
            data: encodedData,
            value: 0n,
        },
    });

    const uid = await tx.wait();

    return {
        uid,
        transactionHash: tx.receipt?.hash,
    };
}

export async function getAttestation(uid: string): Promise<Attestation | null> {
    const eas = getReadOnlyEas();
    const attestation = await eas.getAttestation(uid);
    if (!attestation.uid) {
        return null;
    }
    return attestation;
}

export function getExplorerLink(uid: string) {
    return `https://explorer.testnet.rsk.co/attestation/${uid}`;
}
