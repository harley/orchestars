import type { CollectionAfterChangeHook } from 'payload'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'
import { getServerSideURL } from '@/utilities/getURL'
import { affiliateAccountSetupEmailHtml } from '@/mail/templates/AffiliateAccountSetup'
import { setUserResetPasswordToken } from '@/collections/Users/utils/setUserResetPasswordToken'

export const sendAffiliateSetupEmail: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  // Only trigger for create operations and affiliate users

  if (operation !== 'create' || doc.role !== 'affiliate') {
    return doc
  }

  try {
    const { payload, transactionID } = req

    // Generate setup token (reusing the reset password token mechanism)
    const setupToken = await setUserResetPasswordToken({ userId: doc.id, transactionID })

    // Build affiliate-specific setup link
    const setupLink = `${getServerSideURL()}/affiliate/reset-password?token=${setupToken}`

    // Send setup email
    await sendMailAndWriteLog({
      resendMailData: {
        to: doc.email,
        subject: 'Welcome to OrcheStars Affiliate Program - Set Up Your Password',
        html: affiliateAccountSetupEmailHtml({ setupLink }),
      },
      emailData: { user: doc.id },
      payload,
      transactionID
    })

    console.log(`Affiliate setup email sent to: ${doc.email}`)
  } catch (error) {
    console.error('Error sending affiliate setup email:', error)
    // Don't throw error to prevent user creation from failing
    // The user can still use forgot password if needed
  }

  return doc
}
