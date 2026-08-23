/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com;",
      "style-src 'self' 'unsafe-inline';",
      "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://static.wikia.nocookie.net;",
      "font-src 'self' data:;",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;",
      "connect-src 'self' https://discord.com https://www.googleapis.com;",
      "object-src 'none';",
      "base-uri 'self';",
      "form-action 'self';",
      "frame-ancestors 'self';",
    ].join(" "),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

