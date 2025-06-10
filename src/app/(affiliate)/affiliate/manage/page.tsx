'use client'

import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { ManageAffiliateLinks } from '@/components/Affiliate/ManageAffiliateLinks'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'

export default function ManageLinksPage() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AffiliateSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col gap-4 p-4 pt-0">
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <div className="p-6">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Affiliate Links</h1>
                    <p className="text-muted-foreground">
                      Create, view, edit, and manage all your affiliate links in one place
                    </p>
                  </div>
                  <ManageAffiliateLinks />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
