import React from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-secondary/40 py-16 mt-20">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left Column - Address and Contact */}
          <div className="space-y-4 animate-on-scroll">
            <h3 className="text-lg font-semibold mb-4">Visit Us</h3>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary/70 mt-1" />
              <div>
                <p className="font-medium">Harmony Live Headquarters</p>
                <p className="text-muted-foreground">123 Melody Avenue</p>
                <p className="text-muted-foreground">San Francisco, CA 94103</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary/70" />
              <span className="text-muted-foreground">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary/70" />
              <span className="text-muted-foreground">contact@harmonylive.com</span>
            </div>
          </div>

          {/* Middle Column - Logo and Description */}
          <div
            className="text-center space-y-4 animate-on-scroll"
            style={{ animationDelay: '0.2s' }}
          >
            <Link href="/" className="inline-block mb-4">
              <div className="text-2xl font-display font-semibold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  Harmony
                </span>
                <span className="ml-1 text-primary">Live</span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Experience the magic of live music with Harmony Live. Discover, book, and enjoy
              concerts from world-class artists in spectacular venues.
            </p>
          </div>

          {/* Right Column - Social Links */}
          <div
            className="space-y-4 md:text-right animate-on-scroll"
            style={{ animationDelay: '0.4s' }}
          >
            <h3 className="text-lg font-semibold mb-4 md:text-right">Connect With Us</h3>
            <div className="flex md:justify-end space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white/80 flex items-center justify-center shadow-subtle hover:bg-white hover:shadow-md transition-all"
              >
                <Facebook className="h-5 w-5 text-primary/80" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white/80 flex items-center justify-center shadow-subtle hover:bg-white hover:shadow-md transition-all"
              >
                <Instagram className="h-5 w-5 text-primary/80" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white/80 flex items-center justify-center shadow-subtle hover:bg-white hover:shadow-md transition-all"
              >
                <Twitter className="h-5 w-5 text-primary/80" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-white/80 flex items-center justify-center shadow-subtle hover:bg-white hover:shadow-md transition-all"
              >
                <Youtube className="h-5 w-5 text-primary/80" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Harmony Live. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
