'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
const VietQRPaymentComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams.get('amount');
  const addInfo = searchParams.get('addInfo');
  const [isValidParams, setIsValidParams] = React.useState(true);
  // Wait for the "amount" parameter to be available
  if (!amount) {
    return <div>Loading payment information...</div>;
  }
  // Validate amount is a positive number
  React.useEffect(() => {
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setIsValidParams(false);
    }
  }, [amount]);
  if (!isValidParams) {
    return <div className="text-red-500">Invalid payment parameters</div>;
  }

  const bankId = process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'vietcombank';
  const accountNumber = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NUMBER || '1055355412';
  const accountName = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || "CONG TY CO PHAN ORCHESTARS";
  const imageUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${addInfo || ''}&accountName=${encodeURIComponent(accountName)}`;
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
