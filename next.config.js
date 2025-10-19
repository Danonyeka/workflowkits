/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Force canonical host: www → apex
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.workflowkits.com" }],
        destination: "https://workflowkits.com/:path*",
        permanent: true,
      },
      // Existing redirect
      {
        source: "/checkout/:slug*",
        destination: "/register?next=/products/:slug*",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
