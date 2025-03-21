'use server'

import React from 'react'

import FAQClient from './Component.client'
import { getFAQCached } from './actions'

const FAQ = async () => {
  const faqs = await getFAQCached()()

  if (!faqs?.length) return null

  return <FAQClient faqs={faqs} />
}

export default FAQ
