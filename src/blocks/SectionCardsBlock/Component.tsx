import { Media, CardsBlock, Page } from '@/payload-types'
import Link from 'next/link'
import React from 'react'

export const CardsBlockComponent: React.FC<{
  sections: CardsBlock['sections']
  disableInnerContainer?: boolean
}> = ({ sections }) => {

  return (
    <div className="">
      <div className="container mx-auto px-6">
        <div className="mt-8">
          {Array.isArray(sections) &&
            sections.map((section, idx) => (
              <div key={idx} className="mb-20">
                <h2 className="text-2xl font-bold mb-6 uppercase">{section.heading}</h2>
                <div
                  className={`grid gap-8 ${section.cards?.length === 1 ? '' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
                >
                  {section.cards?.map?.((card, mIdx) => (
                    <div key={mIdx} className="w-full max-w-xs flex flex-col">
                      <img
                        src={(card?.image as Media)?.url as string}
                        alt={card.title || (card.link?.reference?.value as Page)?.title|| ''}
                        className="w-full h-72 object-cover mb-4 rounded"
                      />
                      <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                      <p className="mb-4">{card.description || (card.link?.reference?.value as Page)?.description}</p>
                      {(card.link?.reference?.value as Page)?.slug && (
                        <Link
                          href={(card.link?.reference?.value as Page)?.slug as string}
                          className="border px-4 py-2 rounded self-start hover:bg-black/90 hover:text-white transition-all"
                        >
                          Read more
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
