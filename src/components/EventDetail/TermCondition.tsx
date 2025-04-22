'use server'

import React from 'react'
import { t, getLocale } from '@/providers/I18n/server'

const TermCondition = async ({ termCondition }: { termCondition: string }) => {
  const locale = await getLocale()

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent uppercase">
          {t('event.termsAndPolicies', locale)}
        </h2>

        <div className="mx-auto">
          <div className="py-6 bg-white">
            <pre
              dangerouslySetInnerHTML={{ __html: termCondition }}
              className="whitespace-pre-wrap font-montserrat"
            ></pre>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TermCondition
