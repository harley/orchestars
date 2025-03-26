Below is the content of .ts files in the @payloadcms/storage-vercel-blob package.

└── packages
    └── storage-vercel-blob
        └── src
            ├── client
                └── VercelBlobClientUploadHandler.ts
            ├── exports
                └── client.ts
            ├── generateURL.ts
            ├── getClientUploadRoute.ts
            ├── handleDelete.ts
            ├── handleUpload.ts
            ├── index.ts
            └── staticHandler.ts


/packages/storage-vercel-blob/src/client/VercelBlobClientUploadHandler.ts:
--------------------------------------------------------------------------------
 1 | 'use client'
 2 | import { createClientUploadHandler } from '@payloadcms/plugin-cloud-storage/client'
 3 | import { upload } from '@vercel/blob/client'
 4 |
 5 | export type VercelBlobClientUploadHandlerExtra = {
 6 |   addRandomSuffix: boolean
 7 |   baseURL: string
 8 |   prefix: string
 9 | }
10 |
11 | export const VercelBlobClientUploadHandler =
12 |   createClientUploadHandler<VercelBlobClientUploadHandlerExtra>({
13 |     handler: async ({
14 |       apiRoute,
15 |       collectionSlug,
16 |       extra: { addRandomSuffix, baseURL, prefix = '' },
17 |       file,
18 |       serverHandlerPath,
19 |       serverURL,
20 |       updateFilename,
21 |     }) => {
22 |       const result = await upload(`${prefix}${file.name}`, file, {
23 |         access: 'public',
24 |         clientPayload: collectionSlug,
25 |         contentType: file.type,
26 |         handleUploadUrl: `${serverURL}${apiRoute}${serverHandlerPath}`,
27 |       })
28 |
29 |       // Update filename with suffix from returned url
30 |       if (addRandomSuffix) {
31 |         updateFilename(result.url.replace(`${baseURL}/`, ''))
32 |       }
33 |     },
34 |   })
35 |


--------------------------------------------------------------------------------
/packages/storage-vercel-blob/src/exports/client.ts:
--------------------------------------------------------------------------------
1 | export { VercelBlobClientUploadHandler } from '../client/VercelBlobClientUploadHandler.js'
2 |


--------------------------------------------------------------------------------
/packages/storage-vercel-blob/src/generateURL.ts:
--------------------------------------------------------------------------------
 1 | import type { GenerateURL } from '@payloadcms/plugin-cloud-storage/types'
 2 |
 3 | import path from 'path'
 4 |
 5 | type GenerateUrlArgs = {
 6 |   baseUrl: string
 7 |   prefix?: string
 8 | }
 9 |
10 | export const getGenerateUrl = ({ baseUrl }: GenerateUrlArgs): GenerateURL => {
11 |   return ({ filename, prefix = '' }) => {
12 |     return `${baseUrl}/${path.posix.join(prefix, encodeURIComponent(filename))}`
13 |   }
14 | }
15 |


--------------------------------------------------------------------------------
/packages/storage-vercel-blob/src/getClientUploadRoute.ts:
--------------------------------------------------------------------------------
 1 | import type { PayloadHandler, PayloadRequest, UploadCollectionSlug } from 'payload'
 2 |
 3 | import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
 4 | import { APIError, Forbidden } from 'payload'
 5 |
 6 | type Args = {
 7 |   access?: (args: {
 8 |     collectionSlug: UploadCollectionSlug
 9 |     req: PayloadRequest
10 |   }) => boolean | Promise<boolean>
11 |   addRandomSuffix?: boolean
12 |   cacheControlMaxAge?: number
13 |   token: string
14 | }
15 |
16 | const defaultAccess: Args['access'] = ({ req }) => !!req.user
17 |
18 | export const getClientUploadRoute =
19 |   ({ access = defaultAccess, addRandomSuffix, cacheControlMaxAge, token }: Args): PayloadHandler =>
20 |   async (req) => {
21 |     const body = (await req.json!()) as HandleUploadBody
22 |
23 |     try {
24 |       const jsonResponse = await handleUpload({
25 |         body,
26 |         onBeforeGenerateToken: async (_pathname: string, collectionSlug: null | string) => {
27 |           if (!collectionSlug) {
28 |             throw new APIError('No payload was provided')
29 |           }
30 |
31 |           if (!(await access({ collectionSlug, req }))) {
32 |             throw new Forbidden()
33 |           }
34 |
35 |           return Promise.resolve({
36 |             addRandomSuffix,
37 |             cacheControlMaxAge,
38 |           })
39 |         },
40 |         onUploadCompleted: async () => {},
41 |         request: req as Request,
42 |         token,
43 |       })
44 |
45 |       return Response.json(jsonResponse)
46 |     } catch (error) {
47 |       req.payload.logger.error(error)
48 |       throw new APIError('storage-vercel-blob client upload route error')
49 |     }
50 |   }
51 |


