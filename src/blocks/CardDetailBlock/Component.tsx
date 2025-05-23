import React from 'react'
import { Media, CardDetailBlock, Page } from '@/payload-types'
import RichText from '@/components/RichText'

const CardDetailBlockComponent: React.FC<
  CardDetailBlock & { breadcrumbs?: NonNullable<Page['breadcrumbs']> }
> = (props) => {
  const { banner, title, category, introContent } = props
  return (
    <div className="container mx-auto px-6">
      {/* Banner Image */}
      {(banner as Media)?.url && (
        <div className="w-full mb-10">
          <img
            src={(banner as Media)?.url || ''}
            alt={title || ''}
            className="w-full h-[450px] object-cover shadow"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Name & Genre */}
        <div className="md:w-1/3 flex flex-col items-start">
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          {category && <p className="mb-4">{category}</p>}
        </div>
        {/* Right: Description & More Info */}
        <div className="md:w-2/3">
          <div className="mb-6 text-base text-muted-foreground whitespace-pre-line">
            {introContent && <RichText data={introContent} enableGutter={false} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardDetailBlockComponent
