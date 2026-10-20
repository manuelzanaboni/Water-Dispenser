module.exports = {
    plugins: {
        "postcss-preset-mantine": {},
        "postcss-simple-vars": {
            variables: {
                "mantine-breakpoint-xs": "36em",
                "mantine-breakpoint-sm": "48em",
                "mantine-breakpoint-md": "62em",
                "mantine-breakpoint-lg": "75em",
                "mantine-breakpoint-xl": "88em",
                // a phone opened on the LAN, never the kiosk (800×480 at the smallest):
                // portrait is narrower than 576px, landscape is lower than 448px
                "kiosk-phone-narrow": "36rem",
                "kiosk-phone-short": "28rem",
            },
        },
    },
};
