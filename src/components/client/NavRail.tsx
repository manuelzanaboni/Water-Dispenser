"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconAdjustmentsHorizontal, IconChartBar, IconGlass } from "@tabler/icons-react";

import styles from "@/components/client/NavRail.module.css";

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

export default function NavRail() {
    const pathname = usePathname();

    return (
        <nav aria-label="Navigazione principale" className={styles.rail}>
            {DESTINATIONS.map(({ href, label, Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className={styles.item}
                    aria-current={isCurrent(href, pathname) ? "page" : undefined}
                >
                    <Icon className={styles.icon} stroke={1.8} aria-hidden />
                    {label}
                </Link>
            ))}
        </nav>
    );
}