--------------------------------------------------------------------------------
/packages/storage-vercel-blob/src/handleDelete.ts:
--------------------------------------------------------------------------------
 1 | import type { HandleDelete } from '@payloadcms/plugin-cloud-storage/types'
 2 |
 3 | import { del } from '@vercel/blob'
 4 | import path from 'path'
 5 |
 6 | type HandleDeleteArgs = {
 7 |   baseUrl: string
 8 |   prefix?: string
 9 |   token: string
10 | }
11 |
12 | export const getHandleDelete = ({ baseUrl, token }: HandleDeleteArgs): HandleDelete => {
13 |   return async ({ doc: { prefix = '' }, filename }) => {
14 |     const fileUrl = `${baseUrl}/${path.posix.join(prefix, filename)}`
15 |     const deletedBlob = await del(fileUrl, { token })
16 |
17 |     return deletedBlob
18 |   }
19 | }
20 |


--------------------------------------------------------------------------------
/packages/storage-vercel-blob/src/handleUpload.ts:
--------------------------------------------------------------------------------
 1 | import type { HandleUpload } from '@payloadcms/plugin-cloud-storage/types'
 2 |
 3 | import { put } from '@vercel/blob'
 4 | import path from 'path'
 5 |
 6 | import type { VercelBlobStorageOptions } from './index.js'
 7 |
 8 | type HandleUploadArgs = {
 9 |   baseUrl: string
10 |   prefix?: string
11 | } & Omit<VercelBlobStorageOptions, 'collections'>
12 |
13 | export const getHandleUpload = ({
14 |   access = 'public',
15 |   addRandomSuffix,
16 |   baseUrl,
17 |   cacheControlMaxAge,
18 |   prefix = '',
19 |   token,
20 | }: HandleUploadArgs): HandleUpload => {
21 |   return async ({ data, file: { buffer, filename, mimeType } }) => {
22 |     const fileKey = path.posix.join(data.prefix || prefix, filename)
23 |
24 |     const result = await put(fileKey, buffer, {
25 |       access,
26 |       addRandomSuffix,
27 |       cacheControlMaxAge,
28 |       contentType: mimeType,
29 |       token,
30 |     })
31 |
32 |     // Get filename with suffix from returned url
33 |     if (addRandomSuffix) {
34 |       data.filename = result.url.replace(`${baseUrl}/`, '')
35 |     }
36 |
37 |     return data
38 |   }
39 | }
40 |


