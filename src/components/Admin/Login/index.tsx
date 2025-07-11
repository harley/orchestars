import type { AdminViewProps } from 'payload'

import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { redirect } from 'next/navigation'
import { getSafeRedirect } from 'payload/shared'
import React, { Fragment } from 'react'
import { Logo } from '@/components/Logo/Logo'
import { LoginForm } from './LoginForm'
import './index.scss'

export const loginBaseClass = 'login'

export function LoginView({ initPageResult, params, searchParams }: AdminViewProps) {
  const {
    locale,
    permissions,
    req,
  } = initPageResult
  const {
    i18n,
    payload: { config },
    payload,
    user,
  } = req

  const {
    admin: {
      components: { afterLogin, beforeLogin } = {},
      user: userSlug,
    },
    routes: { admin: adminRoute },
  } = config

  const redirectUrl = getSafeRedirect({
    fallbackTo: adminRoute,
    redirectTo: searchParams?.redirect ?? '',
  })

  if (user) {
    redirect(redirectUrl)
  }

  const collectionConfig = payload?.collections?.[userSlug]?.config
  const prefillAutoLogin =
    typeof config.admin?.autoLogin === 'object' && config.admin?.autoLogin.prefillOnly
  const prefillUsername =
    prefillAutoLogin && typeof config.admin?.autoLogin === 'object'
      ? config.admin?.autoLogin.username
      : undefined
  const prefillEmail =
    prefillAutoLogin && typeof config.admin?.autoLogin === 'object'
      ? config.admin?.autoLogin.email
      : undefined
  const prefillPassword =
    prefillAutoLogin && typeof config.admin?.autoLogin === 'object'
      ? config.admin?.autoLogin.password
      : undefined

  return (
    <Fragment>
      <div className={`${loginBaseClass}__brand`}>
        <Logo />
      </div>
      <RenderServerComponent
        Component={beforeLogin}
        importMap={payload.importMap}
        serverProps={{ i18n, locale, params, payload, permissions, searchParams, user }}
      />
      {!collectionConfig?.auth?.disableLocalStrategy && (
        <LoginForm
          prefillEmail={prefillEmail}
          prefillPassword={prefillPassword}
          prefillUsername={prefillUsername}
          searchParams={searchParams}
        />
      )}
      <RenderServerComponent
        Component={afterLogin}
        importMap={payload.importMap}
        serverProps={{ i18n, locale, params, payload, permissions, searchParams, user }}
      />
    </Fragment>
  )
}

export default LoginView 