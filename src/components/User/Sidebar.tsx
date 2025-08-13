'use client'

import React, { useState } from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { User } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Star, Sparkles, Info, CreditCard, Settings, Calendar, Menu } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { useUserAuthenticated } from '@/app/(user)/providers'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utilities/ui'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface SidebarProps {
  className?: string
}

const ContentSideBar = ({
  className,
  onClickMenuItem,
}: {
  className?: string
  onClickMenuItem?: () => any
}) => {
  const { t } = useTranslate()
  const menuItems = [
    { icon: Settings, label: t('userprofile.sidebar.accountInfo'), href: '/user/profile' },
    {
      icon: CreditCard,
      label: t('userprofile.sidebar.manageTickets'),
      href: '/user/my-tickets',
      active: true,
    },
    { icon: Calendar, label: t('userprofile.sidebar.myEvents'), href: '/user/my-events' },
    { icon: CreditCard, label: t('userprofile.sidebar.myTicketQRCodes'), href: '/user/my-ticket-qrcodes' },
  ]
  const authUser = useUserAuthenticated()
  const pathname = usePathname()
  const user = authUser?.userInfo
  const { toast } = useToast()
  const [userRole, setUserRole] = useState<User['role']>(user?.role)
  const [userAffiliateStatus, setUserAffiliateStatus] = useState<User['affiliateStatus']>(
    user?.affiliateStatus,
  )
  const [showAmbassador, setShowAmbassador] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const onBecomeAmbassador = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/affiliate-register', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (!response.ok) {
        toast({
          title: t('userprofile.sidebar.affiliateErrorTitle') || 'Error',
          description:
            data?.error || t('userprofile.sidebar.affiliateErrorDesc') || 'Failed to send request.',
          variant: 'destructive',
        })
      } else {
        toast({
          title:
            t('userprofile.sidebar.affiliateSuccessTitle') ||
            'Congratulations! You are now an ambassador!',
          description:
            t('userprofile.sidebar.successToBecomeAmbassador') ||
            'Congratulations! You are now an ambassador. You can now start earning rewards by sharing your affiliate link.',
        })
        setShowAmbassador(false)
        setAcceptedTerms(false)
        setUserRole(data.user.role)
        setUserAffiliateStatus(data.user.affiliateStatus)
      }
    } catch (error: any) {
      console.log('error', error)
      toast({
        title: t('userprofile.sidebar.affiliateErrorTitle') || 'Error',
        description:
          error?.message ||
          t('userprofile.sidebar.affiliateErrorDesc') ||
          'Failed to send request.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const env = process.env.NEXT_PUBLIC_ENVIRONMENT
  const hideBecomeAmbassador = !env || env === 'production'

  return (
    <div
      className={cn(
        'h-screen bg-sidebar-bg text-sidebar-foreground flex flex-col pt-28 text-white',
        'w-64 fixed left-0 top-0',
        className,
      )}
    >
      <div className="p-6 pt-2 border-b border-sidebar-muted/10">
        <div className="text-sm text-gray-400 text-center">
          {t('userprofile.sidebar.accountOf')}
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div className="text-lg font-bold text-center">
            {user?.firstName || ''} {user?.lastName || ''}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                onClick={onClickMenuItem}
                key={item.label}
                href={item.href}
                className={cn(
                  'flex w-full justify-start items-center  hover:bg-sidebar-muted/20 hover:text-green-400 transition-smooth rounded-none border-l-4 border-transparent text-left py-3',
                  isActive
                    ? 'border-l-sidebar-highlight text-sidebar-foreground bg-sidebar-muted/10 text-green-400'
                    : 'text-sidebar-foreground/80',
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      {!hideBecomeAmbassador && (
        <div className="p-4">
          <hr className="my-4 border-gray-700" />
          {userAffiliateStatus === 'pending' ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg flex items-start gap-3 mb-2">
              <Info className="w-5 h-5 mt-0.5 text-yellow-500" />
              <div>
                <div className="font-semibold">
                  {t('userprofile.sidebar.affiliatePendingTitle') ||
                    'Affiliate Application Pending'}
                </div>
                <div className="text-sm">
                  {t('userprofile.sidebar.affiliatePendingDesc') ||
                    'Your request to become an ambassador is under review. You will be notified once approved.'}
                </div>
              </div>
            </div>
          ) : userRole === 'affiliate' && userAffiliateStatus === 'approved' ? (
            <Link
              href="/affiliate"
              className="block w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg px-4 py-3 text-center transition-colors shadow-md mb-2"
            >
              <span className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5" />
                {t('userprofile.sidebar.goToAffiliateDashboard') || 'Go to Affiliate Dashboard'}
              </span>
              {/* <span className="block text-xs font-normal text-gray-700 mt-1">
              {t('userprofile.sidebar.affiliateDashboardDesc') || 'View your affiliate performance, links, and rewards'}
            </span> */}
            </Link>
          ) : (
            <Dialog
              open={showAmbassador}
              onOpenChange={(open) => {
                setShowAmbassador(open)
                setAcceptedTerms(false)
                setLoading(false)
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-2 px-2 py-2 text-left text-yellow-400 hover:bg-yellow-900/20 hover:text-yellow-300 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>{t('userprofile.sidebar.becomeAmbassador') || 'Become Ambassador'}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl shadow-2xl border border-gray-200 p-0 overflow-hidden bg-white animate-fade-in">
                <div className="px-8 pt-8 pb-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <DialogTitle className="text-gray-900 text-xl font-bold">
                    {t('userprofile.sidebar.becomeAmbassador') || 'Become Ambassador'}
                  </DialogTitle>
                </div>
                <div className="px-8 pt-4 pb-2">
                  <DialogDescription>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 flex flex-col gap-1">
                      <span className="text-sm text-gray-700 font-medium mb-1">
                        {t('userprofile.sidebar.pleaseReadTerms') || 'Please read:'}
                      </span>
                      <a
                        href="/affiliate/terms-conditions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800 transition-colors text-sm"
                      >
                        {t('userprofile.sidebar.affiliateTerms') || 'Affiliate Terms & Conditions'}
                      </a>
                    </div>
                  </DialogDescription>
                  <div className="flex items-center gap-3 mb-6">
                    <Checkbox
                      id="accept-terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                      className="border-gray-400 data-[state=checked]:bg-white"
                    />
                    <label htmlFor="accept-terms" className="text-sm cursor-pointer text-gray-900">
                      {t('userprofile.sidebar.acceptTerms') || 'I accept the terms and conditions'}
                    </label>
                  </div>
                </div>
                <DialogFooter className="bg-gray-50 px-8 py-4 rounded-b-xl flex-row gap-3 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      if (acceptedTerms && !loading) onBecomeAmbassador()
                    }}
                    disabled={!acceptedTerms || loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    )}
                    {t('userprofile.sidebar.confirmBecomeAmbassador') || 'Confirm'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAmbassador(false)
                      setAcceptedTerms(false)
                      setLoading(false)
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-2 rounded-lg"
                  >
                    {t('userprofile.sidebar.cancel') || 'Cancel'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  )
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
      <ContentSideBar className={className} />
    </aside>
  )
}

export const SidebarMobile = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden rounded-full p-2 h-10 w-10 bg-black/30 hover:bg-black hover:text-white transition-all"
        >
          <Menu className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className=" w-[256px] bg-gray-900 text-white border-none">
        <ContentSideBar className={className} onClickMenuItem={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

export default Sidebar
