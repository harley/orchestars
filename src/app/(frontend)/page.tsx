// import { headers as getHeaders } from 'next/headers.js'
// import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
// import { fileURLToPath } from 'url'

import config from '@/payload.config'
import HomePageComponent from '@/components/home'

export default async function HomePage() {
  // const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const bannerDocs = await payload.find({ collection: 'events', limit: 5 })

  const onGoingPaginatedDocs = await payload.find({ collection: 'events', limit: 10 })
  console.log('bannerDocs', bannerDocs)
  // const { user } = await payload.auth({ headers })

  // const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div>
      <HomePageComponent bannerDocs={bannerDocs.docs} onGoingPaginatedDocs={onGoingPaginatedDocs} />
    </div>
  )
}
