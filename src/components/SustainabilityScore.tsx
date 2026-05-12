import { Badge, Flex, Text, Tooltip } from '@radix-ui/themes';

type Props = {
    score: number;
    ipfsHash?: string;
};

function scoreColor(score: number): 'green' | 'amber' | 'red' {
    if (score >= 75) return 'green';
    if (score >= 50) return 'amber';
    return 'red';
}

function scoreLabel(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Moderate';
    return 'Poor';
}

export function SustainabilityScore({ score, ipfsHash }: Props) {
    const color = scoreColor(score);
    const label = scoreLabel(score);

    return (
        <Flex align="center" gap="2">
            <Tooltip content={`ESG Score: ${score}/100 — ${label}. View sustainability report on IPFS.`}>
                <Badge color={color} size="2" variant="soft">
                    🌱 {score}/100 — {label}
                </Badge>
            </Tooltip>
            {ipfsHash && (
                <a
                    href={`https://ipfs.io/ipfs/${ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--tg-text-muted)' }}
                >
                    IPFS ↗
                </a>
            )}
        </Flex>
    );
}
