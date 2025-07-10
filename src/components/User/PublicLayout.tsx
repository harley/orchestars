import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import React from 'react'

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <div className="pt-[72px]">{children}</div>
      <Footer />
    </>
  )
}

export default PublicLayout
