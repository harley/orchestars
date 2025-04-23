'use client'

import { useTranslate } from '@/providers/I18n/client'
import { Partner } from '@/types/Partner'

const Partners = ({ partners = [], className }: { partners: Partner[]; className?: string }) => {
  const { t } = useTranslate()
  return (
    <section className={`py-10 md:py-20 ${className || ''}`}>
      <div className="container mx-auto px-4 w-full">
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-bold uppercase">
            {t('home.sponsorsAndPartners')}
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.link}
              rel={'noreferrer'}
              target="_blank"
              className="cursor-pointer"
            >
              <img
                src={partner.logo?.url}
                alt={partner.logo?.alt || partner.name}
                className=" max-h-40 max-w-40 object-contain cursor-pointer rounded"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Partners
