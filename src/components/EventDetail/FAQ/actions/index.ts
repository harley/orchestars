import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

async function getFaqs() {
  const payload = await getPayload({ config: configPromise })
  const faqs = await payload
    .find({ collection: 'faqs', where: { status: { equals: 'active' } }, limit: 50 })
    .then((res) => res.docs)
    .catch(() => [])

  return faqs
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getFAQCached = () =>
  unstable_cache(async () => getFaqs(), [], {
    tags: ['event-faqs'],
  })
