import {
    Badge,
    Box,
    Button,
    Callout,
    Card,
    Code,
    Container,
    Flex,
    Heading,
    Link,
    Separator,
    Spinner,
    Text,
} from '@radix-ui/themes';
import { useParams, useNavigate } from 'react-router-dom';

import { CurrencyAmount } from '../components/CurrencyAmount';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { SustainabilityScore } from '../components/SustainabilityScore';
import { InvoiceStatus, useInvoices } from '../hooks/useInvoices';

type Step = {
    label: string;
    timestamp: bigint | null;
    done: boolean;
    active: boolean;
};

function InvoiceTimeline({ steps }: { steps: Step[] }) {
    return (
        <Flex direction="column" gap="2">
            {steps.map((step, i) => (
                <Flex key={step.label} align="center" gap="3">
                    <Box
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: step.done
                                ? 'var(--tg-green)'
                                : step.active
                                  ? 'var(--tg-amber)'
                                  : 'var(--tg-border)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text size="1" style={{ color: 'white' }}>
                            {step.done ? '✓' : i + 1}
                        </Text>
                    </Box>
                    <Flex direction="column">
                        <Text
                            size="2"
                            weight={step.active ? 'bold' : 'regular'}
                            style={{ color: step.done ? 'var(--tg-green-dark)' : step.active ? 'var(--tg-amber-dark)' : 'var(--tg-text-muted)' }}
                        >
                            {step.label}
                        </Text>
                        {step.timestamp && (
                            <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                {new Date(Number(step.timestamp) * 1000).toLocaleString()}
                            </Text>
                        )}
                    </Flex>
                </Flex>
            ))}
        </Flex>
    );
}

