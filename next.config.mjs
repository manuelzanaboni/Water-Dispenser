/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
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
