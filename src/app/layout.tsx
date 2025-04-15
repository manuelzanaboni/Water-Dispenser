import type { Metadata } from "next";

import "@mantine/charts/styles.css";

import "@/app/globals.css";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";

export const metadata: Metadata = {
    title: "Water Dispenser",
    description: "Water Dispenser App companion for BWT AQA drink U20 CAS",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="it" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <MantineProvider>{children}</MantineProvider>
            </body>
        </html>
    );
}
