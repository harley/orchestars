import { Media, Page } from '@/payload-types'
import React from 'react'

export const RenderPageBanner: React.FC<{
  banner: Page['banner']
  disableInnerContainer?: boolean
}> = ({ banner }) => {
  return (
    (banner as Media)?.url && (
      <div className="">
        {/* Banner Image */}
        <div className="w-full mb-10">
          <img
            src={(banner as Media)?.url || ''}
            alt={(banner as Media)?.alt || ''}
            className="w-full max-h-[500px] h-full object-cover shadow"
          />
        </div>
      </div>
    )
  )
}
