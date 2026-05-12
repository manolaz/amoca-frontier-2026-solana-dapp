import {
    Badge,
    Box,
    Button,
    Callout,
    Card,
    Container,
    Flex,
    Heading,
    Link,
    Spinner,
    Text,
} from '@radix-ui/themes';
import { useState } from 'react';
import { useSWRConfig } from 'swr';

import { CurrencyAmount } from '../components/CurrencyAmount';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { SustainabilityScore } from '../components/SustainabilityScore';
import { WalletGuard } from '../components/WalletGuard';
import { InvoiceStatus, useInvoices } from '../hooks/useInvoices';
import { useTangramProgram } from '../hooks/useTangramProgram';
import type { InvoiceData } from '../programs/types';

function MarketplaceCard({ invoice }: { invoice: InvoiceData }) {
    const [funding, setFunding] = useState(false);
    const [txSig, setTxSig] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const program = useTangramProgram();
    const { mutate } = useSWRConfig();

    async function handleFund() {
        setFunding(true);
        setError(null);
        try {
            const sig = await program.fundInvoice(invoice.publicKey);
            await mutate((key: unknown) => typeof key === 'object' && (key as { type?: string }).type === 'invoices');
            setTxSig(sig);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fund');
        } finally {
            setFunding(false);
        }
    }

    return (
        <Card style={{ border: '1px solid var(--tg-border)', flex: '1 1 300px', maxWidth: 420 }}>
            <Flex direction="column" gap="3">
                {/* NFT placeholder */}
                <Box
                    style={{
                        background: 'linear-gradient(135deg, var(--tg-green) 0%, var(--tg-green-light) 100%)',
                        borderRadius: 8,
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text size="6">🌿</Text>
                    <Flex direction="column" ml="3">
                        <Text size="2" weight="bold" style={{ color: 'white' }}>
                            {invoice.invoiceId}
                        </Text>
                        <Text size="1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Compressed NFT
                        </Text>
                    </Flex>
                </Box>

                <Flex justify="between" align="center">
                    <Badge color="gray" variant="outline">
                        {invoice.commodityCode}
                    </Badge>
                    <InvoiceStatusBadge status={invoice.status} />
                </Flex>

                {/* Face value vs ask */}
                <Flex direction="column" gap="1">
                    <Flex justify="between">
                        <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                            Invoice face value
                        </Text>
                        <CurrencyAmount amount={invoice.amountUsdc} size="2" />
                    </Flex>
                    {invoice.listedAskPrice && (
                        <Flex justify="between">
                            <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                Ask (financing amount)
                            </Text>
                            <CurrencyAmount amount={invoice.listedAskPrice} size="2" weight="bold" />
                        </Flex>
                    )}
                    {invoice.listedAskPrice && (
                        <Flex justify="between">
                            <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                Implied yield
                            </Text>
                            <Text size="2" style={{ color: 'var(--tg-amber-dark)' }} weight="bold">
                                {(
                                    ((Number(invoice.amountUsdc) - Number(invoice.listedAskPrice)) /
                                        Number(invoice.listedAskPrice)) *
                                    100
                                ).toFixed(2)}
                                %
                            </Text>
                        </Flex>
                    )}
                </Flex>

                <SustainabilityScore score={invoice.carbonScore} ipfsHash={invoice.sustainabilityIpfsHash} />

                {/* Exporter (truncated) */}
                <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                    Exporter: {invoice.exporter.slice(0, 8)}…{invoice.exporter.slice(-4)}
                </Text>

                {txSig ? (
                    <Callout.Root color="green">
                        <Callout.Text>
                            Funded!{' '}
                            <Link href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank">
                                {txSig.slice(0, 12)}… ↗
                            </Link>
                        </Callout.Text>
                    </Callout.Root>
                ) : (
                    <>
                        {error && (
                            <Callout.Root color="red">
                                <Callout.Text>{error}</Callout.Text>
                            </Callout.Root>
                        )}
                        <Button color="amber" disabled={funding} onClick={handleFund}>
                            {funding ? <><Spinner /> Funding…</> : '💼 Fund This Invoice'}
                        </Button>
                    </>
                )}
            </Flex>
        </Card>
    );
}

export default function MarketplaceRoute() {
    const { data: listed, isLoading } = useInvoices({ status: InvoiceStatus.Listed });

    return (
        <Container mx={{ initial: '3', xs: '6' }} py="6">
            <Flex direction="column" gap="6">
                <Box>
                    <Heading size="6" style={{ color: 'var(--tg-green-dark)' }}>
                        🏪 Invoice Marketplace
                    </Heading>
                    <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                        Browse tokenized agricultural invoices. Fund verified trade flows and earn yield.
                    </Text>
                </Box>

                {isLoading ? (
                    <Spinner />
                ) : listed && listed.length > 0 ? (
                    <Flex gap="4" wrap="wrap">
                        {listed.map(inv => (
                            <MarketplaceCard key={inv.publicKey} invoice={inv} />
                        ))}
                    </Flex>
                ) : (
                    <Callout.Root color="blue">
                        <Callout.Text>
                            No invoices are listed for financing yet. Check back soon.
                        </Callout.Text>
                    </Callout.Root>
                )}
            </Flex>
        </Container>
    );
}
