import styles from "@/components/client/AppShell.module.css";
import NavRail from "@/components/client/NavRail";

type AppShellProps = {
    children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
    return (
        <div className={styles.shell}>
            <NavRail />
            <main className={styles.content}>{children}</main>
        </div>
    );
}
