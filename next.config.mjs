import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    // AVIF désactivé : atténue GHSA-2xp9-vwfh-vxw4 (RCE de l'optimiseur d'images Next 14 avec fichiers AVIF).
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s.wordpress.com",
        pathname: "/mshots/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
