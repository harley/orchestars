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
import { Star, Sparkles, Info } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

type Section = 'tickets' | 'account' | 'events'

const Sidebar: React.FC<{
  activeSection: Section
  setActiveSection: (section: Section) => void
  user?: User
}> = ({ activeSection, setActiveSection, user }) => {
  const { t } = useTranslate()
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

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 space-y-4 pt-10">
      <div className="text-sm text-gray-400">{t('userprofile.sidebar.accountOf')}</div>
      <div className="flex items-center gap-2">
        <div className="text-lg font-bold">
          {user?.firstName || ''} {user?.lastName || ''}
        </div>
      </div>
      <nav className="mt-6 space-y-2">
        <button
          onClick={() => setActiveSection('account')}
          className={`block w-full text-left ${activeSection === 'account' ? 'text-green-400' : 'hover:text-green-400'}`}
        >
          {t('userprofile.sidebar.accountSettings')}
        </button>
        <button
          onClick={() => setActiveSection('tickets')}
          className={`block w-full text-left ${activeSection === 'tickets' ? 'text-green-400' : 'hover:text-green-400'}`}
        >
          {t('userprofile.sidebar.purchasedTickets')}
        </button>
        <button
          onClick={() => setActiveSection('events')}
          className={`block w-full text-left ${activeSection === 'events' ? 'text-green-400' : 'hover:text-green-400'}`}
        >
          {t('userprofile.sidebar.myEvents')}
        </button>
        <hr className="my-4 border-gray-700" />
        {userAffiliateStatus === 'pending' ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg flex items-start gap-3 mb-2">
            <Info className="w-5 h-5 mt-0.5 text-yellow-500" />
            <div>
              <div className="font-semibold">
                {t('userprofile.sidebar.affiliatePendingTitle') || 'Affiliate Application Pending'}
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
                    <svg
                      className="animate-spin h-4 w-4 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
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
      </nav>
    </aside>
  )
}

export default Sidebar
