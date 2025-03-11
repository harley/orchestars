
import React from 'react';
import PaymentResultPage from './ResultPage';
import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import Footer from '@/components/layout/Footer';

type SearchParams = Promise<{ apptransid: string }>


const PaymentResult = async (props: { searchParams: SearchParams }) => {

    const params = await props.searchParams;
    console.log('params', params)

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const paymentInfo = await payload.find({
        collection: 'payments',
        limit: 1,
        where: { appTransId: { equals: params.apptransid } },
    }).then(res => res.docs?.[0])

    console.log('paymentInfo', paymentInfo)


    if (!paymentInfo) {
        return notFound()
    }
    return (
        <div className="min-h-screen flex flex-col">
            <PaymentResultPage paymentInfo={paymentInfo} />
            <Footer />
        </div>
    );
};

export default PaymentResult;