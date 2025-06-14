'use client'

import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { DashboardOverview } from '@/components/Affiliate/DashboardOverview'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'

export default function AffiliatePage() {
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
                    <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
                    <p className="text-muted-foreground">
                      Track your affiliate performance and create new affiliate links
                    </p>
                  </div>
                  <DashboardOverview />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
