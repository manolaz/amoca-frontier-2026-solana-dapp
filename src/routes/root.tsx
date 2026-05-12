import { Badge, Box, Button, Card, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { useSelectedWalletAccount } from '@solana/react';
import { useNavigate } from 'react-router-dom';

import { useRole } from '../context/RoleContext';

type RoleCard = {
    role: 'exporter' | 'buyer' | 'financier' | 'verifier';
    icon: string;
    title: string;
    description: string;
    color: 'green' | 'blue' | 'amber' | 'violet';
    to: string;
};

const ROLE_CARDS: RoleCard[] = [
    {
        role: 'exporter',
        icon: '🌾',
        title: 'Exporter',
        description: 'Submit export invoices, attach sustainability data, and unlock working capital against verified receivables.',
        color: 'green',
        to: '/exporter',
    },
    {
        role: 'buyer',
        icon: '🏢',
        title: 'Buyer',
        description: 'View incoming invoices addressed to you, confirm receipt of goods, and release payment obligations.',
        color: 'blue',
        to: '/buyer',
    },
    {
        role: 'financier',
        icon: '💼',
        title: 'Financier',
        description: 'Browse the marketplace of tokenized invoices, assess ESG scores, and deploy capital into verified trade flows.',
        color: 'amber',
        to: '/financier',
    },
    {
        role: 'verifier',
        icon: '🔍',
        title: 'Verifier',
        description: 'Review pending export invoices and sustainability attestations. Approve to mint the invoice as a Solana cNFT.',
        color: 'violet',
        to: '/verifier',
    },
];

const STATS = [
    { label: 'Total Invoice Value', value: '$0', unit: 'USDC' },
    { label: 'Invoices Tokenized', value: '0', unit: 'cNFTs' },
    { label: 'Working Capital Deployed', value: '$0', unit: 'USDC' },
    { label: 'Avg ESG Score', value: '—', unit: '/ 100' },
];

function Root() {
    const navigate = useNavigate();
    const { setRole } = useRole();
    const [selectedWalletAccount] = useSelectedWalletAccount();

    return (
        <Container mx={{ initial: '3', xs: '6' }} py="6">
            {/* Hero */}
            <Flex direction="column" align="center" gap="4" mb="8" style={{ textAlign: 'center' }}>
                <Text size="8" style={{ fontSize: '3.5rem' }}>🌿</Text>
                <Heading size="9" style={{ color: 'var(--tg-green-dark)' }}>
                    Tangram Green
                </Heading>
                <Text size="4" style={{ color: 'var(--tg-text-muted)', maxWidth: 560 }}>
                    The green finance rail for agricultural trade — tokenizing verified export invoices,
                    sustainability data, and working capital on Solana.
                </Text>
                {!selectedWalletAccount && (
                    <Badge color="orange" size="2">
                        Connect a wallet to get started
                    </Badge>
                )}
            </Flex>

            {/* Protocol stats */}
            <Flex gap="3" mb="8" wrap="wrap" justify="center">
                {STATS.map(stat => (
                    <Card key={stat.label} style={{ minWidth: 160, textAlign: 'center' }}>
                        <Text size="5" weight="bold" style={{ color: 'var(--tg-green)' }}>
                            {stat.value}
                        </Text>
                        <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                            {' '}
                            {stat.unit}
                        </Text>
                        <br />
                        <Text size="1" style={{ color: 'var(--tg-text-muted)' }}>
                            {stat.label}
                        </Text>
                    </Card>
                ))}
            </Flex>

            {/* Role selector cards */}
            <Heading size="5" mb="4" style={{ color: 'var(--tg-text-primary)' }}>
                Choose your role
            </Heading>
            <Flex gap="4" wrap="wrap">
                {ROLE_CARDS.map(card => (
                    <Card
                        key={card.role}
                        style={{
                            flex: '1 1 220px',
                            cursor: 'pointer',
                            border: '1px solid var(--tg-border)',
                            transition: 'box-shadow 0.15s',
                        }}
                        onClick={() => {
                            setRole(card.role);
                            navigate(card.to);
                        }}
                    >
                        <Flex direction="column" gap="2">
                            <Text size="6">{card.icon}</Text>
                            <Heading size="4" style={{ color: 'var(--tg-green-dark)' }}>
                                {card.title}
                            </Heading>
                            <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                                {card.description}
                            </Text>
                            <Box mt="2">
                                <Button color={card.color} variant="soft" size="2">
                                    Go to {card.title} Dashboard →
                                </Button>
                            </Box>
                        </Flex>
                    </Card>
                ))}
            </Flex>

            {/* Protocol info */}
            <Flex gap="6" mt="8" wrap="wrap">
                <Box style={{ flex: '1 1 260px' }}>
                    <Heading size="3" mb="2" style={{ color: 'var(--tg-green)' }}>
                        How it works
                    </Heading>
                    <Flex direction="column" gap="1">
                        {[
                            '1. Exporter submits invoice + sustainability data',
                            '2. Verifier reviews and approves on-chain',
                            '3. Invoice minted as a compressed NFT (Bubblegum)',
                            '4. Exporter lists on marketplace for financing',
                            '5. Financier funds invoice (USDC on devnet)',
                            '6. Buyer confirms receipt → repayment released',
                        ].map(step => (
                            <Text key={step} size="2" style={{ color: 'var(--tg-text-muted)' }}>
                                {step}
                            </Text>
                        ))}
                    </Flex>
                </Box>
                <Box style={{ flex: '1 1 260px' }}>
                    <Heading size="3" mb="2" style={{ color: 'var(--tg-green)' }}>
                        Tech stack
                    </Heading>
                    <Flex gap="2" wrap="wrap">
                        {['Solana devnet', 'Anchor', 'Bubblegum cNFTs', 'USDC', 'Wallet Standard', 'React 19'].map(
                            tech => (
                                <Badge key={tech} color="green" variant="soft">
                                    {tech}
                                </Badge>
                            ),
                        )}
                    </Flex>
                </Box>
            </Flex>
        </Container>
    );
}

export default Root;

