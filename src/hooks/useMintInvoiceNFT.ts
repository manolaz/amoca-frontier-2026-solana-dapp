/**
 * UMI + Bubblegum helpers for Tangram Green cNFT minting.
 *
 * Usage:
 *   const { mintInvoiceNFT } = useMintInvoiceNFT();
 *   const { assetId, txSignature } = await mintInvoiceNFT({ invoice, walletPublicKey });
 */
import { useCallback, useState } from 'react';

import { MERKLE_TREE_ADDRESS } from '../programs/constants';
import type { InvoiceData } from '../programs/types';
import { formatUsdc } from './useInvoices';

type MintResult = {
    assetId: string;
    txSignature: string;
};

type MintArgs = {
    invoice: InvoiceData;
    walletPublicKey: string;
};

/**
 * Hook for minting an invoice as a compressed NFT via Metaplex Bubblegum.
 *
 * Real implementation:
 *   import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
 *   import { mplBubblegum, mintToCollectionV1 } from '@metaplex-foundation/mpl-bubblegum';
 *   const umi = createUmi(rpcUrl).use(mplBubblegum()).use(walletAdapterIdentity(wallet));
 *   await mintToCollectionV1(umi, { leafOwner: ..., merkleTree: MERKLE_TREE_ADDRESS, ... });
 */
export function useMintInvoiceNFT() {
    const [isMinting, setIsMinting] = useState(false);
    const [lastMinted, setLastMinted] = useState<MintResult | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const mintInvoiceNFT = useCallback(
        async ({ invoice, walletPublicKey }: MintArgs): Promise<MintResult> => {
            setIsMinting(true);
            setError(null);
            try {
                // TODO: replace stub with real UMI + Bubblegum call
                // const umi = createUmi(rpcUrl).use(mplBubblegum());
                // const { signature } = await mintToCollectionV1(umi, {
                //   leafOwner: publicKey(walletPublicKey),
                //   merkleTree: publicKey(MERKLE_TREE_ADDRESS),
                //   metadata: {
                //     name: `Tangram Invoice ${invoice.invoiceId}`,
                //     uri: `https://ipfs.io/ipfs/${invoice.sustainabilityIpfsHash}`,
                //     sellerFeeBasisPoints: 0,
                //     collection: none(),
                //     creators: [{ address: publicKey(walletPublicKey), verified: true, share: 100 }],
                //   },
                // });
                void walletPublicKey;
                void MERKLE_TREE_ADDRESS;

                await new Promise(r => setTimeout(r, 2000));

                const result: MintResult = {
                    assetId: 'cNFT_' + invoice.invoiceId + '_' + Math.random().toString(36).slice(2, 8),
                    txSignature: 'MOCK_MINT_TX_' + Math.random().toString(36).slice(2, 10).toUpperCase(),
                };

                setLastMinted(result);
                return result;
            } catch (err) {
                const e = err instanceof Error ? err : new Error(String(err));
                setError(e);
                throw e;
            } finally {
                setIsMinting(false);
            }
        },
        [],
    );

    return { mintInvoiceNFT, isMinting, lastMinted, error };
}

/** Build the NFT metadata JSON for an invoice cNFT */
export function buildInvoiceNFTMetadata(invoice: InvoiceData) {
    return {
        name: `Tangram Green — ${invoice.invoiceId}`,
        symbol: 'TGINV',
        description: `Tokenized export invoice ${invoice.invoiceId} for ${invoice.commodityCode} trade on Tangram Green.`,
        image: 'https://tangram.green/assets/invoice-nft-cover.png',
        external_url: `https://tangram.green/invoice/${invoice.invoiceId}`,
        attributes: [
            { trait_type: 'Invoice ID', value: invoice.invoiceId },
            { trait_type: 'Commodity', value: invoice.commodityCode },
            { trait_type: 'Amount USDC', value: formatUsdc(invoice.amountUsdc) },
            { trait_type: 'Carbon Score', value: invoice.carbonScore },
            { trait_type: 'Exporter', value: invoice.exporter },
            { trait_type: 'Buyer', value: invoice.buyer },
            { trait_type: 'Sustainability Hash', value: invoice.sustainabilityIpfsHash },
        ],
        properties: {
            category: 'invoice',
            files: [
                {
                    uri: `https://ipfs.io/ipfs/${invoice.sustainabilityIpfsHash}`,
                    type: 'application/json',
                },
            ],
        },
    };
}
