import { Button } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

export const ActionViews: React.FC = () => {
  return <Link href="/admin/create-order">
    <Button>Create Order</Button>
  </Link>
}

