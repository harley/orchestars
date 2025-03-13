'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';

const VietQRPaymentComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams.get('amount');
  const addInfo = searchParams.get('addInfo');

  // Wait for the "amount" parameter to be available
  if (!amount) {
    return <div>Loading payment information...</div>;
  }

  // Construct the image URL with the parsed query parameters
  const imageUrl = `https://img.vietqr.io/image/vietcombank-1055355412-compact2.jpg?amount=${amount}&addInfo=${addInfo}&accountName=${encodeURIComponent("CONG TY CO PHAN ORCHESTARS")}`;
  const handleGoHome = () => {
    router.push('/');
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">VietQR Payment</h1>
      <img src={imageUrl} alt="VietQR Payment" className="w-1/2" />
      <div className="mt-4">
        <Button variant="outline" onClick={handleGoHome}>Về Trang Chủ</Button>
      </div>
    </div>
  );
};

export default VietQRPaymentComponent;
