"use client";

import { createContext, useContext, useState } from "react";

type DispenseLock = {
    isLocked: boolean;
    setLocked: (isLocked: boolean) => void;
};

/* outside the provider nothing can lock the navigation, so it stays enabled */
const DispenseLockContext = createContext<DispenseLock>({
    isLocked: false,
    setLocked: () => { },
});

type DispenseLockProviderProps = {
    children: React.ReactNode;
};

/* shared between the dispenser, which locks while the valve is open,
   and the navigation rail, which must not leave the screen meanwhile */
export function DispenseLockProvider({ children }: DispenseLockProviderProps) {
    const [isLocked, setLocked] = useState(false);

    return (
        <DispenseLockContext.Provider value={{ isLocked, setLocked }}>
            {children}
        </DispenseLockContext.Provider>
    );
}

export const useDispenseLock = () => useContext(DispenseLockContext);
