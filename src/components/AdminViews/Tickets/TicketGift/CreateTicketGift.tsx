'use server'

import React from 'react'
import type { AdminViewProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import CreateTicketGiftForm from './CreateTicketGiftForm'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'

export const CreateTicketGift: React.FC<AdminViewProps> = async ({
  initPageResult,
  params,
  searchParams,
}) => {
  if (!initPageResult?.req?.user) {
    return redirect('/admin/login')
  }

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
        <h1 style={{ marginBottom: 24 }}>Create Ticket Gifts</h1>
      </Gutter>
      <CreateTicketGiftForm />
    </DefaultTemplate>
  )
}

export default CreateTicketGift
