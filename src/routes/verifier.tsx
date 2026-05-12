import {
    Box,
    Button,
    Callout,
    Card,
    Container,
    Dialog,
    Flex,
    Heading,
    Link,
    Spinner,
    Text,
    TextArea,
} from '@radix-ui/themes';
import { useSelectedWalletAccount } from '@solana/react';
import { useState } from 'react';
import { useSWRConfig } from 'swr';

import { CurrencyAmount } from '../components/CurrencyAmount';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { SustainabilityScore } from '../components/SustainabilityScore';
import { WalletGuard } from '../components/WalletGuard';
import { InvoiceStatus, useInvoices } from '../hooks/useInvoices';
import { useMintInvoiceNFT } from '../hooks/useMintInvoiceNFT';
import { useTangramProgram } from '../hooks/useTangramProgram';
import type { InvoiceData } from '../programs/types';

// ─── Verification Card ──────────────────────────────────────────────────────

function VerificationCard({ invoice }: { invoice: InvoiceData }) {
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [result, setResult] = useState<{ type: 'approve' | 'reject'; sig: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const program = useTangramProgram();
    const { mintInvoiceNFT, isMinting } = useMintInvoiceNFT();
    const { mutate } = useSWRConfig();
    const [selectedWalletAccount] = useSelectedWalletAccount();

    async function handleApprove() {
        setApproving(true);
        setError(null);
        try {
            const sig = await program.verifyInvoice(invoice.publicKey);
            // Mint cNFT for verified invoice
            const { assetId, txSignature: mintTx } = await mintInvoiceNFT({
                invoice,
                walletPublicKey: selectedWalletAccount?.address ?? '',
            });
            await mutate((key: unknown) => typeof key === 'object' && (key as { type?: string }).type === 'invoices');
            setResult({ type: 'approve', sig: mintTx });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to approve');
        } finally {
            setApproving(false);
        }
    }

    async function handleReject() {
        if (!rejectReason.trim()) return;
        setRejecting(true);
        setError(null);
        try {
            const sig = await program.rejectInvoice(invoice.publicKey, rejectReason.trim());
            await mutate((key: unknown) => typeof key === 'object' && (key as { type?: string }).type === 'invoices');
            setResult({ type: 'reject', sig });
            setRejectDialogOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reject');
        } finally {
            setRejecting(false);
        }
    }

    return (
        <Card style={{ border: '1px solid var(--tg-border)' }}>
            <Flex direction="column" gap="3">
                {/* Header */}
                <Flex justify="between" align="start" wrap="wrap" gap="2">
                    <Flex direction="column" gap="1">
                        <Heading size="3" style={{ color: 'var(--tg-green-dark)' }}>
                            {invoice.invoiceId}
                        </Heading>
                        <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                            Commodity: {invoice.commodityCode}
                        </Text>
                    </Flex>
                    <InvoiceStatusBadge status={invoice.status} />
                </Flex>

                {/* Amount */}
                <CurrencyAmount amount={invoice.amountUsdc} size="4" weight="bold" />

                {/* Sustainability */}
                <SustainabilityScore score={invoice.carbonScore} ipfsHash={invoice.sustainabilityIpfsHash} />

                {/* Addresses */}
                <Flex direction="column" gap="1">
                    <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                        Exporter: <code style={{ fontSize: '0.75rem' }}>{invoice.exporter}</code>
                    </Text>
                    <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                        Buyer: <code style={{ fontSize: '0.75rem' }}>{invoice.buyer}</code>
                    </Text>
                    <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                        Submitted:{' '}
                        {new Date(Number(invoice.createdAt) * 1000).toLocaleString()}
                    </Text>
                </Flex>

                {/* Result notification */}
                {result && (
                    <Callout.Root color={result.type === 'approve' ? 'green' : 'orange'}>
                        <Callout.Text>
                            {result.type === 'approve'
                                ? '✅ Approved and cNFT minted! '
                                : '❌ Invoice rejected. '}
                            <Link
                                href={`https://explorer.solana.com/tx/${result.sig}?cluster=devnet`}
                                target="_blank"
                            >
                                TX: {result.sig.slice(0, 16)}… ↗
                            </Link>
                        </Callout.Text>
                    </Callout.Root>
                )}

                {error && (
                    <Callout.Root color="red">
                        <Callout.Text>{error}</Callout.Text>
                    </Callout.Root>
                )}

                {/* Actions */}
                {!result && (
                    <Flex gap="2">
                        <Button
                            color="green"
                            disabled={approving || isMinting}
                            onClick={handleApprove}
                        >
                            {approving || isMinting ? <><Spinner /> Processing…</> : '✅ Approve & Mint cNFT'}
                        </Button>
                        <Button
                            color="red"
                            variant="soft"
                            disabled={approving || isMinting}
                            onClick={() => setRejectDialogOpen(true)}
                        >
                            ❌ Reject
                        </Button>
                    </Flex>
                )}
            </Flex>

            {/* Reject dialog */}
            <Dialog.Root open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <Dialog.Content style={{ maxWidth: 420 }}>
                    <Dialog.Title>Reject Invoice — {invoice.invoiceId}</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                        Provide a reason for rejection. The exporter will see this.
                    </Dialog.Description>
                    <Flex direction="column" gap="3">
                        <TextArea
                            placeholder="e.g. Missing phytosanitary certificate, unverifiable IPFS data…"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows={3}
                        />
                        <Flex gap="2" justify="end">
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button
                                color="red"
                                disabled={!rejectReason.trim() || rejecting}
                                onClick={handleReject}
                            >
                                {rejecting ? <Spinner /> : 'Confirm Rejection'}
                            </Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </Card>
    );
}

// ─── Verifier Dashboard ─────────────────────────────────────────────────────

export default function VerifierRoute() {
    const { data: pending, isLoading } = useInvoices({ status: InvoiceStatus.Pending });

    return (
        <Container mx={{ initial: '3', xs: '6' }} py="6">
            <Flex direction="column" gap="6">
                <Box>
                    <Heading size="6" style={{ color: 'var(--tg-green-dark)' }}>
                        🔍 Verifier Dashboard
                    </Heading>
                    <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                        Review pending invoices and sustainability attestations. Approve to mint a Solana cNFT.
                    </Text>
                </Box>

                <WalletGuard message="Connect your verifier wallet to review and approve invoices.">
                    <Box>
                        <Flex justify="between" align="center" mb="3">
                            <Heading size="4" style={{ color: 'var(--tg-green)' }}>
                                Pending Review Queue
                            </Heading>
                            {pending && (
                                <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                                    {pending.length} invoice{pending.length !== 1 ? 's' : ''} awaiting review
                                </Text>
                            )}
                        </Flex>

                        {isLoading ? (
                            <Spinner />
                        ) : pending && pending.length > 0 ? (
                            <Flex direction="column" gap="4">
                                {pending.map(inv => (
                                    <VerificationCard key={inv.publicKey} invoice={inv} />
                                ))}
                            </Flex>
                        ) : (
                            <Callout.Root color="green">
                                <Callout.Text>
                                    All clear — no invoices pending verification.
                                </Callout.Text>
                            </Callout.Root>
                        )}
                    </Box>
                </WalletGuard>
            </Flex>
        </Container>
    );
}
