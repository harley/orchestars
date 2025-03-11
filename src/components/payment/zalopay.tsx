"use client"; // If you're using Next.js App Router
import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Bank {
  id: string;       // bankcode
  label: string;    // name
  imgSrc: string;   // icon path
}

// shape of /api/zalopay/getbanks response
interface ZaloPayBanksResponse {
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

// shape of /api/zalopay/createorder response
interface CreateOrderResponse {
  return_code: number;
  return_message: string;
  sub_return_code: number;
  sub_return_message: string;
  zp_trans_token: string;
  order_url: string;
  cashier_order_url: string;
  order_token: string;
  qr_code: string;
}

// The bank codes you actually care about (from your screenshot)
const allowedBankCodes = [
  'VTB', 'VARB', 'VCB', 'BIDV', 'DAB', 'SCB', 'ACB', 'MB', 'TCB', 'VPB',
  'EIB', 'VIB', 'HDB', 'OJB', 'SHB', 'MSB', 'LPB', 'SGB', 'OCB', 'SGCB',
  'NAB', 'VAB', 'BVB', 'GPB', 'BAB', 'VCCB',
];

export default function ZaloPayPaymentComponent() {
  // Payment method radio
  const [paymentMethod, setPaymentMethod] = useState<string>('zalopay');
  // Selected bank (only relevant for ATM)
  const [selectedBank, setSelectedBank] = useState<string>('');
  // Final list of banks for ATM
  const [banks, setBanks] = useState<Bank[]>([]);
  // The URL we’ll load in an iframe after createorder
  const [orderUrl, setOrderUrl] = useState<string>('');

  // 1. Fetch list of banks on mount
  useEffect(() => {
    fetch('/api/zalopay/getbanks', { method: 'POST' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`ZaloPay getbanks returned ${res.status}`);
        }
        return res.json() as Promise<ZaloPayBanksResponse>;
      })
      .then((data) => {
        const atmBanks = data.banks['39'] || [];
        const filtered = atmBanks.filter((b) => allowedBankCodes.includes(b.bankcode));

        const dynamicBanks: Bank[] = filtered.map((b) => ({
          id: b.bankcode,
          label: b.name,
          imgSrc: `/images/bank-${b.bankcode}.svg`,
        }));
        setBanks(dynamicBanks);
      })
      .catch((err) => {
        console.error('Failed to fetch banks:', err);
      });
  }, []);

  // 2. Handle createorder
  const handleCreateOrder = async () => {
    // Determine bank_code based on paymentMethod
    let bankCode: string;
    if (paymentMethod === 'atm') {
      if (!selectedBank) {
        alert('Vui lòng chọn ngân hàng (ATM)');
        return;
      }
      bankCode = selectedBank; // user-chosen bank
    } else if (paymentMethod === 'visa') {
      // ZaloPay docs typically use "CC" for Visa/Master/JCB
      bankCode = 'CC';
    } else {
      // "zalopay"
      bankCode = 'zalopayapp';
    }

    try {
      // Example request body
      const reqBody = {
        app_user: 'user123',
        app_time: Date.now(),
        item: [{ id: 'item1', name: 'Item 1', price: 10000, quantity: 1 }],
        embed_data: { note: 'test embed' },
        amount: 50000,
        bank_code: bankCode,
      };

      const res = await fetch('/api/zalopay/createorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) {
        throw new Error(`createorder returned ${res.status}`);
      }

      const data: CreateOrderResponse = await res.json();
      console.log('Create order response:', data);

      if (data.return_code === 1) {
        // success => set the orderUrl in state
        setOrderUrl(data.order_url);
      } else {
        alert(`Create order failed: ${data.return_message}`);
      }
    } catch (err: any) {
      console.error('Failed to create order:', err);
      alert('Failed to create order');
    }
  };

  return (
    <>
      <Head>
        <title>ZaloPay Gateway | Quy Cách</title>
      </Head>

      <div className="container">
        <p>Vui lòng chọn hình thức thanh toán:</p>
        {/* Payment method radio */}
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

        {/* Submit button */}
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleCreateOrder}>
            Thanh Toán
          </button>
        </div>

        {/* If we have an orderUrl, show an iframe */}
        {orderUrl && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Thanh toán qua ZaloPay:</h3>
            <iframe
              src={orderUrl}
              width="600"
              height="700"
              title="ZaloPay Payment"
              style={{ border: '1px solid #ccc' }}
            />
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
