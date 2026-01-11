/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    cacheComponents: true, // Changed from ppr: true
    inlineCss: true,
    useCache: true
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**'
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },

      {
        protocol:'https',
        hostname:'images.unsplash.com'
      }
    ]
  }
};

export default nextConfig;