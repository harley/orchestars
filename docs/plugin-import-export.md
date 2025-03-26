Below is the content of .ts files in the @payloadcms/plugin-import-export package.

└── packages
    └── plugin-import-export
        └── src
            ├── export
                ├── createExport.ts
                ├── download.ts
                ├── flattenObject.ts
                ├── getCreateExportCollectionTask.ts
                ├── getFields.ts
                ├── getFilename.ts
                └── getSelect.ts
            ├── exports
                ├── rsc.ts
                └── types.ts
            ├── getExportCollection.ts
            ├── index.ts
            ├── translations
                ├── en.ts
                └── index.ts
            └── types.ts


/packages/plugin-import-export/src/export/createExport.ts:
--------------------------------------------------------------------------------
  1 | import type { PaginatedDocs, PayloadRequest, Sort, User, Where } from 'payload'
  2 |
  3 | import { stringify } from 'csv-stringify/sync'
  4 | import { APIError } from 'payload'
  5 | import { Readable } from 'stream'
  6 |
  7 | import { flattenObject } from './flattenObject.js'
  8 | import { getFilename } from './getFilename.js'
  9 | import { getSelect } from './getSelect.js'
 10 |
 11 | type Export = {
 12 |   collectionSlug: string
 13 |   drafts?: 'no' | 'yes'
 14 |   exportsCollection: string
 15 |   fields?: string[]
 16 |   format: 'csv' | 'json'
 17 |   globals?: string[]
 18 |   id: number | string
 19 |   locale?: string
 20 |   name: string
 21 |   slug: string
 22 |   sort: Sort
 23 |   user: string
 24 |   userCollection: string
 25 |   where?: Where
 26 | }
 27 |
 28 | export type CreateExportArgs = {
 29 |   /**
 30 |    * If true, stream the file instead of saving it
 31 |    */
 32 |   download?: boolean
 33 |   input: Export
 34 |   req: PayloadRequest
 35 |   user?: User
 36 | }
 37 |
 38 | export const createExport = async (args: CreateExportArgs) => {
 39 |   const {
 40 |     download,
 41 |     input: {
 42 |       id,
 43 |       name: nameArg,
 44 |       collectionSlug,
 45 |       drafts,
 46 |       exportsCollection,
 47 |       fields,
 48 |       format,
 49 |       locale: localeInput,
 50 |       sort,
 51 |       user,
 52 |       where,
 53 |     },
 54 |     req: { locale: localeArg, payload },
 55 |     req,
 56 |   } = args
 57 |   const locale = localeInput ?? localeArg
 58 |   const collectionConfig = payload.config.collections.find(({ slug }) => slug === collectionSlug)
 59 |   if (!collectionConfig) {
 60 |     throw new APIError(`Collection with slug ${collectionSlug} not found`)
 61 |   }
 62 |
 63 |   const name = `${nameArg ?? `${getFilename()}-${collectionSlug}`}.${format}`
 64 |   const isCSV = format === 'csv'
 65 |
 66 |   const findArgs = {
 67 |     collection: collectionSlug,
 68 |     depth: 0,
 69 |     draft: drafts === 'yes',
 70 |     limit: 100,
 71 |     locale,
 72 |     overrideAccess: false,
 73 |     page: 0,
 74 |     select: Array.isArray(fields) && fields.length > 0 ? getSelect(fields) : undefined,
 75 |     sort,
 76 |     user,
 77 |     where,
 78 |   }
 79 |
 80 |   let result: PaginatedDocs = { hasNextPage: true } as PaginatedDocs
 81 |
 82 |   if (download) {
 83 |     const encoder = new TextEncoder()
 84 |     const stream = new Readable({
 85 |       async read() {
 86 |         let result = await payload.find(findArgs)
 87 |         let isFirstBatch = true
 88 |
 89 |         while (result.docs.length > 0) {
 90 |           const csvInput = result.docs.map((doc) => flattenObject(doc))
 91 |           const csvString = stringify(csvInput, { header: isFirstBatch })
 92 |           this.push(encoder.encode(csvString))
 93 |           isFirstBatch = false
 94 |
 95 |           if (!result.hasNextPage) {
 96 |             this.push(null) // End the stream
 97 |             break
 98 |           }
 99 |
100 |           findArgs.page += 1
101 |           result = await payload.find(findArgs)
102 |         }
103 |       },
104 |     })
105 |
106 |     return new Response(stream as any, {
107 |       headers: {
108 |         'Content-Disposition': `attachment; filename="${name}"`,
109 |         'Content-Type': isCSV ? 'text/csv' : 'application/json',
110 |       },
111 |     })
112 |   }
113 |
114 |   const outputData: string[] = []
115 |   let isFirstBatch = true
116 |
117 |   while (result.hasNextPage) {
118 |     findArgs.page += 1
119 |     result = await payload.find(findArgs)
120 |
121 |     if (isCSV) {
122 |       const csvInput = result.docs.map((doc) => flattenObject(doc))
123 |       outputData.push(stringify(csvInput, { header: isFirstBatch }))
124 |       isFirstBatch = false
125 |     } else {
126 |       const jsonInput = result.docs.map((doc) => JSON.stringify(doc))
127 |       outputData.push(jsonInput.join(',\n'))
128 |     }
129 |   }
130 |
131 |   const buffer = Buffer.from(format === 'json' ? `[${outputData.join(',')}]` : outputData.join(''))
132 |
133 |   if (!id) {
134 |     req.file = {
135 |       name,
136 |       data: buffer,
137 |       mimetype: isCSV ? 'text/csv' : 'application/json',
138 |       size: buffer.length,
139 |     }
140 |   } else {
141 |     await req.payload.update({
142 |       id,
143 |       collection: exportsCollection,
144 |       data: {},
145 |       file: {
146 |         name,
147 |         data: buffer,
148 |         mimetype: isCSV ? 'text/csv' : 'application/json',
149 |         size: buffer.length,
150 |       },
151 |       user,
152 |     })
153 |   }
154 | }
155 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/export/download.ts:
--------------------------------------------------------------------------------
 1 | import type { PayloadHandler } from 'payload'
 2 |
 3 | import { APIError } from 'payload'
 4 |
 5 | import { createExport } from './createExport.js'
 6 |
 7 | export const download: PayloadHandler = async (req) => {
 8 |   let body
 9 |   if (typeof req?.json === 'function') {
10 |     body = await req.json()
11 |   }
12 |
13 |   if (!body || !body.data) {
14 |     throw new APIError('Request data is required.')
15 |   }
16 |
17 |   req.payload.logger.info(`Download request received ${body.data.collectionSlug}`)
18 |
19 |   body.data.user = req.user
20 |
21 |   return createExport({
22 |     download: true,
23 |     input: body.data,
24 |     req,
25 |   }) as Promise<Response>
26 | }
27 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/export/flattenObject.ts:
--------------------------------------------------------------------------------
 1 | export const flattenObject = (obj: any, prefix: string = ''): Record<string, unknown> => {
 2 |   const result: Record<string, unknown> = {}
 3 |
 4 |   Object.entries(obj).forEach(([key, value]) => {
 5 |     const newKey = prefix ? `${prefix}_${key}` : key
 6 |
 7 |     if (Array.isArray(value)) {
 8 |       value.forEach((item, index) => {
 9 |         if (typeof item === 'object' && item !== null) {
10 |           Object.assign(result, flattenObject(item, `${newKey}_${index}`))
11 |         } else {
12 |           result[`${newKey}_${index}`] = item
13 |         }
14 |       })
15 |     } else if (typeof value === 'object' && value !== null) {
16 |       Object.assign(result, flattenObject(value, newKey))
17 |     } else {
18 |       result[newKey] = value
19 |     }
20 |   })
21 |
22 |   return result
23 | }
24 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/export/getCreateExportCollectionTask.ts:
--------------------------------------------------------------------------------
 1 | import type { Config, TaskHandler, User } from 'payload'
 2 |
 3 | import type { CreateExportArgs } from './createExport.js'
 4 |
 5 | import { createExport } from './createExport.js'
 6 | import { getFields } from './getFields.js'
 7 |
 8 | export const getCreateCollectionExportTask = (config: Config): TaskHandler<any, string> => {
 9 |   const inputSchema = getFields(config).concat(
10 |     {
11 |       name: 'user',
12 |       type: 'text',
13 |     },
14 |     {
15 |       name: 'userCollection',
16 |       type: 'text',
17 |     },
18 |     {
19 |       name: 'exportsCollection',
20 |       type: 'text',
21 |     },
22 |   )
23 |
24 |   return {
25 |     // @ts-expect-error plugin tasks cannot have predefined type slug
26 |     slug: 'createCollectionExport',
27 |     handler: async ({ input, req }: CreateExportArgs) => {
28 |       let user: undefined | User
29 |
30 |       if (input.userCollection && input.user) {
31 |         user = (await req.payload.findByID({
32 |           id: input.user,
33 |           collection: input.userCollection,
34 |         })) as User
35 |       }
36 |
37 |       if (!user) {
38 |         throw new Error('User not found')
39 |       }
40 |
41 |       await createExport({ input, req, user })
42 |
43 |       return {
44 |         success: true,
45 |       }
46 |     },
47 |     inputSchema,
48 |     outputSchema: [
49 |       {
50 |         name: 'success',
51 |         type: 'checkbox',
52 |       },
53 |     ],
54 |   }
55 | }
56 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/export/getFields.ts:
--------------------------------------------------------------------------------
  1 | import type { Config, Field, SelectField } from 'payload'
  2 |
  3 | import { getFilename } from './getFilename.js'
  4 |
  5 | export const getFields = (config: Config): Field[] => {
  6 |   let localeField: SelectField | undefined
  7 |   if (config.localization) {
  8 |     localeField = {
  9 |       name: 'locale',
 10 |       type: 'select',
 11 |       admin: {
 12 |         width: '33%',
 13 |       },
 14 |       defaultValue: 'all',
 15 |       label: 'Locale',
 16 |       options: [
 17 |         {
 18 |           label: 'All Locales',
 19 |           value: 'all',
 20 |         },
 21 |         ...config.localization.locales.map((locale) => ({
 22 |           label: typeof locale === 'string' ? locale : locale.label,
 23 |           value: typeof locale === 'string' ? locale : locale.code,
 24 |         })),
 25 |       ],
 26 |     }
 27 |   }
 28 |
 29 |   return [
 30 |     {
 31 |       type: 'collapsible',
 32 |       fields: [
 33 |         {
 34 |           name: 'name',
 35 |           type: 'text',
 36 |           defaultValue: () => getFilename(),
 37 |           label: 'File Name',
 38 |         },
 39 |         {
 40 |           type: 'row',
 41 |           fields: [
 42 |             {
 43 |               name: 'format',
 44 |               type: 'select',
 45 |               admin: {
 46 |                 width: '33%',
 47 |               },
 48 |               defaultValue: 'csv',
 49 |               label: 'Export Format',
 50 |               options: [
 51 |                 {
 52 |                   label: 'CSV',
 53 |                   value: 'csv',
 54 |                 },
 55 |                 {
 56 |                   label: 'JSON',
 57 |                   value: 'json',
 58 |                 },
 59 |               ],
 60 |               required: true,
 61 |             },
 62 |             {
 63 |               name: 'limit',
 64 |               type: 'number',
 65 |               admin: {
 66 |                 placeholder: 'No limit',
 67 |                 width: '33%',
 68 |               },
 69 |             },
 70 |             {
 71 |               name: 'sort',
 72 |               type: 'text',
 73 |               admin: {
 74 |                 components: {
 75 |                   Field: '@payloadcms/plugin-import-export/rsc#SortBy',
 76 |                 },
 77 |               },
 78 |             },
 79 |           ],
 80 |         },
 81 |         {
 82 |           type: 'row',
 83 |           fields: [
 84 |             ...(localeField ? [localeField] : []),
 85 |             {
 86 |               name: 'drafts',
 87 |               type: 'select',
 88 |               admin: {
 89 |                 condition: (data) => {
 90 |                   const collectionConfig = (config.collections ?? []).find(
 91 |                     (collection) => collection.slug === data.collectionSlug,
 92 |                   )
 93 |                   return Boolean(
 94 |                     typeof collectionConfig?.versions === 'object' &&
 95 |                       collectionConfig?.versions?.drafts,
 96 |                   )
 97 |                 },
 98 |                 width: '33%',
 99 |               },
100 |               defaultValue: 'yes',
101 |               label: 'Drafts',
102 |               options: [
103 |                 {
104 |                   label: 'Yes',
105 |                   value: 'yes',
106 |                 },
107 |                 {
108 |                   label: 'No',
109 |                   value: 'no',
110 |                 },
111 |               ],
112 |             },
113 |             // {
114 |             //   name: 'depth',
115 |             //   type: 'number',
116 |             //   admin: {
117 |             //     width: '33%',
118 |             //   },
119 |             //   defaultValue: 1,
120 |             //   required: true,
121 |             // },
122 |           ],
123 |         },
124 |         {
125 |           // virtual field for the UI component to modify the hidden `where` field
126 |           name: 'selectionToUse',
127 |           type: 'radio',
128 |           defaultValue: 'all',
129 |           options: [
130 |             {
131 |               label: 'Use current selection',
132 |               value: 'currentSelection',
133 |             },
134 |             {
135 |               label: 'Use current filters',
136 |               value: 'currentFilters',
137 |             },
138 |             {
139 |               label: 'Use all documents',
140 |               value: 'all',
141 |             },
142 |           ],
143 |           virtual: true,
144 |         },
145 |         {
146 |           name: 'fields',
147 |           type: 'text',
148 |           admin: {
149 |             components: {
150 |               Field: '@payloadcms/plugin-import-export/rsc#FieldsToExport',
151 |             },
152 |           },
153 |           hasMany: true,
154 |         },
155 |         {
156 |           name: 'collectionSlug',
157 |           type: 'text',
158 |           admin: {
159 |             components: {
160 |               Field: '@payloadcms/plugin-import-export/rsc#CollectionField',
161 |             },
162 |             hidden: true,
163 |           },
164 |           required: true,
165 |         },
166 |         {
167 |           name: 'where',
168 |           type: 'json',
169 |           admin: {
170 |             components: {
171 |               Field: '@payloadcms/plugin-import-export/rsc#WhereField',
172 |             },
173 |           },
174 |           defaultValue: {},
175 |         },
176 |       ],
177 |       label: 'Export Options',
178 |     },
179 |     {
180 |       name: 'preview',
181 |       type: 'ui',
182 |       admin: {
183 |         components: {
184 |           Field: '@payloadcms/plugin-import-export/rsc#Preview',
185 |         },
186 |       },
187 |     },
188 |   ]
189 | }
190 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/export/getFilename.ts:
--------------------------------------------------------------------------------
1 | export const getFilename = () => {
2 |   const now = new Date()
3 |   const yyymmdd = now.toISOString().split('T')[0] // "YYYY-MM-DD"
4 |   const hhmmss = now.toTimeString().split(' ')[0] // "HH:MM:SS"
5 |
6 |   return `${yyymmdd} ${hhmmss}`
7 | }
8 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/export/getSelect.ts:
--------------------------------------------------------------------------------
 1 | import type { SelectType } from 'payload'
 2 |
 3 | /**
 4 |  * Takes an input of array of string paths in dot notation and returns a select object
 5 |  * example args: ['id', 'title', 'group.value', 'createdAt', 'updatedAt']
 6 |  */
 7 | export const getSelect = (fields: string[]): SelectType => {
 8 |   const select: SelectType = {}
 9 |
10 |   fields.forEach((field) => {
11 |     // TODO: this can likely be removed, the form was not saving, leaving in for now
12 |     if (!field) {
13 |       return
14 |     }
15 |     const segments = field.split('.')
16 |     let selectRef = select
17 |
18 |     segments.forEach((segment, i) => {
19 |       if (i === segments.length - 1) {
20 |         selectRef[segment] = true
21 |       } else {
22 |         if (!selectRef[segment]) {
23 |           selectRef[segment] = {}
24 |         }
25 |         selectRef = selectRef[segment] as SelectType
26 |       }
27 |     })
28 |   })
29 |
30 |   return select
31 | }
32 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/exports/rsc.ts:
--------------------------------------------------------------------------------
1 | export { CollectionField } from '../components/CollectionField/index.js'
2 | export { ExportListMenuItem } from '../components/ExportListMenuItem/index.js'
3 | export { ExportSaveButton } from '../components/ExportSaveButton/index.js'
4 | export { FieldsToExport } from '../components/FieldsToExport/index.js'
5 | export { ImportExportProvider } from '../components/ImportExportProvider/index.js'
6 | export { Preview } from '../components/Preview/index.js'
7 | export { SortBy } from '../components/SortBy/index.js'
8 | export { WhereField } from '../components/WhereField/index.js'
9 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/exports/types.ts:
--------------------------------------------------------------------------------
1 | export type { ImportExportPluginConfig } from '../types.js'
2 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/getExportCollection.ts:
--------------------------------------------------------------------------------
 1 | import type {
 2 |   CollectionAfterChangeHook,
 3 |   CollectionBeforeChangeHook,
 4 |   CollectionBeforeOperationHook,
 5 |   CollectionConfig,
 6 |   Config,
 7 | } from 'payload'
 8 |
 9 | import type { CollectionOverride, ImportExportPluginConfig } from './types.js'
