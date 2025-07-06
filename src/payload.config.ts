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
import { emailAdapter } from './payload-config/email'
import { IS_LOCAL_DEVELOPMENT } from './config/app'
import { SeatingCharts } from './collections/SeatingCharts'
import { MarketingTracking } from './collections/MarketingTracking'
import { PromotionConfigs } from './collections/Promotion/PromotionConfigs'
import { AffiliateLinks } from './collections/Affiliate/AffiliateLinks'
import { AffiliateClickLogs } from './collections/Affiliate/AffiliateClickLogs'
import { AffiliateSettings } from './collections/Affiliate/AffiliateSettings'
import { AffiliateRanks } from './collections/Affiliate/AffiliateRanks'
import { EventAffiliateRanks } from './collections/Affiliate/EventAffiliateRanks'
import { AffiliateRankLogs } from './collections/Affiliate/AffiliateRankLogs'
import { AffiliateUserRanks } from './collections/Affiliate/AffiliateUserRank'
import { EventAffiliateUserRanks } from './collections/Affiliate/EventAffiliateUserRanks'
import { HIDE_AFFILIATE_RANK_CONFIG } from './collections/Affiliate/helper'
import { MembershipCollections } from './collections/Membership'
// import { sendMailJob } from './collections/Emails/jobs/sendMail'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// let initializedSendMailJob = false

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
        // custom page should be put before the default payloadcms pages
        managementAffiliate: {
          Component: '@/components/AdminViews/ManagementAffiliate/Page',
          path: '/management-affiliate',
          exact: true,
          strict: true,
          sensitive: true,
        },
        createOrder: {
          Component: '@/components/AdminViews/Order/CreateOrder',
          path: '/create-order',
          exact: true,
          strict: true,
          sensitive: true,
        },
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
    ...(HIDE_AFFILIATE_RANK_CONFIG ? [] : MembershipCollections),
    CheckInRecords,
    SeatingCharts,
    Events,
    Promotions,
    PromotionConfigs,
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
    ...(HIDE_AFFILIATE_RANK_CONFIG
      ? []
      : [
          AffiliateRanks,
          EventAffiliateRanks,
          AffiliateUserRanks,
          EventAffiliateUserRanks,
          AffiliateRankLogs,
        ]),
    AffiliateLinks,
    AffiliateSettings,
    AffiliateClickLogs,
    MarketingTracking,
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
  //   console.log('SKIP_PAYLOAD_INIT', process.env.SKIP_PAYLOAD_INIT === 'true')
  //   if (process.env.SKIP_PAYLOAD_INIT === 'true') {
  //     return
  //   }
  //   if (!initializedSendMailJob) {
  //     console.log('-->payload onInit fired')
  //     // todo, using env instead
  //     const TIME_OUT = 60000
  //     initializedSendMailJob = true
  //     setInterval(() => {
  //       sendMailJob({ payload })
  //     }, TIME_OUT)
  //   }
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
      if (!IS_LOCAL_DEVELOPMENT) {
        updatePaymentStatus({ payload })
      }

      return true
    },
  },
  email: emailAdapter(),
  i18n,
  localization,
})
