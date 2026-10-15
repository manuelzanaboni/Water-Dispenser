"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconAdjustmentsHorizontal, IconChartBar, IconGlass, IconLock } from "@tabler/icons-react";

import Clock from "@/components/client/shell/Clock";
import { useDispenseLock } from "@/components/client/shell/DispenseLock";
import FridgeChip from "@/components/client/shell/FridgeChip";
import styles from "@/components/client/shell/NavRail.module.css";

type Destination = {
    href: string;
    label: string;
    Icon: typeof IconGlass;
};

const DESTINATIONS: Destination[] = [
    { href: "/", label: "Eroga", Icon: IconGlass },
    { href: "/stats", label: "Statistiche", Icon: IconChartBar },
    { href: "/settings", label: "Impostazioni", Icon: IconAdjustmentsHorizontal },
];

const isCurrent = (href: string, pathname: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

type NavRailProps = {
    isTemperatureEnabled: boolean;
};

export default function NavRail({ isTemperatureEnabled }: NavRailProps) {
    const pathname = usePathname();
    const { isLocked } = useDispenseLock();

    const blockWhileLocked = (event: React.MouseEvent) => {
        if (isLocked) event.preventDefault();
    };

    return (
        <nav aria-label="Navigazione principale" className={styles.rail}>
            {DESTINATIONS.map(({ href, label, Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className={styles.item}
                    aria-current={isCurrent(href, pathname) ? "page" : undefined}
                    aria-disabled={isLocked || undefined}
                    tabIndex={isLocked ? -1 : undefined}
                    onClick={blockWhileLocked}
                >
                    <Icon className={styles.icon} stroke={1.8} aria-hidden />
                    {label}
                </Link>
            ))}

            <div className={styles.spacer} />
            <FridgeChip isEnabled={isTemperatureEnabled} />
            <Clock />

            {isLocked &&
                <div className={styles.lock}>
                    <IconLock className={styles.lockIcon} stroke={1.8} aria-hidden />
                    Bloccato durante l’erogazione
                </div>
            }
        </nav>
    );
}