export default function InvoiceDetailRoute() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: invoices, isLoading } = useInvoices();

    const invoice = invoices?.find(inv => inv.publicKey === id || inv.invoiceId === id);

    if (isLoading) {
        return (
            <Container mx={{ initial: '3', xs: '6' }} py="6">
                <Spinner />
            </Container>
        );
    }

    if (!invoice) {
        return (
            <Container mx={{ initial: '3', xs: '6' }} py="6">
                <Callout.Root color="red">
                    <Callout.Text>Invoice not found.</Callout.Text>
                </Callout.Root>
                <Button mt="3" variant="ghost" onClick={() => navigate(-1)}>
                    ← Go back
                </Button>
            </Container>
        );
    }

    const steps: Step[] = [
        {
            label: 'Invoice Submitted',
            timestamp: invoice.createdAt,
            done: true,
            active: invoice.status === InvoiceStatus.Pending,
        },
        {
            label: invoice.status === InvoiceStatus.Rejected ? 'Invoice Rejected' : 'Invoice Verified + cNFT Minted',
            timestamp: invoice.verifiedAt,
            done: invoice.status >= InvoiceStatus.Verified && invoice.status !== InvoiceStatus.Rejected,
            active:
                invoice.status === InvoiceStatus.Verified ||
                invoice.status === InvoiceStatus.Rejected,
        },
        {
            label: 'Listed on Marketplace',
            timestamp: null,
            done: invoice.status >= InvoiceStatus.Listed,
            active: invoice.status === InvoiceStatus.Listed,
        },
        {
            label: 'Financed by Lender',
            timestamp: invoice.fundedAt,
            done: invoice.status >= InvoiceStatus.Funded,
            active: invoice.status === InvoiceStatus.Funded,
        },
        {
            label: 'Buyer Confirmed Receipt — Repaid',
            timestamp: invoice.completedAt,
            done: invoice.status === InvoiceStatus.Completed,
            active: invoice.status === InvoiceStatus.Completed,
        },
    ];

    return (
        <Container mx={{ initial: '3', xs: '6' }} py="6">
            <Flex direction="column" gap="6">
                {/* Back + header */}
                <Flex align="center" gap="3">
                    <Button variant="ghost" color="gray" onClick={() => navigate(-1)}>
                        ← Back
                    </Button>
                    <Heading size="5" style={{ color: 'var(--tg-green-dark)' }}>
                        {invoice.invoiceId}
                    </Heading>
                    <Badge color="gray">{invoice.commodityCode}</Badge>
                    <InvoiceStatusBadge status={invoice.status} />
                </Flex>

                <Flex gap="6" wrap="wrap" align="start">
                    {/* Left: details */}
                    <Flex direction="column" gap="4" style={{ flex: '1 1 300px' }}>
                        <Card style={{ border: '1px solid var(--tg-border)' }}>
                            <Heading size="3" mb="3">
                                Invoice Details
                            </Heading>
                            <Flex direction="column" gap="2">
                                <Flex justify="between">
                                    <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                                        Face Value
                                    </Text>
                                    <CurrencyAmount amount={invoice.amountUsdc} size="3" weight="bold" />
                                </Flex>
                                {invoice.listedAskPrice && (
                                    <Flex justify="between">
                                        <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                                            Ask Price
                                        </Text>
                                        <CurrencyAmount amount={invoice.listedAskPrice} size="3" />
                                    </Flex>
                                )}
                                <Separator />
                                <Flex direction="column" gap="1">
                                    <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                        Exporter
                                    </Text>
                                    <Code size="1">{invoice.exporter}</Code>
                                </Flex>
                                <Flex direction="column" gap="1">
                                    <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                        Buyer
                                    </Text>
                                    <Code size="1">{invoice.buyer}</Code>
                                </Flex>
                                {invoice.fundedBy && (
                                    <Flex direction="column" gap="1">
                                        <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                            Financed by
                                        </Text>
                                        <Code size="1">{invoice.fundedBy}</Code>
                                    </Flex>
                                )}
                                {invoice.rejectionReason && (
                                    <Callout.Root color="red" mt="2">
                                        <Callout.Text>
                                            Rejection reason: {invoice.rejectionReason}
                                        </Callout.Text>
                                    </Callout.Root>
                                )}
                            </Flex>
                        </Card>

                        {/* Sustainability */}
                        <Card style={{ border: '1px solid var(--tg-border)' }}>
                            <Heading size="3" mb="3">
                                🌱 Sustainability Data
                            </Heading>
                            <Flex direction="column" gap="2">
                                <SustainabilityScore
                                    score={invoice.carbonScore}
                                    ipfsHash={invoice.sustainabilityIpfsHash}
                                />
                                <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                    IPFS Report Hash:
                                </Text>
                                <Code size="1">{invoice.sustainabilityIpfsHash}</Code>
                                <Link
                                    href={`https://ipfs.io/ipfs/${invoice.sustainabilityIpfsHash}`}
                                    target="_blank"
                                    size="2"
                                >
                                    View Full Report on IPFS ↗
                                </Link>
                            </Flex>
                        </Card>

                        {/* cNFT */}
                        {invoice.nftMint && (
                            <Card style={{ border: '1px solid var(--tg-border)' }}>
                                <Heading size="3" mb="3">
                                    🌿 Compressed NFT (cNFT)
                                </Heading>
                                <Flex direction="column" gap="2">
                                    <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                                        Asset ID / Mint:
                                    </Text>
                                    <Code size="1">{invoice.nftMint}</Code>
                                    <Link
                                        href={`https://explorer.solana.com/address/${invoice.nftMint}?cluster=devnet`}
                                        target="_blank"
                                        size="2"
                                    >
                                        View on Solana Explorer ↗
                                    </Link>
                                </Flex>
                            </Card>
                        )}
                    </Flex>

                    {/* Right: timeline */}
                    <Card style={{ flex: '0 1 280px', border: '1px solid var(--tg-border)' }}>
                        <Heading size="3" mb="4">
                            Invoice Timeline
                        </Heading>
                        <InvoiceTimeline steps={steps} />
                    </Card>
                </Flex>
            </Flex>
        </Container>
    );
}
