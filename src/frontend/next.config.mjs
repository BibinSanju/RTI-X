/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rti-x.onrender.com';
    return [
      {
        // Proxy external FastAPI endpoints while keeping Next.js native routes (generate-pdf, transcribe) local
        source: '/api/:path((?!generate-pdf|transcribe).*)',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