10 |
11 | import { createExport } from './export/createExport.js'
12 | import { download } from './export/download.js'
13 | import { getFields } from './export/getFields.js'
14 |
15 | export const getExportCollection = ({
16 |   config,
17 |   pluginConfig,
18 | }: {
19 |   config: Config
20 |   pluginConfig: ImportExportPluginConfig
21 | }): CollectionConfig => {
22 |   const { overrideExportCollection } = pluginConfig
23 |
24 |   const beforeOperation: CollectionBeforeOperationHook[] = []
25 |   const afterChange: CollectionAfterChangeHook[] = []
26 |
27 |   let collection: CollectionOverride = {
28 |     slug: 'exports',
29 |     access: {
30 |       update: () => false,
31 |     },
32 |     admin: {
33 |       group: false,
34 |       useAsTitle: 'name',
35 |     },
36 |     disableDuplicate: true,
37 |     endpoints: [
38 |       {
39 |         handler: download,
40 |         method: 'post',
41 |         path: '/download',
42 |       },
43 |     ],
44 |     fields: getFields(config),
45 |     hooks: {
46 |       afterChange,
47 |       beforeOperation,
48 |     },
49 |     upload: {
50 |       filesRequiredOnCreate: false,
51 |       hideFileInputOnCreate: true,
52 |       hideRemoveFile: true,
53 |     },
54 |   }
55 |
56 |   if (typeof overrideExportCollection === 'function') {
57 |     collection = overrideExportCollection(collection)
58 |   }
59 |
60 |   if (pluginConfig.disableJobsQueue) {
61 |     beforeOperation.push(async ({ args, operation, req }) => {
62 |       if (operation !== 'create') {
63 |         return
64 |       }
65 |       const { user } = req
66 |       await createExport({ input: { ...args.data, user }, req })
67 |     })
68 |   } else {
69 |     afterChange.push(async ({ doc, operation, req }) => {
70 |       if (operation !== 'create') {
71 |         return
72 |       }
73 |
74 |       const input = {
75 |         ...doc,
76 |         exportsCollection: collection.slug,
77 |         user: req?.user?.id || req?.user?.user?.id,
78 |         userCollection: 'users',
79 |       }
80 |       await req.payload.jobs.queue({
81 |         input,
82 |         task: 'createCollectionExport',
83 |       })
84 |     })
85 |   }
86 |
87 |   return collection
88 | }
89 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/index.ts:
--------------------------------------------------------------------------------
 1 | import type { Config, JobsConfig } from 'payload'
 2 |
 3 | import { deepMergeSimple } from 'payload'
 4 |
 5 | import type { ImportExportPluginConfig } from './types.js'
 6 |
 7 | import { getCreateCollectionExportTask } from './export/getCreateExportCollectionTask.js'
 8 | import { getExportCollection } from './getExportCollection.js'
 9 | import { translations } from './translations/index.js'
