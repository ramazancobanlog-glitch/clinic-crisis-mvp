/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages uyumluluğu
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
