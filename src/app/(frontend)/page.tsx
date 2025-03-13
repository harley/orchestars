import PageTemplate, { generateMetadata } from './[slug]/page'

export const dynamic = 'force-dynamic' // Force dynamic rendering
export const revalidate = 0 // Disable cache
export const dynamicParams = true
export const fetchCache = 'force-no-store' // Ensure fresh fetch

export default PageTemplate

export { generateMetadata }
