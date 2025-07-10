'use server'

import { UserProviders } from '@/app/(user)/providers'
import { Header } from '@/Header/Component'
import React from 'react'
import { checkUserAuthenticated } from '@/app/(user)/user/actions/authenticated'
import { redirect } from 'next/navigation'
import { getUserData } from '@/app/(user)/user/profile/actions'
import { Footer } from '@/Footer/Component'
import Sidebar, { SidebarMobile } from '../Sidebar'

const ProtectedComponent = async ({ children }: { children: React.ReactNode }) => {
  const authData = await checkUserAuthenticated()

  if (!authData) {
    return redirect('/')
  }

  const userId = authData.userInfo.id

  const userData = await getUserData({ userId: userId })

  return (
    <UserProviders authUser={{ ...authData, userInfo: { ...authData.userInfo, ...userData } }}>
      <div className="min-h-screen bg-gradient-subtle">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <Header />
          <div className="flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
              <main className="flex-1 p-4 lg:p-6 mt-8">
                <div className="pt-[72px]">{children}</div>
              </main>
              <Footer />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col min-h-screen">
          <Header />
          <div className="relative">
            <div className="fixed top-[100px] left-[10px] z-10 ">
              <SidebarMobile />
            </div>
            <main className="flex-1 p-4">
              <div className="pt-[72px]">{children}</div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </UserProviders>
  )
}

export default ProtectedComponent
