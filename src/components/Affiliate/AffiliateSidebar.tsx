'use client'

import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link2, Home, DollarSign, Calendar, LogOut, User, SquareArrowUp } from 'lucide-react'
import Link from 'next/link'
import { useAffiliateAuthenticated } from '@/app/(affiliate)/providers/Affiliate'

import { logout } from '@/app/(affiliate)/actions/logout'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/affiliate',
    icon: Home,
  },
  {
    title: 'Manage Links',
    url: '/affiliate/manage',
    icon: Link2,
  },
  // {
  //   title: 'Performance',
  //   url: '/affiliate/performance',
  //   icon: TrendingUp,
  // },
  // {
  //   title: 'Analytics',
  //   url: '/affiliate/analytics',
  //   icon: BarChart3,
  // },
]

const metricsItems = [
  {
    title: 'Revenue',
    url: '/affiliate/revenue',
    icon: DollarSign,
  },
  // {
  //   title: 'Conversions',
  //   url: '/affiliate/conversions',
  //   icon: Users,
  // },
  {
    title: 'Events',
    url: '/affiliate/events',
    icon: Calendar,
  },
  {
    title: 'Rank Upgrade',
    url: '/affiliate/rankUpgrade',
    icon: SquareArrowUp,
  },
]

export function AffiliateSidebar() {
  const pathname = usePathname()
  const authUser = useAffiliateAuthenticated()
  const [hasRankUpgrade, setHasRankUpgrade] = useState(false)
  useEffect(() => {
    const checkRankUpgrade = async () => {
      try {
        const res = await fetch('/api/affiliate/event-rank-upgrade')
        const data = await res.json()
        if (data?.eligibleEvents?.length > 0) {
          setHasRankUpgrade(true)
        }
      } catch (err) {
        console.error('Failed to fetch rank upgrade info:', err)
      }
    }

    checkRankUpgrade()
  }, [authUser])

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Link2 className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Affiliate Portal</span>
            <span className="truncate text-xs text-muted-foreground">Orchestars</span>
          </div>
        </div>
        {authUser && (
          <div className="flex items-center gap-2 px-4 py-2 border-t">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <User className="h-3 w-3" />
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight">
              <span className="truncate font-medium">{authUser.userInfo?.email}</span>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Metrics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {metricsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {hasRankUpgrade && pathname !== '/affiliate/rankUpgrade' && (
          <SidebarGroup>
            <SidebarGroupLabel>Thông báo</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="rounded-lg bg-green-100 px-4 py-3 text-green-900 shadow-sm ">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-sm font-medium text-green-900 whitespace-normal">
                    Bạn có event đủ điều kiện nâng hạng mới!
                  </p>
                  <Link
                    href="/affiliate/rankUpgrade"
                    className="inline-flex items-center rounded-full border border-yellow-500 px-3 py-1 text-sm font-medium text-yellow-700 hover:bg-yellow-100 transition"
                  >
                    Đi đến trang nâng hạng
                  </Link>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
