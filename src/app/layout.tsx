import type { Metadata } from "next";

import "@mantine/charts/styles.css";

import "@/app/globals.css";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from "@mantine/core";

export const metadata: Metadata = {
    title: "Water Dispenser",
    description: "Water Dispenser App companion for BWT AQA drink U20 CAS",
};

const theme = createTheme({
    fontSizes: {
        // "xs": "10px",
        // "sm": "11px",
        // "md": "14px",
        // "lg": "16px",
        // "xl": "20px",
        "xs": "14px",
        "sm": "16px",
        "md": "20px",
        "lg": "24px",
        "xl": "26px",
    }
});

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
                <MantineProvider theme={theme}>{children}</MantineProvider>
            </body>
        </html>
    );
}