--------------------------------------------------------------------------------
/packages/storage-vercel-blob/src/index.ts:
--------------------------------------------------------------------------------
  1 | import type {
  2 |   Adapter,
  3 |   ClientUploadsConfig,
  4 |   PluginOptions as CloudStoragePluginOptions,
  5 |   CollectionOptions,
  6 |   GeneratedAdapter,
  7 | } from '@payloadcms/plugin-cloud-storage/types'
  8 | import type { Config, Plugin, UploadCollectionSlug } from 'payload'
  9 |
 10 | import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
 11 | import { initClientUploads } from '@payloadcms/plugin-cloud-storage/utilities'
 12 |
 13 | import type { VercelBlobClientUploadHandlerExtra } from './client/VercelBlobClientUploadHandler.js'
 14 |
 15 | import { getGenerateUrl } from './generateURL.js'
 16 | import { getClientUploadRoute } from './getClientUploadRoute.js'
 17 | import { getHandleDelete } from './handleDelete.js'
 18 | import { getHandleUpload } from './handleUpload.js'
 19 | import { getStaticHandler } from './staticHandler.js'
 20 |
 21 | export type VercelBlobStorageOptions = {
 22 |   /**
 23 |    * Access control level. Currently, only 'public' is supported.
 24 |    * Vercel plans on adding support for private blobs in the future.
 25 |    *
 26 |    * @default 'public'
 27 |    */
 28 |   access?: 'public'
 29 |
 30 |   /**
 31 |    * Add a random suffix to the uploaded file name in Vercel Blob storage
 32 |    *
 33 |    * @default false
 34 |    */
 35 |   addRandomSuffix?: boolean
 36 |
 37 |   /**
 38 |    * Cache-Control max-age in seconds
 39 |    *
 40 |    * @default 365 * 24 * 60 * 60 // (1 Year)
 41 |    */
 42 |   cacheControlMaxAge?: number
 43 |
 44 |   /**
 45 |    * Do uploads directly on the client, to bypass limits on Vercel.
 46 |    */
 47 |   clientUploads?: ClientUploadsConfig
 48 |
 49 |   /**
 50 |    * Collections to apply the Vercel Blob adapter to
 51 |    */
 52 |   collections: Partial<Record<UploadCollectionSlug, Omit<CollectionOptions, 'adapter'> | true>>
 53 |
 54 |   /**
 55 |    * Whether or not to enable the plugin
 56 |    *
 57 |    * Default: true
 58 |    */
 59 |   enabled?: boolean
 60 |
 61 |   /**
 62 |    * Vercel Blob storage read/write token
 63 |    *
 64 |    * Usually process.env.BLOB_READ_WRITE_TOKEN set by Vercel
 65 |    *
 66 |    * If unset, the plugin will be disabled and will fallback to local storage
 67 |    */
 68 |   token: string | undefined
 69 | }
 70 |
 71 | const defaultUploadOptions: Partial<VercelBlobStorageOptions> = {
 72 |   access: 'public',
 73 |   addRandomSuffix: false,
 74 |   cacheControlMaxAge: 60 * 60 * 24 * 365, // 1 year
 75 |   enabled: true,
 76 | }
 77 |
 78 | type VercelBlobStoragePlugin = (vercelBlobStorageOpts: VercelBlobStorageOptions) => Plugin
 79 |
 80 | export const vercelBlobStorage: VercelBlobStoragePlugin =
 81 |   (options: VercelBlobStorageOptions) =>
 82 |   (incomingConfig: Config): Config => {
 83 |     // Parse storeId from token
 84 |     const storeId = options.token
 85 |       ?.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]
 86 |       ?.toLowerCase()
 87 |
 88 |     const isPluginDisabled = options.enabled === false || !options.token
 89 |
 90 |     // Don't throw if the plugin is disabled
 91 |     if (!storeId && !isPluginDisabled) {
 92 |       throw new Error(
 93 |         'Invalid token format for Vercel Blob adapter. Should be vercel_blob_rw_<store_id>_<random_string>.',
 94 |       )
 95 |     }
 96 |
 97 |     const optionsWithDefaults = {
 98 |       ...defaultUploadOptions,
 99 |       ...options,
100 |     }
101 |
102 |     const baseUrl = `https://${storeId}.${optionsWithDefaults.access}.blob.vercel-storage.com`
103 |
104 |     initClientUploads<
105 |       VercelBlobClientUploadHandlerExtra,
106 |       VercelBlobStorageOptions['collections'][string]
107 |     >({
108 |       clientHandler: '@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler',
109 |       collections: options.collections,
110 |       config: incomingConfig,
111 |       enabled: !isPluginDisabled && Boolean(options.clientUploads),
112 |       extraClientHandlerProps: (collection) => ({
113 |         addRandomSuffix: !!optionsWithDefaults.addRandomSuffix,
114 |         baseURL: baseUrl,
115 |         prefix: (typeof collection === 'object' && collection.prefix) || '',
116 |       }),
117 |       serverHandler: getClientUploadRoute({
118 |         access:
119 |           typeof options.clientUploads === 'object' ? options.clientUploads.access : undefined,
120 |         addRandomSuffix: optionsWithDefaults.addRandomSuffix,
121 |         cacheControlMaxAge: options.cacheControlMaxAge,
122 |         token: options.token ?? '',
123 |       }),
124 |       serverHandlerPath: '/vercel-blob-client-upload-route',
125 |     })
126 |
127 |     // If the plugin is disabled or no token is provided, do not enable the plugin
128 |     if (isPluginDisabled) {
129 |       return incomingConfig
130 |     }
131 |
132 |     const adapter = vercelBlobStorageInternal({ ...optionsWithDefaults, baseUrl })
133 |
134 |     // Add adapter to each collection option object
135 |     const collectionsWithAdapter: CloudStoragePluginOptions['collections'] = Object.entries(
136 |       options.collections,
137 |     ).reduce(
138 |       (acc, [slug, collOptions]) => ({
139 |         ...acc,
140 |         [slug]: {
141 |           ...(collOptions === true ? {} : collOptions),
142 |           adapter,
143 |         },
144 |       }),
145 |       {} as Record<string, CollectionOptions>,
146 |     )
147 |
148 |     // Set disableLocalStorage: true for collections specified in the plugin options
149 |     const config = {
150 |       ...incomingConfig,
151 |       collections: (incomingConfig.collections || []).map((collection) => {
152 |         if (!collectionsWithAdapter[collection.slug]) {
153 |           return collection
154 |         }
155 |
156 |         return {
157 |           ...collection,
158 |           upload: {
159 |             ...(typeof collection.upload === 'object' ? collection.upload : {}),
160 |             disableLocalStorage: true,
161 |           },
162 |         }
163 |       }),
164 |     }
165 |
166 |     return cloudStoragePlugin({
167 |       collections: collectionsWithAdapter,
168 |     })(config)
169 |   }
170 |
171 | function vercelBlobStorageInternal(
172 |   options: { baseUrl: string } & VercelBlobStorageOptions,
173 | ): Adapter {
174 |   return ({ collection, prefix }): GeneratedAdapter => {
175 |     const { access, addRandomSuffix, baseUrl, cacheControlMaxAge, clientUploads, token } = options
176 |
177 |     if (!token) {
178 |       throw new Error('Vercel Blob storage token is required')
179 |     }
180 |
181 |     return {
182 |       name: 'vercel-blob',
183 |       clientUploads,
184 |       generateURL: getGenerateUrl({ baseUrl, prefix }),
185 |       handleDelete: getHandleDelete({ baseUrl, prefix, token }),
186 |       handleUpload: getHandleUpload({
187 |         access,
188 |         addRandomSuffix,
189 |         baseUrl,
190 |         cacheControlMaxAge,
191 |         prefix,
192 |         token,
193 |       }),
194 |       staticHandler: getStaticHandler({ baseUrl, cacheControlMaxAge, token }, collection),
195 |     }
196 |   }
197 | }
198 |


