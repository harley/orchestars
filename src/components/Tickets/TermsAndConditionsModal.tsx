'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTranslate } from '@/providers/I18n/client'

export function TermsAndConditionsModal({ terms }: { terms: string }) {
  const { t } = useTranslate()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="underline text-xs text-gray-500 hover:text-gray-800">
          {t('ticket.details')}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>{t('ticket.details')}</DialogTitle>
        </DialogHeader>
        <div className="py-4 whitespace-pre-wrap text-sm text-gray-700 max-h-[60vh] overflow-y-auto">
          {terms}
        </div>
      </DialogContent>
    </Dialog>
  )
} 