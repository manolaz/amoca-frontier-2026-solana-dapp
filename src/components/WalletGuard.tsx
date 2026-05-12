import { Button, Callout, Flex } from '@radix-ui/themes';
import { useSelectedWalletAccount } from '@solana/react';
import { InfoCircledIcon } from '@radix-ui/react-icons';

type Props = {
    children: React.ReactNode;
    message?: string;
};

export function WalletGuard({ children, message = 'Connect a wallet to use this feature.' }: Props) {
    const [selectedWalletAccount] = useSelectedWalletAccount();

    if (!selectedWalletAccount) {
        return (
            <Callout.Root color="orange" style={{ maxWidth: 480 }}>
                <Callout.Icon>
                    <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>{message}</Callout.Text>
            </Callout.Root>
        );
    }

    return <>{children}</>;
}
