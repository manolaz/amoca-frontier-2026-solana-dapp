import './index.css';
import '@radix-ui/themes/styles.css';

import { Flex, Section, Theme } from '@radix-ui/themes';
import { SelectedWalletAccountContextProvider } from '@solana/react';
import type { UiWallet } from '@wallet-standard/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Nav } from './components/Nav.tsx';
import { ChainContextProvider } from './context/ChainContextProvider.tsx';
import { RoleContextProvider } from './context/RoleContext.tsx';
import { RpcContextProvider } from './context/RpcContextProvider.tsx';
import BuyerRoute from './routes/buyer.tsx';
import ExporterRoute from './routes/exporter.tsx';
import FinancierRoute from './routes/financier.tsx';
import InvoiceDetailRoute from './routes/invoice.tsx';
import MarketplaceRoute from './routes/marketplace.tsx';
import Root from './routes/root.tsx';
import VerifierRoute from './routes/verifier.tsx';

const STORAGE_KEY = 'tangram-green:selected-wallet';
const stateSync = {
    deleteSelectedWallet: () => localStorage.removeItem(STORAGE_KEY),
    getSelectedWallet: () => localStorage.getItem(STORAGE_KEY),
    storeSelectedWallet: (accountKey: string) => localStorage.setItem(STORAGE_KEY, accountKey),
};

const rootNode = document.getElementById('root')!;
const root = createRoot(rootNode);
root.render(
    <StrictMode>
        <Theme accentColor="green" grayColor="sage" radius="medium">
            <BrowserRouter>
                <ChainContextProvider>
                    <RoleContextProvider>
                        <SelectedWalletAccountContextProvider filterWallets={(_: UiWallet) => true} stateSync={stateSync}>
                            <RpcContextProvider>
                                <Flex direction="column" style={{ minHeight: '100vh' }}>
                                    <Nav />
                                    <Section style={{ flex: 1 }}>
                                        <Routes>
                                            <Route path="/" element={<Root />} />
                                            <Route path="/exporter" element={<ExporterRoute />} />
                                            <Route path="/buyer" element={<BuyerRoute />} />
                                            <Route path="/financier" element={<FinancierRoute />} />
                                            <Route path="/marketplace" element={<MarketplaceRoute />} />
                                            <Route path="/verifier" element={<VerifierRoute />} />
                                            <Route path="/invoice/:id" element={<InvoiceDetailRoute />} />
                                        </Routes>
                                    </Section>
                                </Flex>
                            </RpcContextProvider>
                        </SelectedWalletAccountContextProvider>
                    </RoleContextProvider>
                </ChainContextProvider>
            </BrowserRouter>
        </Theme>
    </StrictMode>,
);
