'use client'

import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { PerformanceAnalytics } from '@/components/Affiliate/PerformanceAnalytics'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'

export default function AnalyticsPage() {
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
                    <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
                    <p className="text-muted-foreground">
                      Detailed breakdown of your affiliate performance and revenue tracking
                    </p>
                  </div>
                  <PerformanceAnalytics />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
