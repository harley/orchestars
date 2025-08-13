'use client';

import { CheckCircle } from 'lucide-react';
import { useTranslate } from '@/providers/I18n/client';

export default function PageClient() {
  const { t } = useTranslate();

  return (
    <div className="w-full p-4 max-w-sm mx-auto py-20">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('giftTicketVerification.title')}
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {t('giftTicketVerification.description')}
        </p>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-blue-900 mb-3">{t('giftTicketVerification.simpleInstructionsTitle')}:</h3>
          <ol className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
              <span>{t('giftTicketVerification.simpleStep1')}</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
              <span>{t('giftTicketVerification.simpleStep2')}</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
              <span>{t('giftTicketVerification.simpleStep3')}</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