10 |
11 | export const importExportPlugin =
12 |   (pluginConfig: ImportExportPluginConfig) =>
13 |   (config: Config): Config => {
14 |     const exportCollection = getExportCollection({ config, pluginConfig })
15 |     if (config.collections) {
16 |       config.collections.push(exportCollection)
17 |     } else {
18 |       config.collections = [exportCollection]
19 |     }
20 |
21 |     // inject custom import export provider
22 |     config.admin = config.admin || {}
23 |     config.admin.components = config.admin.components || {}
24 |     config.admin.components.providers = config.admin.components.providers || []
25 |     config.admin.components.providers.push(
26 |       '@payloadcms/plugin-import-export/rsc#ImportExportProvider',
27 |     )
28 |
29 |     // inject the createExport job into the config
30 |     config.jobs =
31 |       config.jobs ||
32 |       ({
33 |         tasks: [getCreateCollectionExportTask(config)],
34 |       } as unknown as JobsConfig) // cannot type jobs config inside of plugins
35 |
36 |     let collectionsToUpdate = config.collections
37 |
38 |     const usePluginCollections = pluginConfig.collections && pluginConfig.collections?.length > 0
39 |
40 |     if (usePluginCollections) {
41 |       collectionsToUpdate = config.collections?.filter((collection) => {
42 |         return pluginConfig.collections?.includes(collection.slug)
43 |       })
44 |     }
45 |
46 |     collectionsToUpdate.forEach((collection) => {
47 |       if (!collection.admin) {
48 |         collection.admin = { components: { listMenuItems: [] } }
49 |       }
50 |       const components = collection.admin.components || {}
51 |       if (!components.listMenuItems) {
52 |         components.listMenuItems = []
53 |       }
54 |       if (!components.edit) {
55 |         components.edit = {}
56 |       }
57 |       if (!components.edit.SaveButton) {
58 |         components.edit.SaveButton = '@payloadcms/plugin-import-export/rsc#ExportSaveButton'
59 |       }
60 |       components.listMenuItems.push({
61 |         clientProps: {
62 |           exportCollectionSlug: exportCollection.slug,
63 |         },
64 |         path: '@payloadcms/plugin-import-export/rsc#ExportListMenuItem',
65 |       })
66 |       collection.admin.components = components
67 |     })
68 |
69 |     if (!config.i18n) {
70 |       config.i18n = {}
71 |     }
72 |
73 |     config.i18n.translations = deepMergeSimple(translations, config.i18n?.translations ?? {})
74 |
75 |     return config
76 |   }
77 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/translations/en.ts:
--------------------------------------------------------------------------------
 1 | import type { GenericTranslationsObject } from '@payloadcms/translations'
 2 |
 3 | export const en: GenericTranslationsObject = {
 4 |   $schema: './translation-schema.json',
 5 |   'plugin-seo': {
 6 |     export: 'Export',
 7 |     import: 'Import',
 8 |   },
 9 | }
