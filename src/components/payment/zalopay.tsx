"use client"; // If you're using Next.js App Router
import { useState, useEffect } from 'react';
import Head from 'next/head';

// Shape of each bank item in your final UI
interface Bank {
  id: string;       // bankcode
  label: string;    // name
  imgSrc: string;   // icon path
}

// Shape of ZaloPay’s response
interface ZaloPayResponse {
  banks: {
    [pmcid: string]: {
      bankcode: string;
      name: string;
      displayorder: number;
      pmcid: number;
      minamount: number;
      maxamount: number;
    }[];
  };
  returncode: number;
  returnmessage: string;
}

// The bank codes you actually care about (from your screenshot)
const allowedBankCodes = [
  'VTB',  // Vietinbank
  'VARB', // Agribank
  'VCB',  // Vietcombank
  'BIDV', // BIDV
  'DAB',  // Đông Á Bank
  'SCB',  // Sacombank
  'ACB',  // ACB
  'MB',   // MBBank
  'TCB',  // Techcombank
  'VPB',  // VPBank
  'EIB',  // Eximbank
  'VIB',  // VIB
  'HDB',  // HDBank
  'OJB',  // Oceanbank
  'SHB',  // SHB
  'MSB',  // Maritime Bank
  'LPB',  // Liên Việt Post Bank
  'SGB',  // SaigonBank
  'OCB',  // OCB
  'SGCB', // TMCP Sài Gòn
  'NAB',  // Nam Á Bank
  'VAB',  // Việt Á Bank
  'BVB',  // Bảo Việt Bank
  'GPB',  // GPBank
  'BAB',  // Bắc Á Bank
  'VCCB', // Ngân hàng Bản Việt
];

export default function ZaloPayPaymentComponent() {
  // Payment method radio
  const [paymentMethod, setPaymentMethod] = useState<string>('zalopay');
  // Selected bank
  const [selectedBank, setSelectedBank] = useState<string>('');
  // Final list of banks for ATM
  const [banks, setBanks] = useState<Bank[]>([]);

  // Fetch banks on mount
  useEffect(() => {
    fetch('/api/zalopay/getbanks', {
      method: 'POST', // or 'GET' if your route is GET
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`ZaloPay API returned ${res.status}`);
        }
        return res.json() as Promise<ZaloPayResponse>;
      })
      .then((data) => {
        // We only care about pmcid=39 (ATM) from the ZaloPay response
        const atmBanks = data.banks['39'] || [];

        // 1. Filter so we only keep banks in our allowed list
        const filtered = atmBanks.filter((b) =>
          allowedBankCodes.includes(b.bankcode)
        );

        // 2. Optionally sort them in the order of your screenshot:
        //    (Define an array with your desired order, then .sort())
        //    We'll skip that here, but you could do:
        //    filtered.sort((a, b) => allowedBankCodes.indexOf(a.bankcode) - allowedBankCodes.indexOf(b.bankcode));

        // 3. Map them to your Bank[] shape
        const dynamicBanks: Bank[] = filtered.map((b) => ({
          id: b.bankcode,
          label: b.name,
          imgSrc: `/images/bank-${b.bankcode}.svg`, // e.g. /images/bank-vtb.svg
        }));

        setBanks(dynamicBanks);
      })
      .catch((err) => {
        console.error('Failed to fetch banks:', err);
      });
  }, []);

  return (
    <>
      <Head>
        <title>ZaloPay Gateway | Quy Cách</title>
      </Head>

      <div className="container">
        <p>Vui lòng chọn hình thức thanh toán:</p>
        <div className="mb-1">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="zalopay"
              checked={paymentMethod === 'zalopay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />{' '}
            Ví{' '}
            <img
              src="/images/logo-zalopay.svg"
              alt="ZaloPay"
              className="inline-img"
            />
          </label>
        </div>
        <div className="mb-1">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="visa"
              checked={paymentMethod === 'visa'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />{' '}
            Visa, Mastercard, JCB{' '}
            <span className="txtGray">(qua cổng ZaloPay)</span>
          </label>
        </div>
        <div className="mb-1">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="atm"
              checked={paymentMethod === 'atm'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />{' '}
            Thẻ ATM <span className="txtGray">(qua cổng ZaloPay)</span>
          </label>
        </div>

        {/* Only show banks if user picks ATM */}
        {paymentMethod === 'atm' && (
          <div className="bank-group flex flex-wrap gap">
            {banks.map((bank) => (
              <a
                href="#"
                key={bank.id}
                className={`bank-item ${
                  selectedBank === bank.id ? 'selected' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedBank(bank.id);
                }}
                style={{ display: 'flex' }}
              >
                <img src={bank.imgSrc} alt={bank.label} />
                {bank.label}
                <img
                  src="/images/check-mark.svg"
                  alt="Check mark"
                  className="checkmark"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          color: #293c56;
        }
        .mb-1 {
          margin-bottom: 1rem;
        }
        .inline-img {
          display: inline-block;
          vertical-align: middle;
          margin-left: 4px;
        }
        .txtGray {
          color: #798594;
        }
        .bank-group {
          margin-left: 30px;
          max-width: 850px;
        }
        a,
        a:hover,
        a:visited,
        a:link {
          text-decoration: none !important;
          color: #293c56;
        }
        .bank-item {
          display: inline-block;
          width: 180px;
          height: 48px;
          padding: 10px;
          border-radius: 4px;
          border: 2px solid #f1f1f1;
          position: relative;
          vertical-align: top;
          margin-right: 10px;
          margin-bottom: 15px;
          font-size: 13px;
          transition: border 0.2s ease;
        }
        .bank-item img {
          vertical-align: middle;
          margin-right: 5px;
        }
        .bank-item .checkmark {
          display: none;
          width: 20px;
          height: 20px;
        }
        .bank-item.selected .checkmark {
          display: block;
          position: absolute;
          top: -10px;
          right: -10px;
        }
        .bank-item.selected,
        .bank-item:hover {
          border: 2px solid #04be04;
        }
      `}</style>
    </>
  );
}
