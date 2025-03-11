'use server';

import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { AppInformation } from '@/types/AppInformation';


const getAppInformation = async () => {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const appInfo = await payload.find({
        collection: 'app_information',
        limit: 1,
    }).then(res => res.docs?.[0])

    return appInfo;
}

const ServerLayout = async ({ children }: { children: React.ReactNode }) => {

    const appInformation = (await getAppInformation()) as AppInformation

    return (
        <div>
            <Header appInformation={appInformation} />
            {children}
            <Footer appInformation={appInformation} />
        </div>
    )
}

export default ServerLayout