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
import {
  BarChart3,
  Link2,
  Home,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  LogOut,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useAffiliateAuthenticated } from '@/app/(affiliate)/providers/Affiliate'

import { logout } from '@/app/(affiliate)/actions/logout'

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
]

export function AffiliateSidebar() {
  const authUser = useAffiliateAuthenticated()

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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {/* <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/affiliate/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
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
