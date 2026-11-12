const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Tailwind CSS is processed by PostCSS (postcss.config.mjs), which works with webpack and Turbopack.
  // Forward /api/* to the Express backend so the browser talks to one origin
  // and the HTTP-only session cookie belongs to this admin panel.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
