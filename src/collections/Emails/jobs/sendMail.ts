import { BasePayload } from 'payload'
import { sendMailAndUpdateEmailRecord } from '../utils'

// Add debounce tracking
let lastRunTime = 0
const DEBOUNCE_INTERVAL = 10000 // 10s

export const sendMailJob = async ({ payload }: { payload: BasePayload }) => {
  try {
    const now = Date.now()

    if (now - lastRunTime < DEBOUNCE_INTERVAL) {
      return
    }
    lastRunTime = now

    console.log(`---> Running to send mail at ${new Date().toLocaleString()}\n`)

    const pendingEmails = await payload.find({
      collection: 'emails',
      where: {
        status: { equals: 'pending' },
      },
      limit: 10,
      sort: 'createdAt',
      depth: 0,
    })

    console.log(`---> Total mail sending ${pendingEmails.docs?.length}\n`)

    for (const email of pendingEmails.docs) {
      const resendMailData = {
        to: email.to,
        cc: email.cc as string,
        subject: email.subject,
        html: email.html as string,
      }

      try {
        await sendMailAndUpdateEmailRecord({
          emailId: email.id,
          payload,
          resendMailData,
        })

        await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay of 1 second
      } catch (error) {
        console.error('Error while sendMailJob', error)
      }
    }
  } catch (error) {
    console.error('Error while sendMailJob', error)
  }
}
