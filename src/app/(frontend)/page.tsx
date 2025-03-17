import PageTemplate, { generateMetadata } from './[slug]/page'

// export const dynamic = 'force-dynamic' // Force dynamic rendering
// export const revalidate = 0 // Disable cache
// export const dynamicParams = true
// export const fetchCache = 'force-no-store' // Ensure fresh fetch

// regenerates when a request comes in after 60 seconds
export const revalidate = 60

export default PageTemplate

export { generateMetadata }