10 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/translations/index.ts:
--------------------------------------------------------------------------------
 1 | import type { GenericTranslationsObject, NestedKeysStripped } from '@payloadcms/translations'
 2 |
 3 | import { en } from './en.js'
 4 |
 5 | export const translations = {
 6 |   en,
 7 | }
 8 |
 9 | export type PluginImportExportTranslations = GenericTranslationsObject
10 |
11 | export type PluginImportExportTranslationKeys = NestedKeysStripped<PluginImportExportTranslations>
12 |


--------------------------------------------------------------------------------
/packages/plugin-import-export/src/types.ts:
--------------------------------------------------------------------------------
 1 | import type { CollectionAdminOptions, CollectionConfig, UploadConfig } from 'payload'
 2 |
 3 | export type CollectionOverride = {
 4 |   admin: CollectionAdminOptions
 5 |   upload: UploadConfig
 6 | } & CollectionConfig
 7 |
 8 | export type ImportExportPluginConfig = {
 9 |   /**
10 |    * Collections to include the Import/Export controls in
11 |    * Defaults to all collections
12 |    */
13 |   collections?: string[]
14 |   /**
15 |    * Enable to force the export to run synchronously
16 |    */
17 |   disableJobsQueue?: boolean
18 |   /**
19 |    * This function takes the default export collection configured in the plugin and allows you to override it by modifying and returning it
20 |    * @param collection
21 |    * @returns collection
22 |    */
23 |   overrideExportCollection?: (collection: CollectionOverride) => CollectionOverride
24 | }
25 |


--------------------------------------------------------------------------------