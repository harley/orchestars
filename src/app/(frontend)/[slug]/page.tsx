import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Home } from '@/components/Home/Component'
import { RenderPageBreadcrumb } from '@/page-breadcrumb/RenderPageBreadcrumb'
import { RenderPageBanner } from '@/page-banner/RenderPageBanner'
import { getLocale } from '@/providers/I18n/server'
import { DEFAULT_FALLBACK_LOCALE, SupportedLocale } from '@/config/app'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header as HeaderType } from '@/payload-types'
import { redirect } from 'next/navigation'
import { getPayload } from '@/payload-config/getPayloadConfig'



export const dynamic = 'force-dynamic' // Force dynamic rendering
export const revalidate = 3600
export const dynamicParams = true
// export const fetchCache = 'force-no-store' // Ensure fresh fetch

export async function generateStaticParams() {
  
  const payload = await getPayload()
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
    locale: DEFAULT_FALLBACK_LOCALE,
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const locale = await getLocale()
  const url = '/' + slug

  if (slug === 'home') {
    return (
      <>
        {/* // <article className="pt-16 pb-24"> */}
        <PageClient />
        <Home />
        {/* // </article> */}
      </>
    )
  }

  const affiliateLink = await queryAffiliateLinkBySlug({ slug })

  if (affiliateLink?.targetLink) {
    return redirect(affiliateLink.targetLink)
  }

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug,
    locale
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout, breadcrumbs, banner } = page

  return (
    <article className={`${banner ? 'pt-[25px]' : 'pt-16'}  pb-24`}>
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderPageBanner banner={banner} />
      <div className="px-4 md:px-8 lg:px-16">
        <RenderPageBreadcrumb breadcrumbs={breadcrumbs} />

        <RenderHero {...hero} />
        <RenderBlocks blocks={layout} />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const locale = await getLocale()
  const page = await queryPageBySlug({
    slug,
    locale
  })

  const headerData: HeaderType = await getCachedGlobal('header', 1, locale)()

  return generateMeta({ doc: {
    ...page,
    meta: {
      title: page?.meta?.title || headerData?.seo?.title,
      description: page?.meta?.description || headerData?.seo?.description,
      image: page?.meta?.image || headerData?.seo?.image,
    }
  } })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string, locale?: SupportedLocale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload()

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
    locale: locale || DEFAULT_FALLBACK_LOCALE,
  })

  return result.docs?.[0] || null
})

const queryAffiliateLinkBySlug = cache(async ({ slug }: { slug: string }) => {

  const payload = await getPayload()

  const result = await payload.find({
    collection: 'affiliate-links',
    limit: 1,
    pagination: false,
    depth: 0,
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'active',
      }
    },
  })

  return result.docs?.[0] || null
})