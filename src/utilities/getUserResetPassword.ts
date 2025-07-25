import { APP_BASE_URL } from '@/config/app'
import { getServerSideURL } from './getURL'

export function getUserResetPassword(resetToken: string) {
  const resetPasswordLink = `${getServerSideURL() || APP_BASE_URL}/user/reset-password?token=${resetToken}`

  return resetPasswordLink
}
