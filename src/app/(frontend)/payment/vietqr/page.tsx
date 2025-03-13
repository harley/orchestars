import VietQRPaymentComponent from "@/components/Payment/vietqr";
import React from 'react'
import PageClient from '../result/page.client'

const VietQRPaymentPage = () => {
  return (
    <div className="">
      <PageClient />
      <VietQRPaymentComponent />
    </div>
  )
}

export default VietQRPaymentPage