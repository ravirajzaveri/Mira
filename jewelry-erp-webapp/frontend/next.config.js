/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://your-backend-url.vercel.app/:path*'
          : 'http://localhost:8000/:path*',
      },
    ]
  },
}

module.exports = nextConfig