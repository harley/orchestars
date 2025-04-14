'use client'

import React, { useState } from 'react'
import { Button, useForm } from '@payloadcms/ui'

export const SendMailButton: React.FC = () => {
  const [loading, setLoading] = useState(false)

  const form = useForm()

  const handleAction = async () => {
    try {
      setLoading(true)

      await form.submit({
        overrides: (formState) => {
          const data = Object.keys(formState).reduce(
            (obj, key) => {
              obj[key] = formState[key].value

              return obj
            },
            {} as Record<string, unknown>,
          )

          return { ...data, allowSendMailAfterChanged: true } as unknown as any
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      <Button type="submit" disabled={loading}>
        Save
      </Button>
      <Button type="button" onClick={handleAction} disabled={loading}>
        Save and Send Mail
      </Button>
    </div>
  )
}

export default SendMailButton
