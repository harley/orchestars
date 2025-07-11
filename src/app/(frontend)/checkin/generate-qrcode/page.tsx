import React from 'react'
import GenerateQrCodePageClient from './page.client'
import ProtectedComponent from '@/components/CheckIn/Protected/ProtectedComponent'

const GenerateQrCodePage = () => {
  return (
    <ProtectedComponent>
      <GenerateQrCodePageClient />
    </ProtectedComponent>
  )
}

export default GenerateQrCodePage
