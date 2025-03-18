import React from 'react'
import PaymentResultPage from './ResultPage'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import PageClient from '../page.client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SearchParams = Promise<{ apptransid: string }>

const PaymentResult = async (props: { searchParams: SearchParams }) => {
  const params = await props.searchParams

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const paymentInfo = await payload
    .find({
      collection: 'payments',
      limit: 1,
      where: { appTransId: { equals: params.apptransid } },
    })
    .then((res) => res.docs?.[0])

  if (!paymentInfo) {
    return notFound()
  }
  return (
    <div className="">
      <PageClient />
      <PaymentResultPage paymentInfo={paymentInfo} />
    </div>
  )
}

export default PaymentResult
