import { getPayload } from '@/payload-config/getPayloadConfig'
import { User } from '@/payload-types'
import { generateResetToken } from '@/utilities/generateResetToken'

export const setUserResetPasswordToken = async ({ userId }: { userId: User['id'] }) => {
  const payload = await getPayload()
  // Generate reset token and expiration
  const resetToken = generateResetToken()
  const resetExpiration = new Date(Date.now() + 1000 * 60 * 60).toISOString() // 1 hour

  // Update user with reset token
  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpiration: resetExpiration,
    },
  })

  return resetToken
}
