import { Page } from '@/payload-types'
import Link from 'next/link'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const RenderPageBreadcrumb: React.FC<{
  breadcrumbs: Page['breadcrumbs']
  disableInnerContainer?: boolean
}> = ({ breadcrumbs }) => {
  return (
    !!breadcrumbs?.length && (
      <div className="container mx-auto px-6 py-4">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs!.length - 1

              return (
                <React.Fragment key={crumb.id}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-[16px]">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink className="font-semibold text-[16px] text-[#615F5D]">
                        <Link href={crumb.url as string}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  )
}
