import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Orchestars is a dynamic music company committed to transforming the orchestral landscape',
  images: [
    {
      url: `${getServerSideURL()}/meta-image.jpeg`,
    },
  ],
  siteName: 'Orchestars',
  title: 'Experience Live Orchestral Music Like Never Before | Orchestars',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
