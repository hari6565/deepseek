/** @type {import('next').NextConfig} */

// All remote images are served from a single CDN host (see getCdnImage in
// app/utils/getAssets.ts). remotePatterns is scoped to that host rather than
// wildcarded to any HTTPS host, so this stays safe even if `unoptimized`
// below is ever turned off (unoptimized:true is what currently disables the
// server-side image-optimization proxy that remotePatterns gates).
let cdnHostname
try {
  cdnHostname = new URL(process.env.NEXT_PUBLIC_FTP_OUTPUT_HOST).hostname
} catch {
  cdnHostname = undefined
}

const nextConfig = {
  basePath: '',
  reactStrictMode: false,
  output: 'standalone',  // Add this line to enable standalone builds,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: cdnHostname
      ? [
          {
            protocol: "https",
            hostname: cdnHostname,
            pathname: "**",
          },
        ]
      : [],
  },
  // Baseline security response headers — none were set previously, so the app
  // shipped with no clickjacking, MIME-sniffing, or referrer protection.
  // CSP is intentionally omitted here: this UI relies on inline styles/scripts
  // and adding a policy blind would break rendering. Add one after testing
  // against a real page load (see the deployment note).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig