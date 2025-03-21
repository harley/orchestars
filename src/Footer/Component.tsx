import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react'
import TikTok from '@/components/Icons/TikTok'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()
  return (
    <footer className="bg-[#1a1f2c] pt-8 mt-auto">
      <div className="container mx-auto px-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div
            className="text-center space-y-4 animate-on-scroll md:hidden block"
            style={{ animationDelay: '0.2s' }}
          >
            <Link href="/" className="inline-block mb-4">
              <div className="text-2xl font-semibold tracking-tight">
                <span className="bg-clip-text text-white bg-gradient-to-r from-primary to-primary/80">
                  {footerData?.title || 'Imagine Philharmonic Orchestra'}
                </span>
              </div>
            </Link>
            <pre className="text-muted-foreground max-w-sm mx-auto  text-left text-[13px] whitespace-pre-wrap font-montserrat">
              {footerData?.description}
            </pre>
          </div>

          {/* Left Column - Address and Contact */}
          <div className="space-y-4 animate-on-scroll">
            <h3 className="text-lg font-semibold mb-4 md:text-left text-center">
              {footerData?.contactTitle || 'Liên Hệ Chúng Tôi'}
            </h3>
            <div className="flex md:justify-start justify-center space-x-3">
              <MapPin className="h-5 w-5 text-primary/70 mt-1" />
              <div>
                <p className="text-muted-foreground text-sm">{footerData?.address}</p>
              </div>
            </div>
            <div className="flex md:justify-start justify-center space-x-3">
              <Phone className="h-5 w-5 text-primary/70" />
              <span className="text-muted-foreground text-sm">
                {footerData?.phoneNumber || '-'}
              </span>
            </div>
            <div className="flex md:justify-start justify-center space-x-3">
              <Mail className="h-5 w-5 text-primary/70" />
              <span className="text-muted-foreground text-sm">{footerData?.email || '-'}</span>
            </div>
          </div>

          {/* Middle Column - Logo and Description */}
          <div
            className="text-center space-y-4 animate-on-scroll md:block hidden"
            style={{ animationDelay: '0.2s' }}
          >
            <Link href="/" className="inline-block mb-2">
              <div className="text-2xl font-semibold tracking-tight">
                <span className="bg-clip-text text-white bg-gradient-to-r from-primary to-primary/80">
                  {footerData?.title || 'Imagine Philharmonic Orchestra'}
                </span>
              </div>
            </Link>
            <pre className="text-muted-foreground max-w-sm text-[13px] mx-auto text-left whitespace-pre-wrap font-montserrat">
              {footerData?.description}
            </pre>
          </div>

          {/* Right Column - Social Links */}
          <div
            className="space-y-4 md:text-right animate-on-scroll"
            style={{ animationDelay: '0.4s' }}
          >
            <h3 className="text-lg font-semibold mb-4 md:text-right text-center">
              Về công ty chúng tôi
            </h3>

            {!!footerData?.navItems?.length && (
              <div className="flex flex-wrap md:justify-end justify-center md:text-right text-center flex-col gap-2 text-[13px]">
                {footerData.navItems.map((navItem, index) => (
                  <Link
                    key={index}
                    href={navItem.link?.url || '/'}
                    className="text-muted-foreground hover:text-primary transition-colors hover:underline"
                  >
                    {navItem.link?.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className=" mt-12 pt-4 text-center text-sm text-muted-foreground bg-gray-950 gap-2 text-slate-100 pb-3 ">
        <div className="container mx-auto flex md:flex-row flex-col  gap-4 justify-between items-center text-xs">
          <p>
            © {2025} {footerData?.title}. All rights reserved.
          </p>
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
                  <Facebook className="h-4 w-4  text-black" />
                )}
                {String(link.name).toLowerCase() === 'twitter' && (
                  <Twitter className="h-4 w-4 text-black" />
                )}
                {String(link.name).toLowerCase() === 'instagram' && (
                  <Instagram className="h-4 w-4 text-black" />
                )}
                {String(link.name).toLowerCase() === 'youtube' && (
                  <Youtube className="h-4 w-4 text-black" />
                )}
                {String(link.name).toLowerCase() === 'tiktok' && (
                  <TikTok className="h-4 w-4 text-black" />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
