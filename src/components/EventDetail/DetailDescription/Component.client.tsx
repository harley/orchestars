'use client'

import { Event } from '@/payload-types'
import React, { useState } from 'react'
import { RichText as RichTextConverter } from '@payloadcms/richtext-lexical/react'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { useTranslate } from '@/providers/I18n/client'

const DetailDescriptionClient = ({ event }: { event: Event }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslate()

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
            {t('event.introduction')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
        </div>
        <div
          className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-full' : 'max-h-40'
          }`}
        >
          <RichTextConverter data={event.detailDescription as SerializedEditorState} />
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" />
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none transition-colors duration-200"
        >
          {isExpanded ? t('event.viewLess') : t('event.viewMore')}
        </button>
      </div>
    </section>
  )
}

export default DetailDescriptionClient
