'use client'

import { EmailField, TextField, useTranslation } from '@payloadcms/ui'
import { email, username } from 'payload/shared'
import React from 'react'

interface Props {
  type: 'email' | 'username' | 'emailOrUsername'
  required?: boolean
}

export const LoginField = (props: Props) => {
  const { type, required: requiredFromProps } = props
  const required = requiredFromProps === undefined ? true : requiredFromProps
  const { t } = useTranslation()

  if (type === 'email') {
    return (
      <EmailField
        field={{
          name: 'email',
          admin: {
            autoComplete: 'email',
            placeholder: '',
          },
          label: t('general:email'),
          required,
        }}
        path="email"
        validate={email}
      />
    )
  }

  if (type === 'username') {
    return (
      <TextField
        field={{
          name: 'username',
          label: t('authentication:username'),
          required,
        }}
        path="username"
        validate={username}
      />
    )
  }

  if (type === 'emailOrUsername') {
    const validate = (value, options) => {
      const passesUsername = username(value, options)
      const passesEmail = email(value, options)

      if (passesUsername !== true && passesEmail !== true) {
        return `${t('general:email')}: ${passesEmail} ${t('general:or')} ${t(
          'authentication:username',
        )}: ${passesUsername}`
      }

      return true
    }

    return (
      <TextField
        field={{
          name: 'username',
          label: t('authentication:emailOrUsername'),
          required,
        }}
        path="username"
        validate={validate}
      />
    )
  }

  return null
} 