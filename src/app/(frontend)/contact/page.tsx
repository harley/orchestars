import PageClient from "./page.client"
import { FormBlock } from "@/blocks/Form/Component"
import type { Form } from "@payloadcms/plugin-form-builder/types"
import { getPayload } from "@/payload-config/getPayloadConfig"

async function ContactForm() {
  try {
    const payload = await getPayload()

    const formData = await payload.find({
      collection: 'forms',
      where: {
        type: {
          equals: 'contact'
        },
        status: {
          equals: 'active'
        }
      },
      limit: 1,
    })

    const form = formData.docs.length > 0 ? formData.docs[0] : null

    if (!form) {
      return (
        <div>
          <PageClient />
          <div> No form data available </div>
        </div>
      )
    }

    return (
      <div className="pt-16 pb-8">
        <PageClient />
        <FormBlock
          enableIntro={false}
          form={form as unknown as Form}
          introContent={undefined}
        />
      </div>
    )
  } catch (error) {
    console.error('Error fetching form data:', error)
    return (
      <div className="pt-16 pb-8">
        <PageClient />
        <div>An error occurred while loading the form.</div>
      </div>
    )
  }
}

export default ContactForm