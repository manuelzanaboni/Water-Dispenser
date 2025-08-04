import type { NextConfig } from 'next';

import { version } from "./package.json";

const nextConfig: NextConfig = {
    output: "standalone",
    publicRuntimeConfig: {
        version,
    },
};

export default nextConfig;

// import bundleAnalyzer from "@next/bundle-analyzer";

// const withBundleAnalyzer = bundleAnalyzer({
//     enabled: process.env.ANALYZE === "true",
// });

// export default withBundleAnalyzer({
//     reactStrictMode: false,
//     eslint: {
//         ignoreDuringBuilds: true,
//     },
//     experimental: {
//         optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
//     },
// });
