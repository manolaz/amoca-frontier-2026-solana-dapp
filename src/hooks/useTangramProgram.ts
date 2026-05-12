import { useContext, useMemo, useRef, useState } from 'react';

import { RpcContext } from '../context/RpcContext';
import { TANGRAM_INVOICE_IDL } from '../programs/types';

/**
 * Returns a typed Anchor program instance for Tangram Invoice.
 *
 * Requires `@coral-xyz/anchor` and the deployed program IDL.
 * Until the Anchor program is deployed, this returns a stub with
 * instruction builders that simulate on-chain behaviour (dev mode).
 */
export function useTangramProgram() {
    const { rpc } = useContext(RpcContext);
    // When the real IDL JSON is available, do:
    //   import idl from '../programs/tangram_invoice.json';
    //   const program = new anchor.Program(idl, provider);
    void rpc; // used by real implementation
    void TANGRAM_INVOICE_IDL;

    return {
        /** Whether the program is connected (false = stub/demo mode) */
        isLive: false as const,
        /**
         * Submit a new invoice to the program.
         * Real impl: `await program.methods.submitInvoice(...).rpc()`
         */
        submitInvoice: async (args: {
            invoiceId: string;
            amountUsdc: bigint;
            buyer: string;
            commodityCode: string;
            sustainabilityIpfsHash: string;
            carbonScore: number;
        }): Promise<string> => {
            // Simulate network delay
            await new Promise(r => setTimeout(r, 1200));
            return 'MOCK_TX_' + Math.random().toString(36).slice(2, 10).toUpperCase();
        },

        verifyInvoice: async (invoicePda: string): Promise<string> => {
            await new Promise(r => setTimeout(r, 1200));
            void invoicePda;
            return 'MOCK_TX_' + Math.random().toString(36).slice(2, 10).toUpperCase();
        },

        rejectInvoice: async (invoicePda: string, reason: string): Promise<string> => {
            await new Promise(r => setTimeout(r, 1200));
            void invoicePda; void reason;
            return 'MOCK_TX_' + Math.random().toString(36).slice(2, 10).toUpperCase();
        },

        createListing: async (invoicePda: string, askPrice: bigint): Promise<string> => {
            await new Promise(r => setTimeout(r, 1200));
            void invoicePda; void askPrice;
            return 'MOCK_TX_' + Math.random().toString(36).slice(2, 10).toUpperCase();
        },

        fundInvoice: async (invoicePda: string): Promise<string> => {
            await new Promise(r => setTimeout(r, 1500));
            void invoicePda;
            return 'MOCK_TX_' + Math.random().toString(36).slice(2, 10).toUpperCase();
        },

        confirmReceipt: async (invoicePda: string): Promise<string> => {
            await new Promise(r => setTimeout(r, 1200));
            void invoicePda;
            return 'MOCK_TX_' + Math.random().toString(36).slice(2, 10).toUpperCase();
        },

        attachSustainabilityData: async (invoicePda: string, ipfsHash: string, carbonScore: number): Promise<string> => {
            await new Promise(r => setTimeout(r, 1000));
            void invoicePda; void ipfsHash; void carbonScore;
            return 'MOCK_TX_' + Math.random().toString(36).slice(2, 10).toUpperCase();
        },
    };
}
