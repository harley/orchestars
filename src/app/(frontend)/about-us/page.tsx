import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import ServerLayout from '@/components/layout/ServerLayout'
import { RichText } from '@payloadcms/richtext-lexical/react'

export const dynamic = 'force-dynamic'

export default async function AboutUs() {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const aboutUsContent = await payload.find({
        collection: 'app_information',
        limit: 1,
        select: { aboutUs: true }
    }).then(res => res.docs?.[0]?.aboutUs)

    return (
        <ServerLayout>
            <div className="min-h-screen flex flex-col">
                <main className="flex-grow">
                    <div className="bg-secondary/40 py-16 mt-20">
                        <div className="container mx-auto px-6 md:px-10">
                            <h2 className="text-3xl font-bold mb-10 text-center">Về chúng tôi</h2>
                            {!!aboutUsContent && <RichText data={aboutUsContent as any} />}
                        </div>
                    </div>
                </main>
            </div>
        </ServerLayout>
    )
}
