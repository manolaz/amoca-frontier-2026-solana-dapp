import { Box, Button, Callout, Container, Flex, Heading, Spinner, Text } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';

import { CurrencyAmount } from '../components/CurrencyAmount';
import { InvoiceCard } from '../components/InvoiceCard';
import { WalletGuard } from '../components/WalletGuard';
import { InvoiceStatus, useInvoices } from '../hooks/useInvoices';

export default function FinancierRoute() {
    const navigate = useNavigate();
    const { data: funded, isLoading: loadingFunded } = useInvoices({ status: InvoiceStatus.Funded });
    const { data: completed, isLoading: loadingCompleted } = useInvoices({ status: InvoiceStatus.Completed });

    const totalDeployed =
        funded?.reduce((sum, inv) => sum + inv.amountUsdc, BigInt(0)) ?? BigInt(0);
    const totalRepaid =
        completed?.reduce((sum, inv) => sum + inv.amountUsdc, BigInt(0)) ?? BigInt(0);

    return (
        <Container mx={{ initial: '3', xs: '6' }} py="6">
            <Flex direction="column" gap="6">
                <Box>
                    <Heading size="6" style={{ color: 'var(--tg-green-dark)' }}>
                        💼 Financier Dashboard
                    </Heading>
                    <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                        Track your active financing positions and completed repayments.
                    </Text>
                </Box>

                <WalletGuard message="Connect your financier wallet to view and manage financing positions.">
                    {/* Summary cards */}
                    <Flex gap="3" wrap="wrap">
                        <Box
                            style={{
                                flex: '1 1 200px',
                                background: 'var(--tg-card-bg)',
                                border: '1px solid var(--tg-border)',
                                borderRadius: 8,
                                padding: '16px 20px',
                            }}
                        >
                            <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                Capital Deployed
                            </Text>
                            <br />
                            <CurrencyAmount amount={totalDeployed} size="5" weight="bold" />
                        </Box>
                        <Box
                            style={{
                                flex: '1 1 200px',
                                background: 'var(--tg-card-bg)',
                                border: '1px solid var(--tg-border)',
                                borderRadius: 8,
                                padding: '16px 20px',
                            }}
                        >
                            <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                Total Repaid
                            </Text>
                            <br />
                            <CurrencyAmount amount={totalRepaid} size="5" weight="bold" />
                        </Box>
                        <Box
                            style={{
                                flex: '1 1 200px',
                                background: 'var(--tg-card-bg)',
                                border: '1px solid var(--tg-border)',
                                borderRadius: 8,
                                padding: '16px 20px',
                                cursor: 'pointer',
                            }}
                            onClick={() => navigate('/marketplace')}
                        >
                            <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                Marketplace
                            </Text>
                            <br />
                            <Button color="amber" variant="soft" size="2" mt="1">
                                Browse Listed Invoices →
                            </Button>
                        </Box>
                    </Flex>

                    {/* Active positions */}
                    <Box>
                        <Heading size="4" mb="3" style={{ color: 'var(--tg-green)' }}>
                            Active Positions
                        </Heading>
                        {loadingFunded ? (
                            <Spinner />
                        ) : funded && funded.length > 0 ? (
                            <Flex direction="column" gap="3">
                                {funded.map(inv => (
                                    <InvoiceCard key={inv.publicKey} invoice={inv} />
                                ))}
                            </Flex>
                        ) : (
                            <Callout.Root color="amber">
                                <Callout.Text>
                                    No active positions. Visit the{' '}
                                    <Text
                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => navigate('/marketplace')}
                                    >
                                        Marketplace
                                    </Text>{' '}
                                    to fund invoices.
                                </Callout.Text>
                            </Callout.Root>
                        )}
                    </Box>

                    {/* Completed */}
                    {completed && completed.length > 0 && (
                        <Box>
                            <Heading size="4" mb="3" style={{ color: 'var(--tg-green)' }}>
                                Completed Repayments
                            </Heading>
                            {loadingCompleted ? (
                                <Spinner />
                            ) : (
                                <Flex direction="column" gap="3">
                                    {completed.map(inv => (
                                        <InvoiceCard key={inv.publicKey} invoice={inv} />
                                    ))}
                                </Flex>
                            )}
                        </Box>
                    )}
                </WalletGuard>
            </Flex>
        </Container>
    );
}
