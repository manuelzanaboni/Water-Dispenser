/* Captures the kiosk screens, and the same screens on a phone, into
   screenshots/ for the README.
   Needs the dev server running (npm run dev) and Google Chrome installed:
       npm run screenshots
   BASE_URL and CHROME_PATH override the defaults below. Nothing is written to
   the db: the running dispense is never stopped and the confirmation is never
   accepted. */

import { mkdir, writeFile } from "node:fs/promises";

import { chromium } from "playwright-core";
import sharp from "sharp";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const CHROME_PATH = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT_DIR = new URL("../screenshots/", import.meta.url);

/* the resolution of the display mounted on the dispenser */
const KIOSK = { viewport: { width: 1024, height: 600 }, deviceScaleFactor: 1 };
/* an iPhone 15 on the LAN with the browser bars shown (the worst case), at 2x
   so the README images stay sharp on a phone */
const PHONE = { deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const PHONE_PORTRAIT = { ...PHONE, viewport: { width: 393, height: 660 } };
const PHONE_LANDSCAPE = { ...PHONE, viewport: { width: 852, height: 330 } };
/* page fade, css transitions and the first clock tick */
const SETTLE_MS = 800;
/* long enough for the water to rise and the bubbles to show */
const DISPENSE_MS = 4_500;

const openFilterKeypad = page => page.getByRole("button", { name: /^Nuovo filtro/ }).click();

const startSparkling = async page => {
    await page.getByRole("button", { name: "Frizzante Fredda" }).click();
    await page.getByRole("button", { name: /Avvia erogazione/ }).click();
    await page.waitForTimeout(DISPENSE_MS);
};

const SHOTS = [
    { name: "dispenser-idle", path: "/", schemes: ["dark", "light"] },
    { name: "dispenser-active", path: "/", act: startSparkling },
    { name: "dispenser-row", path: "/", buttonLayout: "row" },
    { name: "stats", path: "/stats", schemes: ["dark", "light"] },
    { name: "settings-screen", path: "/settings", schemes: ["dark", "light"] },
    { name: "settings-keypad", path: "/settings", act: openFilterKeypad },
    {
        name: "settings-confirm",
        path: "/settings",
        act: async page => {
            await openFilterKeypad(page);
            await page.getByRole("button", { name: "Registra nuovo filtro" }).click();
        },
    },
    { name: "phone-dispenser-idle", path: "/", device: PHONE_PORTRAIT },
    { name: "phone-dispenser-active", path: "/", device: PHONE_PORTRAIT, act: startSparkling },
    { name: "phone-stats", path: "/stats", device: PHONE_PORTRAIT },
    { name: "phone-settings-screen", path: "/settings", device: PHONE_PORTRAIT },
    { name: "phone-settings-keypad", path: "/settings", device: PHONE_PORTRAIT, act: openFilterKeypad },
    { name: "phone-landscape-dispenser-idle", path: "/", device: PHONE_LANDSCAPE },
    { name: "phone-landscape-stats", path: "/stats", device: PHONE_LANDSCAPE },
    { name: "phone-landscape-settings-keypad", path: "/settings", device: PHONE_LANDSCAPE, act: openFilterKeypad },
];

/* PNG with a reduced palette: a few dozen KB per screen instead of a few hundred */
const optimise = png => sharp(png).png({ palette: true, quality: 90, compressionLevel: 9 }).toBuffer();

const capture = async (browser, shot, scheme) => {
    const context = await browser.newContext({ ...(shot.device ?? KIOSK), colorScheme: scheme });

    // preferences are read from localStorage before the first paint
    await context.addInitScript(({ scheme, buttonLayout }) => {
        localStorage.setItem("mantine-color-scheme-value", scheme);
        localStorage.setItem("buttonLayout", buttonLayout);
    }, { scheme, buttonLayout: shot.buttonLayout ?? "column" });

    try {
        const page = await context.newPage();
        await page.goto(new URL(shot.path, BASE_URL).href, { waitUntil: "networkidle" });
        // the Next.js dev badge is not part of the kiosk
        await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
        await page.waitForTimeout(SETTLE_MS);

        if (shot.act) {
            await shot.act(page);
            await page.waitForTimeout(SETTLE_MS);
        }

        const file = new URL(`${shot.name}-${scheme}.png`, OUT_DIR);
        await writeFile(file, await optimise(await page.screenshot()));
        console.log(`saved ${file.pathname}`);
    } finally {
        await context.close();
    }
};

const main = async () => {
    await mkdir(OUT_DIR, { recursive: true });
    const browser = await chromium.launch({ executablePath: CHROME_PATH });

    try {
        for (const shot of SHOTS) {
            for (const scheme of shot.schemes ?? ["dark"]) {
                await capture(browser, shot, scheme);
            }
        }
    } finally {
        await browser.close();
    }
};

main().catch(error => {
    console.error("Screenshots failed:", error);
    process.exitCode = 1;
});
