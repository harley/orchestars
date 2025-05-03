'use client'

import React from 'react'
import { Event } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'

interface TermsConditionsProps {
  event: Event
}

const TermsConditions: React.FC<TermsConditionsProps> = ({ event }) => {
  const { t } = useTranslate()

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">{t('event.termsAndConditions')}</h2>

        <div className="space-y-8">
          {/* Use event terms if available, otherwise show default terms */}
          {event.eventTermsAndConditions ? (
            <div
              className="whitespace-pre-wrap font-montserrat"
              dangerouslySetInnerHTML={{ __html: event.eventTermsAndConditions }}
            />
          ) : (
            <>
              <div>
                <p className="font-medium">- {t('event.terms.nonRefundable.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.nonRefundable.subtitle')}</p>
              </div>

              <div>
                <p className="font-medium">- {t('event.terms.ageRestriction.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.ageRestriction.subtitle')}</p>
              </div>

              <div>
                <p className="font-medium">- {t('event.terms.eTicket.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.eTicket.subtitle')}</p>
              </div>

              <div>
                <p className="font-medium">- {t('event.terms.resoldTickets.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.resoldTickets.subtitle')}</p>
              </div>

              <div>
                <p className="font-medium">- {t('event.terms.recording.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.recording.subtitle')}</p>
              </div>

              <div>
                <p className="font-medium">- {t('event.terms.disturbance.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.disturbance.subtitle')}</p>
              </div>

              <div>
                <p className="font-medium">- {t('event.terms.finalDecision.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.finalDecision.subtitle')}</p>
              </div>

              <div>
                <p className="font-medium">- {t('event.terms.checkInTime.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.checkInTime.subtitle')}</p>
              </div>

              <div>
                <p className="font-medium">- {t('event.terms.showStart.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.showStart.subtitle')}</p>
              </div>

              <div>
                <p className="font-medium">- {t('event.terms.checkInEnd.title')}</p>
                <p className="text-gray-600 italic">{t('event.terms.checkInEnd.subtitle')}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default TermsConditions
