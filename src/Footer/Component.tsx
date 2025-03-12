import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()
  return (
    <footer className="bg-secondary/40 py-16 mt-auto">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left Column - Address and Contact */}
          <div className="space-y-4 animate-on-scroll">
            <h3 className="text-lg font-semibold mb-4">
              {footerData?.contactTitle || 'Liên Hệ Chúng Tôi'}
            </h3>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary/70 mt-1" />
              <div>
                <p className="text-muted-foreground">{footerData?.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary/70" />
              <span className="text-muted-foreground">{footerData?.phoneNumber || '-'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary/70" />
              <span className="text-muted-foreground">{footerData?.email || '-'}</span>
            </div>
          </div>

          {/* Middle Column - Logo and Description */}
          <div
            className="text-center space-y-4 animate-on-scroll"
            style={{ animationDelay: '0.2s' }}
          >
            <Link href="/" className="inline-block mb-4">
              <div className="text-2xl font-display font-semibold tracking-tight">
                <span className="bg-clip-text text-black bg-gradient-to-r from-primary to-primary/80">
                  {footerData?.title || 'Imagine Philharmonic Orchestra'}
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-sm mx-auto">{footerData?.description}</p>
          </div>

          {/* Right Column - Social Links */}
          <div
            className="space-y-4 md:text-right animate-on-scroll"
            style={{ animationDelay: '0.4s' }}
          >
            <h3 className="text-lg font-semibold mb-4 md:text-right">
              {footerData?.connectUsTitle || 'Kết nối với chúng tôi'}
            </h3>
            <div className="flex md:justify-end space-x-4">
              {footerData?.socials?.map((link, index) => (
                <a
                  key={index}
                  href={link.link || ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/80 flex items-center justify-center shadow-subtle hover:bg-white hover:shadow-md transition-all"
                >
                  {String(link.name).toLowerCase() === 'facebook' && (
                    <Facebook className="h-5 w-5 text-primary/80" />
                  )}
                  {String(link.name).toLowerCase() === 'twitter' && (
                    <Twitter className="h-5 w-5 text-primary/80" />
                  )}
                  {String(link.name).toLowerCase() === 'instagram' && (
                    <Instagram className="h-5 w-5 text-primary/80" />
                  )}
                  {String(link.name).toLowerCase() === 'youtube' && (
                    <Youtube className="h-5 w-5 text-primary/80" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 text-center text-sm text-muted-foreground border-gray-200">
          <p>
            © {2025} {footerData?.title}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
