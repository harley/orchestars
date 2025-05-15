import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Config, Plugin } from 'payload'

/**
 * Storage configuration for PayloadCMS
 *
 * This configuration includes both S3 and Vercel Blob storage options:
 * - S3 Storage is enabled by default if credentials are available
 * - Vercel Blob Storage is included as a fallback
 * - If neither is configured, PayloadCMS will use its default local storage
 */

// Check if S3 credentials are available (including Supabase configuration)
const hasS3Credentials = Boolean(
  process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY && process.env.S3_BUCKET,
)

// Check if we're using Supabase S3 endpoint
const isSupabaseS3 = Boolean(
  process.env.S3_ENDPOINT && process.env.S3_ENDPOINT.includes('supabase.co'),
)

// Create an array of storage plugins
const createStoragePlugins = () => {
  const plugins: Plugin[] = []

  // S3 Storage Configuration
  const s3Plugin = s3Storage({
    enabled: hasS3Credentials, // Enable S3 by default if credentials are available
    collections: {
      media: true,
      exports: true,
    },
    bucket: process.env.S3_BUCKET || '',
    config: {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
      region: process.env.S3_REGION || 'us-east-1', // Default to us-east-1 if not specified
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: isSupabaseS3, // Required for Supabase
    },
    // Set ACL for uploaded files
    acl: (process.env.S3_ACL === 'private' ? 'private' : 'public-read') as
      | 'public-read'
      | 'private',
  })

  plugins.push(s3Plugin)

  // Vercel Blob Storage Configuration
  const vercelPlugin = vercelBlobStorage({
    enabled: !hasS3Credentials, // Only enable if S3 is not available
    collections: {
      media: true,
      exports: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  plugins.push(vercelPlugin)

  // If no storage plugins are available, add a minimal plugin that just passes through the config
  if (plugins.length === 0) {
    plugins.push(((config: Config) => config) as Plugin)
  }

  return plugins
}

// Export the storage plugins
export const storagePlugin: Plugin[] = createStoragePlugins()
