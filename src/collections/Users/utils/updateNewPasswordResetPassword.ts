import { getPayload } from '@/payload-config/getPayloadConfig'
import { generateSalt, hashPassword } from '@/utilities/password'

export const updateNewPasswordUserResetPassword = async ({
  resetPasswordToken,
  newPassword
}: {
  resetPasswordToken: string
  newPassword: string
}) => {
  const payload = await getPayload()

  // Find user by reset token
  const userRes = await payload.find({
    collection: 'users',
    where: { resetPasswordToken: { equals: resetPasswordToken } },
    limit: 1,
    select: {
      id: true,
      email: true,
      resetPasswordExpiration: true,
      resetPasswordToken: true,
    },
    showHiddenFields: true,
  })

  const user = userRes.docs[0]

  // Validate token and expiration
  if (
    !user ||
    !user.resetPasswordExpiration ||
    new Date(user.resetPasswordExpiration) < new Date()
  ) {
    throw new Error('Invalid or expired reset token')
  }

  // Generate new salt and hash for the new password
  const salt = await generateSalt()
  const hash = await hashPassword(newPassword, salt)

  // Update user with new password and clear reset token
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      salt,
      hash,
      resetPasswordToken: null,
      resetPasswordExpiration: null,
    },
  })

  return user
}
