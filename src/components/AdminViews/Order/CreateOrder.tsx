'use server'

import React from 'react'
import type { AdminViewProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import CreateOrderForm from './CreateOrderForm'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import { fetchOpenSalesEvents } from './actions'

export const CreateOrder: React.FC<AdminViewProps> = async ({
  initPageResult,
  params,
  searchParams,
}) => {
  if (!initPageResult?.req?.user) {
    return redirect('/admin/login')
  }

  const openSalesEvents = await fetchOpenSalesEvents()

  return (
    <DefaultTemplate
      params={params}
      searchParams={searchParams}
      i18n={initPageResult.req.i18n}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      user={initPageResult.req.user || undefined}
      locale={initPageResult.locale}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1 style={{ marginBottom: 24 }}>Create Order</h1>
      </Gutter>
      <CreateOrderForm events={openSalesEvents} />
    </DefaultTemplate>
  )
}

export default CreateOrder
