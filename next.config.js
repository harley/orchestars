import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  redirects,
  webpack: (config, { isServer }) => {
    // Exclude Supabase Edge Functions from webpack compilation
    config.module.rules.push({
      test: /supabase\/functions\/.+/,
      use: 'null-loader',
    })

    // Also exclude these files from source maps and module resolution
    if (!config.resolve) config.resolve = {}
    if (!config.resolve.alias) config.resolve.alias = {}
    config.resolve.alias['supabase/functions'] = false

    return config
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
