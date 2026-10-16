import type { Metadata } from "next";
import localFont from "next/font/local";
import { connection } from "next/server";

import "@/app/tokens.css";
import "@/app/globals.css";

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from "@mantine/core";

import AppShell from "@/components/client/shell/AppShell";
import { BUTTON_LAYOUT_SCRIPT } from "@/service/buttonLayout";

export const metadata: Metadata = {
    title: "Water Dispenser",
    description: "Water Dispenser App companion for BWT AQA drink U20 CAS",
};

// Manrope (SIL OFL, see fonts/Manrope-OFL.txt) ships in the repo: neither the
// docker build nor the kiosk needs network access to Google Fonts.
// One variable file, latin subset, covers every weight from 200 to 800.
const manrope = localFont({
    src: "./fonts/manrope-latin-variable.woff2",
    weight: "200 800",
    display: "swap",
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

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // render per request: READ_TEMP_ENABLED must come from the container's env,
    // not from the one the image was built with
    await connection();
    const isTemperatureEnabled = process.env.READ_TEMP_ENABLED === "true";

    return (
        <html lang="it" className={manrope.variable} {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript defaultColorScheme={DEFAULT_COLOR_SCHEME} />
                {/* static string built from constants: applies the saved button layout before paint */}
                <script dangerouslySetInnerHTML={{ __html: BUTTON_LAYOUT_SCRIPT }} />
            </head>
            <body>
                <MantineProvider theme={theme} defaultColorScheme={DEFAULT_COLOR_SCHEME}>
                    <AppShell isTemperatureEnabled={isTemperatureEnabled}>{children}</AppShell>
                </MantineProvider>
            </body>
        </html>
    );
}
