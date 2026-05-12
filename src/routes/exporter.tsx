import {
    Badge,
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
    TextField,
    Tooltip,
} from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { useSelectedWalletAccount } from '@solana/react';
import { useId, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';

import { CurrencyAmount } from '../components/CurrencyAmount';
import { InvoiceCard } from '../components/InvoiceCard';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';
import { WalletGuard } from '../components/WalletGuard';
import { InvoiceStatus, useInvoices } from '../hooks/useInvoices';
import { useTangramProgram } from '../hooks/useTangramProgram';

// ─── Submit Invoice Form ────────────────────────────────────────────────────

function SubmitInvoiceForm({ onSuccess }: { onSuccess: (sig: string) => void }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const program = useTangramProgram();
    const { mutate } = useSWRConfig();

    const invoiceIdId = useId();
    const amountId = useId();
    const buyerId = useId();
    const commodityId = useId();
    const ipfsHashId = useId();
    const carbonScoreId = useId();

    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const fd = new FormData(e.currentTarget);
        const amountStr = fd.get('amount') as string;
        const carbonStr = fd.get('carbonScore') as string;

        // Basic validation
        const amountFloat = parseFloat(amountStr);
        const carbonInt = parseInt(carbonStr, 10);
        if (isNaN(amountFloat) || amountFloat <= 0) {
            setError('Please enter a valid USDC amount.');
            setSubmitting(false);
            return;
        }
        if (isNaN(carbonInt) || carbonInt < 0 || carbonInt > 100) {
            setError('Carbon score must be between 0 and 100.');
            setSubmitting(false);
            return;
        }

        try {
            const sig = await program.submitInvoice({
                invoiceId: fd.get('invoiceId') as string,
                amountUsdc: BigInt(Math.round(amountFloat * 1_000_000)),
                buyer: fd.get('buyer') as string,
                commodityCode: (fd.get('commodityCode') as string).toUpperCase(),
                sustainabilityIpfsHash: fd.get('ipfsHash') as string,
                carbonScore: carbonInt,
            });
            await mutate((key: unknown) => typeof key === 'object' && (key as { type?: string }).type === 'invoices');
            formRef.current?.reset();
            onSuccess(sig);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transaction failed');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
                <Flex gap="3" wrap="wrap">
                    <Box style={{ flex: '1 1 180px' }}>
                        <Text as="label" size="2" htmlFor={invoiceIdId}>
                            Invoice ID
                        </Text>
                        <TextField.Root id={invoiceIdId} name="invoiceId" placeholder="INV-2026-007" required mt="1" />
                    </Box>
                    <Box style={{ flex: '1 1 180px' }}>
                        <Text as="label" size="2" htmlFor={amountId}>
                            Amount (USDC)
                        </Text>
                        <TextField.Root id={amountId} name="amount" type="number" min="1" step="0.01" placeholder="50000.00" required mt="1" />
                    </Box>
                </Flex>
                <Box>
                    <Text as="label" size="2" htmlFor={buyerId}>
                        Buyer Wallet Address
                    </Text>
                    <TextField.Root id={buyerId} name="buyer" placeholder="HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH" required mt="1" />
                </Box>
                <Flex gap="3" wrap="wrap">
                    <Box style={{ flex: '1 1 180px' }}>
                        <Text as="label" size="2" htmlFor={commodityId}>
                            Commodity Code
                        </Text>
                        <TextField.Root id={commodityId} name="commodityCode" placeholder="SOYBEAN" required mt="1" />
                    </Box>
                    <Box style={{ flex: '1 1 100px' }}>
                        <Flex gap="1" align="center" mb="1">
                            <Text as="label" size="2" htmlFor={carbonScoreId}>
                                Carbon Score
                            </Text>
                            <Tooltip content="ESG/carbon score 0–100. Higher is better.">
                                <InfoCircledIcon style={{ color: 'var(--tg-text-muted)', cursor: 'help' }} />
                            </Tooltip>
                        </Flex>
                        <TextField.Root id={carbonScoreId} name="carbonScore" type="number" min="0" max="100" placeholder="75" required mt="1" />
                    </Box>
                </Flex>
                <Box>
                    <Text as="label" size="2" htmlFor={ipfsHashId}>
                        Sustainability Report IPFS Hash
                    </Text>
                    <TextField.Root
                        id={ipfsHashId}
                        name="ipfsHash"
                        placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
                        required
                        mt="1"
                    />
                </Box>
                {error && (
                    <Callout.Root color="red">
                        <Callout.Text>{error}</Callout.Text>
                    </Callout.Root>
                )}
                <Button type="submit" color="green" disabled={submitting}>
                    {submitting ? <><Spinner /> Submitting…</> : 'Submit Invoice'}
                </Button>
            </Flex>
        </form>
    );
}

// ─── Working Capital Panel ──────────────────────────────────────────────────

function WorkingCapitalPanel() {
    const { data: invoices } = useInvoices({ status: InvoiceStatus.Verified });
    const [listing, setListing] = useState<string | null>(null);
    const [askStr, setAskStr] = useState('');
    const [txSig, setTxSig] = useState<string | null>(null);
    const program = useTangramProgram();
    const { mutate } = useSWRConfig();

    if (!invoices || invoices.length === 0) {
        return (
            <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                No verified invoices available for financing yet.
            </Text>
        );
    }

    return (
        <Flex direction="column" gap="3">
            {invoices.map(inv => (
                <Card key={inv.publicKey} style={{ border: '1px solid var(--tg-border)' }}>
                    <Flex justify="between" align="center" wrap="wrap" gap="3">
                        <Flex direction="column" gap="1">
                            <Flex gap="2" align="center">
                                <Text weight="bold">{inv.invoiceId}</Text>
                                <Badge color="gray">{inv.commodityCode}</Badge>
                                <InvoiceStatusBadge status={inv.status} />
                            </Flex>
                            <CurrencyAmount amount={inv.amountUsdc} size="3" />
                        </Flex>
                        <Button
                            color="green"
                            variant="soft"
                            size="2"
                            onClick={() => setListing(inv.publicKey)}
                        >
                            List for Financing
                        </Button>
                    </Flex>
                </Card>
            ))}

            {/* List dialog */}
            <Dialog.Root open={!!listing} onOpenChange={open => !open && setListing(null)}>
                <Dialog.Content style={{ maxWidth: 400 }}>
                    <Dialog.Title>List Invoice for Financing</Dialog.Title>
                    <Dialog.Description size="2" mb="4">
                        Set your asking price. Financiers will fund your invoice at or above this amount.
                    </Dialog.Description>
                    <Flex direction="column" gap="3">
                        <TextField.Root
                            placeholder="Ask price (USDC)"
                            type="number"
                            min="1"
                            value={askStr}
                            onChange={e => setAskStr(e.target.value)}
                        />
                        {txSig && (
                            <Callout.Root color="green">
                                <Callout.Text>
                                    Listed!{' '}
                                    <Link href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank">
                                        View on Explorer ↗
                                    </Link>
                                </Callout.Text>
                            </Callout.Root>
                        )}
                        <Flex gap="2" justify="end">
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button
                                color="green"
                                onClick={async () => {
                                    if (!listing || !askStr) return;
                                    const sig = await program.createListing(listing, BigInt(Math.round(parseFloat(askStr) * 1_000_000)));
                                    await mutate((key: unknown) => typeof key === 'object' && (key as { type?: string }).type === 'invoices');
                                    setTxSig(sig);
                                }}
                            >
                                List Invoice
                            </Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </Flex>
    );
}

// ─── Exporter Dashboard ─────────────────────────────────────────────────────

export default function ExporterRoute() {
    const [selectedWalletAccount] = useSelectedWalletAccount();
    const { data: invoices, isLoading } = useInvoices();
    const [submitSig, setSubmitSig] = useState<string | null>(null);

    return (
        <Container mx={{ initial: '3', xs: '6' }} py="6">
            <Flex direction="column" gap="6">
                <Flex justify="between" align="center" wrap="wrap" gap="3">
                    <Box>
                        <Heading size="6" style={{ color: 'var(--tg-green-dark)' }}>
                            🌾 Exporter Dashboard
                        </Heading>
                        <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                            Submit export invoices, attach sustainability data, and unlock working capital.
                        </Text>
                    </Box>
                </Flex>

                <WalletGuard message="Connect your exporter wallet to submit invoices and manage working capital.">
                    {/* Submit new invoice */}
                    <Card style={{ border: '1px solid var(--tg-border)' }}>
                        <Heading size="4" mb="4" style={{ color: 'var(--tg-green)' }}>
                            Submit New Invoice
                        </Heading>
                        <SubmitInvoiceForm
                            onSuccess={sig => {
                                setSubmitSig(sig);
                            }}
                        />
                        {submitSig && (
                            <Callout.Root color="green" mt="3">
                                <Callout.Text>
                                    Invoice submitted! TX:{' '}
                                    <Link
                                        href={`https://explorer.solana.com/tx/${submitSig}?cluster=devnet`}
                                        target="_blank"
                                    >
                                        {submitSig.slice(0, 16)}… ↗
                                    </Link>
                                </Callout.Text>
                            </Callout.Root>
                        )}
                    </Card>

                    {/* Working capital */}
                    <Card style={{ border: '1px solid var(--tg-border)' }}>
                        <Heading size="4" mb="4" style={{ color: 'var(--tg-green)' }}>
                            Working Capital — List Verified Invoices
                        </Heading>
                        <WorkingCapitalPanel />
                    </Card>

                    {/* Invoice portfolio */}
                    <Box>
                        <Heading size="4" mb="3" style={{ color: 'var(--tg-green-dark)' }}>
                            Invoice Portfolio
                        </Heading>
                        {isLoading ? (
                            <Spinner />
                        ) : invoices && invoices.length > 0 ? (
                            <Flex direction="column" gap="3">
                                {invoices.map(inv => (
                                    <InvoiceCard key={inv.publicKey} invoice={inv} />
                                ))}
                            </Flex>
                        ) : (
                            <Text size="2" style={{ color: 'var(--tg-text-muted)' }}>
                                No invoices yet. Submit your first invoice above.
                            </Text>
                        )}
                    </Box>
                </WalletGuard>
            </Flex>
        </Container>
    );
}
