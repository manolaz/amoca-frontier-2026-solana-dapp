import { Text } from '@radix-ui/themes';

import { formatUsdc } from '../hooks/useInvoices';

type Props = {
    /** Amount in USDC micro-units (6 decimals) */
    amount: bigint;
    size?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
    weight?: 'regular' | 'bold';
};

export function CurrencyAmount({ amount, size = '2', weight = 'regular' }: Props) {
    return (
        <Text size={size} weight={weight} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatUsdc(amount)} USDC
        </Text>
    );
}
