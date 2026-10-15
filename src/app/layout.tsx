import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "@mantine/charts/styles.css";

import "@/app/tokens.css";
import "@/app/globals.css";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from "@mantine/core";

import AppShell from "@/components/client/AppShell";

export const metadata: Metadata = {
    title: "Water Dispenser",
    description: "Water Dispenser App companion for BWT AQA drink U20 CAS",
};

// downloaded at build time and served by Next: the kiosk needs no network for fonts
const manrope = Manrope({
    subsets: ["latin"],
    weight: ["500", "600", "700", "800"],
    variable: "--font-manrope",
});

const FONT_FAMILY = "var(--font-manrope), sans-serif";

// the kiosk is designed dark first; a scheme chosen in the settings still wins
const DEFAULT_COLOR_SCHEME = "dark";

const theme = createTheme({
    fontFamily: FONT_FAMILY,
    headings: { fontFamily: FONT_FAMILY },
    // the water type colors are light shades: keep labels readable on filled surfaces
    autoContrast: true,
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
        <html lang="it" className={manrope.variable} {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript defaultColorScheme={DEFAULT_COLOR_SCHEME} />
            </head>
            <body>
                <MantineProvider theme={theme} defaultColorScheme={DEFAULT_COLOR_SCHEME}>
                    <AppShell>{children}</AppShell>
                </MantineProvider>
            </body>
        </html>
    );
}
