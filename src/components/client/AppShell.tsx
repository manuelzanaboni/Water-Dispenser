import styles from "@/components/client/AppShell.module.css";
import { DispenseLockProvider } from "@/components/client/DispenseLock";
import NavRail from "@/components/client/NavRail";

type AppShellProps = {
    children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
    return (
        <DispenseLockProvider>
            <div className={styles.shell}>
                <NavRail />
                <main className={styles.content}>{children}</main>
            </div>
        </DispenseLockProvider>
    );
}
