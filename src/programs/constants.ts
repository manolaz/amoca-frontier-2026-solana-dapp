/**
 * Tangram Green — on-chain program constants.
 *
 * Update PROGRAM_ID once the Anchor program is deployed to devnet.
 * Update MERKLE_TREE_ADDRESS after running the create-merkle-tree admin script.
 */

/** Tangram Invoice Anchor program ID (placeholder — replace after `anchor deploy`) */
export const PROGRAM_ID = 'TanGRMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

/**
 * Concurrent Merkle Tree address used for Bubblegum cNFT minting.
 * Create once via: `npx ts-node scripts/create-merkle-tree.ts`
 */
export const MERKLE_TREE_ADDRESS = '11111111111111111111111111111111';

/** Devnet USDC mint (Circle devnet faucet token) */
export const USDC_DEVNET_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

/** Invoice status codes mirroring the on-chain enum */
export const InvoiceStatus = {
    Pending: 0,
    Verified: 1,
    Rejected: 2,
    Listed: 3,
    Funded: 4,
    Completed: 5,
} as const;

export type InvoiceStatusValue = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatusValue, string> = {
    [InvoiceStatus.Pending]: 'Pending',
    [InvoiceStatus.Verified]: 'Verified',
    [InvoiceStatus.Rejected]: 'Rejected',
    [InvoiceStatus.Listed]: 'Listed',
    [InvoiceStatus.Funded]: 'Funded',
    [InvoiceStatus.Completed]: 'Completed',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatusValue, 'orange' | 'green' | 'red' | 'blue' | 'violet' | 'teal'> = {
    [InvoiceStatus.Pending]: 'orange',
    [InvoiceStatus.Verified]: 'green',
    [InvoiceStatus.Rejected]: 'red',
    [InvoiceStatus.Listed]: 'blue',
    [InvoiceStatus.Funded]: 'violet',
    [InvoiceStatus.Completed]: 'teal',
};
