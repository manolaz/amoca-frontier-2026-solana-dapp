import { Badge, Box, Button, DropdownMenu, Flex, Heading, Text } from '@radix-ui/themes';
import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ChainContext } from '../context/ChainContext';
import { RoleContext } from '../context/RoleContext';
import { ConnectWalletMenu } from './ConnectWalletMenu';

const ROLE_COLORS: Record<string, 'green' | 'amber' | 'blue' | 'violet'> = {
    exporter: 'green',
    buyer: 'blue',
    financier: 'amber',
    verifier: 'violet',
};

const NAV_LINKS = [
    { to: '/exporter', label: 'Exporter' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/financier', label: 'Financier' },
    { to: '/buyer', label: 'Buyer' },
    { to: '/verifier', label: 'Verifier' },
];

export function Nav() {
    const { displayName: currentChainName, chain, setChain } = useContext(ChainContext);
    const { role, setRole } = useContext(RoleContext);
    const location = useLocation();

    const currentChainBadge = (
        <Badge color="gray" style={{ verticalAlign: 'middle' }}>
            {currentChainName}
        </Badge>
    );

    return (
        <Box
            style={{
                backgroundColor: 'var(--tg-nav-bg)',
                borderBottom: '1px solid var(--tg-border)',
                zIndex: 1,
            }}
            position="sticky"
            p="3"
            top="0"
        >
            <Flex gap="4" justify="between" align="center">
                {/* Brand */}
                <Flex align="center" gap="3" flexShrink="0">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <Heading as="h1" size={{ initial: '4', xs: '5' }} style={{ color: 'var(--tg-green)' }}>
                            🌿 Tangram Green
                        </Heading>
                    </Link>
                    {setChain ? (
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>{currentChainBadge}</DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.RadioGroup
                                    onValueChange={value => setChain(value as `solana:${string}`)}
                                    value={chain}
                                >
                                    <DropdownMenu.RadioItem value="solana:devnet">Devnet</DropdownMenu.RadioItem>
                                    <DropdownMenu.RadioItem value="solana:testnet">Testnet</DropdownMenu.RadioItem>
                                </DropdownMenu.RadioGroup>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    ) : (
                        currentChainBadge
                    )}
                </Flex>

                {/* Role nav links */}
                <Flex gap="1" align="center" display={{ initial: 'none', md: 'flex' }}>
                    {NAV_LINKS.map(({ to, label }) => (
                        <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                            <Button
                                variant={location.pathname.startsWith(to) ? 'solid' : 'ghost'}
                                color={location.pathname.startsWith(to) ? ROLE_COLORS[label.toLowerCase()] ?? 'green' : 'gray'}
                                size="2"
                            >
                                {label}
                            </Button>
                        </Link>
                    ))}
                </Flex>

                {/* Role badge + wallet */}
                <Flex gap="2" align="center">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <Button variant="soft" color={ROLE_COLORS[role] ?? 'green'} size="2">
                                <Text size="1">Role:</Text> {role.charAt(0).toUpperCase() + role.slice(1)}
                                <DropdownMenu.TriggerIcon />
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                            <DropdownMenu.RadioGroup value={role} onValueChange={v => setRole(v as typeof role)}>
                                <DropdownMenu.RadioItem value="exporter">Exporter</DropdownMenu.RadioItem>
                                <DropdownMenu.RadioItem value="buyer">Buyer</DropdownMenu.RadioItem>
                                <DropdownMenu.RadioItem value="financier">Financier</DropdownMenu.RadioItem>
                                <DropdownMenu.RadioItem value="verifier">Verifier</DropdownMenu.RadioItem>
                            </DropdownMenu.RadioGroup>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                    <ConnectWalletMenu>Connect Wallet</ConnectWalletMenu>
                </Flex>
            </Flex>
        </Box>
    );
}
