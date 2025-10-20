/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    // Serve modern formats when possible
    formats: ['image/avif', 'image/webp'],
    // If you use remote images, add their hosts here:
    // remotePatterns: [{ protocol: 'https', hostname: 'images.example.com' }],
  },

  async headers() {
    return [
      // Cache Next build assets forever
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache optimized images aggressively
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Public images (you can tweak this to your folders, e.g. /images/)
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }], // 30d
      },
      // Icons / favicons
      {
        source: '/:file(favicon.ico|apple-icon.png|safari-pinned-tab.svg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }], // 7d
      },
      // Never cache API (dynamic)
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },

  async redirects() {
    return [
      // Force canonical host: www → apex
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.workflowkits.com' }],
        destination: 'https://workflowkits.com/:path*',
        permanent: true,
      },
      // Existing redirect
      {
        source: '/checkout/:slug*',
        destination: '/register?next=/products/:slug*',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
