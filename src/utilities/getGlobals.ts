import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { DEFAULT_FALLBACK_LOCALE, SupportedLocale } from '@/config/app'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth = 0, locale = DEFAULT_FALLBACK_LOCALE) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = (slug: Global, depth = 0, locale?: SupportedLocale) =>
  unstable_cache(
    async () => getGlobal(slug, depth, locale),
    [`${slug}-${locale || DEFAULT_FALLBACK_LOCALE}`],
    {
      tags: [`global_${slug}`],
    },
  )
