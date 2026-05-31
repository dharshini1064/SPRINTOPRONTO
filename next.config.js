/** @type {import('next').NextConfig} */

// NextAuth requires a valid URL during the static prerendering build step.
// If it's missing (e.g., on Render before the URL is known), provide a dummy fallback.
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "http://localhost:3000"
}

const nextConfig = {
  reactStrictMode: true,

  // Output standalone bundle — optimal for Render & Docker deployments
  output: "standalone",

  // Fix webpack "Module not found: Can't resolve 'encoding'" for Linear SDK
  serverExternalPackages: ["@linear/sdk"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
