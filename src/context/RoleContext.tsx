import { createContext, useContext, useMemo, useState } from 'react';

export type AppRole = 'exporter' | 'buyer' | 'financier' | 'verifier';

type RoleContextValue = {
    role: AppRole;
    setRole: (role: AppRole) => void;
};

export const RoleContext = createContext<RoleContextValue>({
    role: 'exporter',
    setRole: () => undefined,
});

const STORAGE_KEY = 'tangram-green:role';

export function RoleContextProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<AppRole>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'exporter' || stored === 'buyer' || stored === 'financier' || stored === 'verifier') {
            return stored;
        }
        return 'exporter';
    });

    const value = useMemo<RoleContextValue>(
        () => ({
            role,
            setRole(next) {
                localStorage.setItem(STORAGE_KEY, next);
                setRoleState(next);
            },
        }),
        [role],
    );

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
    return useContext(RoleContext);
}