--------------------------------------------------------------------------------
/packages/storage-vercel-blob/src/staticHandler.ts:
--------------------------------------------------------------------------------
 1 | import type { StaticHandler } from '@payloadcms/plugin-cloud-storage/types'
 2 | import type { CollectionConfig } from 'payload'
 3 |
 4 | import { getFilePrefix } from '@payloadcms/plugin-cloud-storage/utilities'
 5 | import { BlobNotFoundError, head } from '@vercel/blob'
 6 | import path from 'path'
 7 |
 8 | type StaticHandlerArgs = {
 9 |   baseUrl: string
10 |   cacheControlMaxAge?: number
11 |   token: string
12 | }
13 |
14 | export const getStaticHandler = (
15 |   { baseUrl, cacheControlMaxAge = 0, token }: StaticHandlerArgs,
16 |   collection: CollectionConfig,
17 | ): StaticHandler => {
18 |   return async (req, { params: { filename } }) => {
19 |     try {
20 |       const prefix = await getFilePrefix({ collection, filename, req })
21 |       const fileKey = path.posix.join(prefix, encodeURIComponent(filename))
22 |
23 |       const fileUrl = `${baseUrl}/${fileKey}`
24 |       const etagFromHeaders = req.headers.get('etag') || req.headers.get('if-none-match')
25 |       const blobMetadata = await head(fileUrl, { token })
26 |       const uploadedAtString = blobMetadata.uploadedAt.toISOString()
27 |       const ETag = `"${fileKey}-${uploadedAtString}"`
28 |
29 |       const { contentDisposition, contentType, size } = blobMetadata
30 |
31 |       if (etagFromHeaders && etagFromHeaders === ETag) {
32 |         return new Response(null, {
33 |           headers: new Headers({
34 |             'Cache-Control': `public, max-age=${cacheControlMaxAge}`,
35 |             'Content-Disposition': contentDisposition,
36 |             'Content-Length': String(size),
37 |             'Content-Type': contentType,
38 |             ETag,
39 |           }),
40 |           status: 304,
41 |         })
42 |       }
43 |
44 |       const response = await fetch(`${fileUrl}?${uploadedAtString}`, {
45 |         cache: 'no-store',
46 |       })
47 |
48 |       const blob = await response.blob()
49 |
50 |       if (!blob) {
51 |         return new Response(null, { status: 204, statusText: 'No Content' })
52 |       }
53 |
54 |       const bodyBuffer = await blob.arrayBuffer()
55 |
56 |       return new Response(bodyBuffer, {
57 |         headers: new Headers({
58 |           'Cache-Control': `public, max-age=${cacheControlMaxAge}`,
59 |           'Content-Disposition': contentDisposition,
60 |           'Content-Length': String(size),
61 |           'Content-Type': contentType,
62 |           ETag,
63 |           'Last-Modified': blobMetadata.uploadedAt.toUTCString(),
64 |         }),
65 |         status: 200,
66 |       })
67 |     } catch (err: unknown) {
68 |       if (err instanceof BlobNotFoundError) {
69 |         return new Response(null, { status: 404, statusText: 'Not Found' })
70 |       }
71 |       req.payload.logger.error({ err, msg: 'Unexpected error in staticHandler' })
72 |       return new Response('Internal Server Error', { status: 500 })
73 |     }
74 |   }
75 | }
76 |


--------------------------------------------------------------------------------