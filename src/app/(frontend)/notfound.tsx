import React from 'react'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CustomButton from '@/components/ui/custom-button'
import Link from 'next/link'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            404
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10">
            Oops! This page has left the concert.
          </p>
          <CustomButton variant="primary" size="lg" asChild>
            <Link href="/">Return to Home</Link>
          </CustomButton>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default NotFound
