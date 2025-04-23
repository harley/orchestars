// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { CheckInRecords } from './collections/CheckInRecords'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { Events } from './collections/Events'
import { Orders } from './collections/Orders'
import { OrderItems } from './collections/OrderItems'
import { Payments } from './collections/Payments'
import { Tickets } from './collections/Tickets'
import { Partners } from './collections/Partners'
import { Performers } from './collections/Performers'
import { FAQs } from './collections/FAQ'
import { resendAdapter } from '@payloadcms/email-resend'
import { Activities } from './collections/Activities'
import { SeatHoldings } from './collections/SeatHoldings'
import { Promotions } from './collections/Promotion'
import { UserPromotionRedemptions } from './collections/Promotion/UserPromotionRedemtion'
import Admins from './collections/Admins'
import { updatePaymentStatus } from './collections/Payments/jobs/updatePaymentStatus'
import { i18n } from './payload-config/i18n'
import { localization } from './payload-config/localization'
import { Emails } from './collections/Emails'
import { Logs } from './collections/Logs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: '- Admin',
      description: 'For the organizing team',
      icons: [
        {
          url: '/favicon.ico',
          rel: 'icon',
          type: 'image/x-icon',
        },
      ],
    },
    components: {
      graphics: {
        Logo: '/components/Logo/Logo#Logo',
      },
      views: {
        dashboard: {
          Component: '@/components/AdminViews/Dashboard/Component',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: 'admins',
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    CheckInRecords,
    Events,
    Promotions,
    UserPromotionRedemptions,
    Orders,
    OrderItems,
    Payments,
    Tickets,
    SeatHoldings,
    Partners,
    Performers,
    Activities,
    FAQs,
    Admins,
    Emails,
    Logs,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // onInit: async (payload) => {
  //   payload.jobs
  //     .run()
  //     .then(() => console.log('Initialized cron job'))
  //     .catch((err) => {
  //       console.error('Error while initializing cron job', err)
  //     })
  // },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        console.log('Initializing cron job')
        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
    autoRun: [
      {
        cron: '*/5 * * * *', // Runs every 5 minutes
        limit: 1, // limit jobs to process each run
        queue: 'updatePaymentStatus', // name of the queue
      },
    ],
    shouldAutoRun: async (payload) => {
      updatePaymentStatus({ payload })

      return true
    },
  },
  email: resendAdapter({
    defaultFromAddress: 'info@orchestars.vn',
    defaultFromName: 'Orchestars',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  i18n,
  localization,
})
