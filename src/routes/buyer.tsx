import {
    Box,
    Button,
    Callout,
    Container,
    Flex,
    Heading,
    Link,
    Spinner,
    Text,
} from '@radix-ui/themes';
import { useState } from 'react';
import { useSWRConfig } from 'swr';

import { InvoiceCard } from '../components/InvoiceCard';
import { WalletGuard } from '../components/WalletGuard';
import { InvoiceStatus, useInvoices } from '../hooks/useInvoices';
import { useTangramProgram } from '../hooks/useTangramProgram';
import type { InvoiceData } from '../programs/types';

function ConfirmReceiptButton({ invoice }: { invoice: InvoiceData }) {
    const [loading, setLoading] = useState(false);
    const [txSig, setTxSig] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const program = useTangramProgram();
    const { mutate } = useSWRConfig();

    if (txSig) {
        return (
            <Callout.Root color="green" style={{ marginTop: 8 }}>
                <Callout.Text>
                    Receipt confirmed!{' '}
                    <Link href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank">
                        {txSig.slice(0, 12)}… ↗
                    </Link>
                </Callout.Text>
            </Callout.Root>
        );
    }

    return (
        <>
            {error && (
                <Callout.Root color="red" mb="2">
                    <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
            )}
            <Button
                color="blue"
                size="2"
                disabled={loading}
                onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                        const sig = await program.confirmReceipt(invoice.publicKey);
                        await mutate(
                            (key: unknown) =>
                                typeof key === 'object' && (key as { type?: string }).type === 'invoices',
                        );
                        setTxSig(sig);
                    } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to confirm');
                    } finally {
                        setLoading(false);
                    }
                }}
            >
                {loading ? <><Spinner /> Confirming…</> : '✅ Confirm Receipt of Goods'}
            </Button>
        </>
    );
}

export default function BuyerRoute() {
    const { data: funded, isLoading } = useInvoices({ status: InvoiceStatus.Funded });
    const { data: completed } = useInvoices({ status: InvoiceStatus.Completed });

    return (
        <Container mx={{ initial: '3', xs: '6' }} py="6">
            <Flex direction="column" gap="6">
                <Box>
                    <Heading size="6" style={{ color: 'var(--tg-green-dark)' }}>
                        🏢 Buyer Dashboard
                    </Heading>
                    <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                        View invoices addressed to you. Confirm receipt of goods to release payment to exporters.
                    </Text>
                </Box>

                <WalletGuard message="Connect your buyer wallet to view invoices addressed to you.">
                    {/* Funded — awaiting receipt confirmation */}
                    <Box>
                        <Heading size="4" mb="3" style={{ color: 'var(--tg-green)' }}>
                            Awaiting Your Confirmation
                        </Heading>
                        {isLoading ? (
                            <Spinner />
                        ) : funded && funded.length > 0 ? (
                            <Flex direction="column" gap="3">
                                {funded.map(inv => (
                                    <InvoiceCard
                                        key={inv.publicKey}
                                        invoice={inv}
                                        actions={<ConfirmReceiptButton invoice={inv} />}
                                    />
                                ))}
                            </Flex>
                        ) : (
                            <Callout.Root color="blue">
                                <Callout.Text>
                                    No funded invoices awaiting your confirmation.
                                </Callout.Text>
                            </Callout.Root>
                        )}
                    </Box>

                    {/* Completed */}
                    {completed && completed.length > 0 && (
                        <Box>
                            <Heading size="4" mb="3" style={{ color: 'var(--tg-text-muted)' }}>
                                Completed
                            </Heading>
                            <Flex direction="column" gap="3">
                                {completed.map(inv => (
                                    <InvoiceCard key={inv.publicKey} invoice={inv} />
                                ))}
                            </Flex>
                        </Box>
                    )}
                </WalletGuard>
            </Flex>
        </Container>
    );
}
