'use client'

import { Event } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText as RichTextConverter } from '@payloadcms/richtext-lexical/react'

const About = ({ eventDetail }: { eventDetail: Event }) => {
  const { t } = useTranslate()

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold mb-8 uppercase">{t('event.introduction')}</h2>

        <RichTextConverter data={eventDetail.detailDescription as SerializedEditorState} />
      </div>
    </section>
  )
}

export default About
