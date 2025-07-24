import { useState } from 'react'
import ForgotPasswordForm from './ForgotPasswordForm'

import LoginForm from './LoginForm'
import { AuthFormMode } from './types'
import RegisterForm from './RegisterForm'

interface AuthFormProps {
  onSuccess?: () => void
  onCloseSheet?: () => void
}

export default function AuthForm({ onSuccess, onCloseSheet }: AuthFormProps) {
  const [formMode, setFormMode] = useState<AuthFormMode>('login')

  const renderForm = (formMode: AuthFormMode) => {
    switch (formMode) {
      case 'login':
        return <LoginForm onSuccess={onSuccess} setFormMode={setFormMode} />
      case 'forgotPassword':
        return <ForgotPasswordForm onBackToLogin={() => setFormMode('login')} mode={formMode} />
      case 'firstTimeLogin':
        return <ForgotPasswordForm onBackToLogin={() => setFormMode('login')} mode={formMode} />
      case 'register':
        return <RegisterForm onSuccess={onCloseSheet} onSwitchToLogin={() => setFormMode('login')} />
    }
  }

  return renderForm(formMode)
}
