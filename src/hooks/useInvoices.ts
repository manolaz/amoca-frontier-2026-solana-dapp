import { useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

import { ChainContext } from '../context/ChainContext';
import { RpcContext } from '../context/RpcContext';
import {
    INVOICE_STATUS_COLORS,
    INVOICE_STATUS_LABELS,
    InvoiceStatus,
    type InvoiceStatusValue,
} from '../programs/constants';
import type { InvoiceData } from '../programs/types';

/**
 * Returns mock invoice data seeded for development/demo purposes.
 * Replace the fetcher with real getProgramAccounts calls once the
 * Anchor program is deployed.
 */
function makeMockInvoice(overrides: Partial<InvoiceData> & { publicKey: string }): InvoiceData {
    return {
        invoiceId: 'INV-0001',
        exporter: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        buyer: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
        amountUsdc: BigInt(50_000_000_000), // 50,000 USDC (6 decimals)
        commodityCode: 'SOYBEAN',
        sustainabilityIpfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        carbonScore: 72,
        status: InvoiceStatus.Pending,
        nftMint: null,
        createdAt: BigInt(Math.floor(Date.now() / 1000) - 3600),
        verifiedAt: null,
        rejectionReason: null,
        listedAskPrice: null,
        fundedBy: null,
        fundedAt: null,
        completedAt: null,
        ...overrides,
    };
}

const MOCK_INVOICES: InvoiceData[] = [
    makeMockInvoice({ publicKey: 'pda-001', invoiceId: 'INV-2026-001', amountUsdc: BigInt(50_000_000_000), commodityCode: 'SOYBEAN', status: InvoiceStatus.Pending, carbonScore: 72 }),
    makeMockInvoice({ publicKey: 'pda-002', invoiceId: 'INV-2026-002', amountUsdc: BigInt(125_000_000_000), commodityCode: 'WHEAT', status: InvoiceStatus.Verified, carbonScore: 85, verifiedAt: BigInt(Math.floor(Date.now() / 1000) - 1800), nftMint: 'NFTmint2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }),
    makeMockInvoice({ publicKey: 'pda-003', invoiceId: 'INV-2026-003', amountUsdc: BigInt(88_000_000_000), commodityCode: 'COFFEE', status: InvoiceStatus.Listed, carbonScore: 91, verifiedAt: BigInt(Math.floor(Date.now() / 1000) - 7200), nftMint: 'NFTmint3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', listedAskPrice: BigInt(85_000_000_000) }),
    makeMockInvoice({ publicKey: 'pda-004', invoiceId: 'INV-2026-004', amountUsdc: BigInt(220_000_000_000), commodityCode: 'MAIZE', status: InvoiceStatus.Funded, carbonScore: 68, verifiedAt: BigInt(Math.floor(Date.now() / 1000) - 86400), nftMint: 'NFTmint4xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', fundedBy: 'FinancierXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', fundedAt: BigInt(Math.floor(Date.now() / 1000) - 3600) }),
    makeMockInvoice({ publicKey: 'pda-005', invoiceId: 'INV-2026-005', amountUsdc: BigInt(33_000_000_000), commodityCode: 'COCOA', status: InvoiceStatus.Rejected, carbonScore: 45, rejectionReason: 'Missing phytosanitary certificate' }),
    makeMockInvoice({ publicKey: 'pda-006', invoiceId: 'INV-2026-006', amountUsdc: BigInt(175_000_000_000), commodityCode: 'COTTON', status: InvoiceStatus.Completed, carbonScore: 80, completedAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 2) }),
];

type UseInvoicesOptions = {
    exporter?: string;
    buyer?: string;
    status?: InvoiceStatusValue | InvoiceStatusValue[];
};

/**
 * Fetches invoice accounts from the Tangram Invoice program.
 * Currently returns mock data; swap fetcher for `rpc.getProgramAccounts()`
 * once the Anchor program is live.
 */
export function useInvoices(options: UseInvoicesOptions = {}) {
    const { chain } = useContext(ChainContext);
    const { rpc } = useContext(RpcContext);

    // Key varies by filter so SWR caches per unique query
    const key = useMemo(
        () => ({ type: 'invoices', chain, ...options }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [chain, options.exporter, options.buyer, JSON.stringify(options.status)],
    );

    return useSWR(key, async () => {
        // TODO: replace with real getProgramAccounts call
        // const accounts = await rpc.getProgramAccounts(PROGRAM_ID, { filters: [...] }).send();
        void rpc; // silence unused warning until real impl
        let result = MOCK_INVOICES;
        if (options.exporter) result = result.filter(i => i.exporter === options.exporter);
        if (options.buyer) result = result.filter(i => i.buyer === options.buyer);
        if (options.status !== undefined) {
            const statuses = Array.isArray(options.status) ? options.status : [options.status];
            result = result.filter(i => statuses.includes(i.status as InvoiceStatusValue));
        }
        return result;
    });
}

/** Format USDC amount (6 decimals) to human-readable string */
export function formatUsdc(lamports: bigint): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(lamports) / 1_000_000);
}

export { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, InvoiceStatus };
