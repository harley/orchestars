'use server'

import React from 'react'

import { getPayload } from 'payload'
import config from '@/payload.config'
import FAQClient from './Component.client'

const FAQ = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const faqs = await payload
    .find({ collection: 'faqs', where: { status: { equals: 'active' } }, limit: 50 })
    .then((res) => res.docs)
    .catch(() => [])

  if (!faqs?.length) return null

  return <FAQClient faqs={faqs} />
}

export default FAQ
