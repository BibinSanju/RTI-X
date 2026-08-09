/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rti-x.onrender.com'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
