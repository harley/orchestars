import { getPayload } from '@/payload-config/getPayloadConfig'
import { User } from '@/payload-types'
import { TransactionID } from '@/types/TransactionID'
import { generateResetToken } from '@/utilities/generateResetToken'

export const setUserResetPasswordToken = async ({
  userId,
  expiresInHours,
  transactionID
}: {
  userId: User['id']
  expiresInHours?: number
  transactionID?: TransactionID
}) => {
  const payload = await getPayload()
  // Generate reset token and expiration
  const resetToken = generateResetToken()
  const _expiresInHours = expiresInHours || 1
  const resetExpiration = new Date(Date.now() + 1000 * 60 * 60 * _expiresInHours).toISOString() // 1 hour

  // Update user with reset token
  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpiration: resetExpiration,
    },
    req: { transactionID },
  })

  return resetToken
}
