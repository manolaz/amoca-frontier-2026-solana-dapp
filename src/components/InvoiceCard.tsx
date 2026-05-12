import { Badge, Box, Button, Card, Code, Flex, Heading, Text } from '@radix-ui/themes';
import { Link } from 'react-router-dom';

import type { InvoiceData } from '../programs/types';
import { CurrencyAmount } from './CurrencyAmount';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { SustainabilityScore } from './SustainabilityScore';

type Props = {
    invoice: InvoiceData;
    actions?: React.ReactNode;
};

export function InvoiceCard({ invoice, actions }: Props) {
    return (
        <Card style={{ border: '1px solid var(--tg-border)' }}>
            <Flex direction="column" gap="3">
                {/* Header row */}
                <Flex justify="between" align="start" wrap="wrap" gap="2">
                    <Flex align="center" gap="2">
                        <Heading size="3" style={{ color: 'var(--tg-green-dark)' }}>
                            {invoice.invoiceId}
                        </Heading>
                        <Badge color="gray" variant="outline">
                            {invoice.commodityCode}
                        </Badge>
                    </Flex>
                    <InvoiceStatusBadge status={invoice.status} />
                </Flex>

                {/* Amount + ESG */}
                <Flex gap="4" wrap="wrap" align="center">
                    <CurrencyAmount amount={invoice.amountUsdc} size="4" weight="bold" />
                    <SustainabilityScore score={invoice.carbonScore} ipfsHash={invoice.sustainabilityIpfsHash} />
                </Flex>

                {/* Addresses */}
                <Flex direction="column" gap="1">
                    <Flex gap="2" align="center">
                        <Text size="1" style={{ color: 'var(--tg-text-muted)', minWidth: 60 }}>
                            Exporter
                        </Text>
                        <Code size="1" variant="ghost" truncate>
                            {invoice.exporter}
                        </Code>
                    </Flex>
                    <Flex gap="2" align="center">
                        <Text size="1" style={{ color: 'var(--tg-text-muted)', minWidth: 60 }}>
                            Buyer
                        </Text>
                        <Code size="1" variant="ghost" truncate>
                            {invoice.buyer}
                        </Code>
                    </Flex>
                    {invoice.nftMint && (
                        <Flex gap="2" align="center">
                            <Text size="1" style={{ color: 'var(--tg-text-muted)', minWidth: 60 }}>
                                cNFT
                            </Text>
                            <Code size="1" variant="ghost" truncate style={{ color: 'var(--tg-green)' }}>
                                {invoice.nftMint}
                            </Code>
                        </Flex>
                    )}
                </Flex>

                {/* Rejection reason */}
                {invoice.rejectionReason && (
                    <Box
                        style={{
                            background: '#fff5f5',
                            border: '1px solid #fecaca',
                            borderRadius: 6,
                            padding: '8px 12px',
                        }}
                    >
                        <Text size="1" style={{ color: '#b91c1c' }}>
                            Rejection reason: {invoice.rejectionReason}
                        </Text>
                    </Box>
                )}

                {/* Actions row */}
                <Flex gap="2" align="center" justify="between">
                    <Link to={`/invoice/${invoice.publicKey}`} style={{ textDecoration: 'none' }}>
                        <Button variant="ghost" color="gray" size="1">
                            View details →
                        </Button>
                    </Link>
                    {actions && <Flex gap="2">{actions}</Flex>}
                </Flex>
            </Flex>
        </Card>
    );
}
