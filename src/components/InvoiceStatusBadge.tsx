import { Badge } from '@radix-ui/themes';

import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from '../hooks/useInvoices';
import type { InvoiceStatusValue } from '../programs/constants';

type Props = {
    status: number;
};

export function InvoiceStatusBadge({ status }: Props) {
    const label = INVOICE_STATUS_LABELS[status as InvoiceStatusValue] ?? 'Unknown';
    const color = INVOICE_STATUS_COLORS[status as InvoiceStatusValue] ?? 'gray';
    return (
        <Badge color={color} variant="soft" radius="full">
            {label}
        </Badge>
    );
}
