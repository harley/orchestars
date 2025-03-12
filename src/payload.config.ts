// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
// import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Partners } from './collections/Partners'
import { AppInformation } from './collections/AppInformation'
import { Performers } from './collections/Performers'
import { FAQs } from './collections/FAQ'
import { SeatingCharts } from './collections/SeatingCharts'
import { Events } from './collections/Events'
import { Orders } from './collections/Orders'
import { OrderItems } from './collections/OrderItems'
import { Payments } from './collections/Payments'
import { Tickets } from './collections/Tickets'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    SeatingCharts,
    Events,
    Orders,
    OrderItems,
    Payments,
    Tickets,
    AppInformation,
    Partners,
    Performers,
    FAQs,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    // payloadCloudPlugin(),
    // storage-adapter-placeholder
    vercelBlobStorage({
      enabled: true, // Optional, defaults to true
      // Specify which collections should use Vercel Blob
      collections: {
        media: true,
        // 'media-with-prefix': {
        //   prefix: 'my-prefix',
        // },
      },
      // Token provided by Vercel once Blob storage is added to your Vercel project
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
