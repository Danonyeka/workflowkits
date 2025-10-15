/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/checkout/:slug*",
        destination: "/register?next=/products/:slug*",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
