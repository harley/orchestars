'use client'

import { Event } from '@/payload-types'
import React, { useState } from 'react'
import { RichText as RichTextConverter } from '@payloadcms/richtext-lexical/react'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

const DetailDescriptionClient = ({ event }: { event: Event }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-xl font-bold mb-4">Giới Thiệu</h3>
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
          {isExpanded ? 'Ẩn bớt' : 'Xem thêm'}
        </button>
      </div>
    </section>
  )
}

export default DetailDescriptionClient
