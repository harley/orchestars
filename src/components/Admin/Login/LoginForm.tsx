'use client'

import { Form, FormSubmit, Link, PasswordField, useAuth, useConfig, useTranslation } from '@payloadcms/ui'
import { formatAdminURL, getLoginOptions, getSafeRedirect } from 'payload/shared'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginField } from './LoginField'

const baseClass = 'login__form'

export const LoginForm = ({ prefillEmail, prefillPassword, prefillUsername, searchParams }) => {
  const config = useConfig() as any
  const {
    admin: { user: userSlug, routes: { admin: adminRoute, forgot: forgotRoute } },
    routes: { api: apiRoute },
  } = config
  
  const { getEntityConfig } = config

  const collectionConfig = getEntityConfig({ collectionSlug: userSlug })
  const { auth: authOptions } = collectionConfig
  const { loginWithUsername } = authOptions
  const { canLoginWithEmail, canLoginWithUsername } = getLoginOptions(loginWithUsername)

  const getLoginType = () => {
    if (canLoginWithEmail && canLoginWithUsername) {
      return "emailOrUsername"
    }
    if (canLoginWithUsername) {
      return "username"
    }
    return "email"
  }

  const [loginType] = useState(getLoginType())
  const { t } = useTranslation()
  const { setUser } = useAuth()
  const router = useRouter()
  const searchParamsNext = useSearchParams()
  const redirect = searchParamsNext.get('redirect')

  const handleLogin = (data) => {
    setUser(data)
    if (redirect) {
      router.push(redirect)
    } else {
      router.push(adminRoute)
    }
  }

  const initialState: {
    email?: any
    username?: any
    password?: any
  } = {
    password: {
      initialValue: prefillPassword ?? undefined,
      valid: true,
      value: prefillPassword ?? undefined
    }
  }

  if (loginWithUsername) {
    initialState.username = {
      initialValue: prefillUsername ?? undefined,
      valid: true,
      value: prefillUsername ?? undefined
    }
  } else {
    initialState.email = {
      initialValue: prefillEmail ?? undefined,
      valid: true,
      value: prefillEmail ?? undefined
    }
  }

  return (
    <Form
      action={`${apiRoute}/${userSlug}/login`}
      className={baseClass}
      disableSuccessStatus
      initialState={initialState}
      method="POST"
      onSuccess={handleLogin}
      waitForAutocomplete
    >
      <div className={`${baseClass}__inputWrap`}>
        <LoginField type={loginType} />
        <PasswordField
          field={{
            name: "password",
            label: t("general:password"),
            required: true
          }}
          path="password"
        />
      </div>
      <Link href={formatAdminURL({ adminRoute, path: forgotRoute })} prefetch={false}>
        {t("authentication:forgotPasswordQuestion")}
      </Link>
      <FormSubmit size="large">{t("authentication:login")}</FormSubmit>
    </Form>
  )
} 