'use client'

import React from 'react'
import { PaymentDetails } from './types'

const VietQR = ({ paymentDetails }: { paymentDetails: PaymentDetails }) => {
  return (
    <div className="text-center">
      <div className="relative w-[350px] h-[350px]">
        {/* {loading && (
          <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-12 h-12 animate-spin" />
            <span className="text-xs">Đang tải...</span>
          </div>
        )} */}
        {paymentDetails?.qrDataURL ? (
          <img
            src={paymentDetails.qrDataURL}
            className="max-w-[540px] max-h-[540px] object-contain w-full h-full box-border"
            alt="QR Code"
          />
        ) : (
          <>
            <div className="absolute z-50 top-[30%] left-1/2 -translate-x-1/2 p-5 bg-gray-100/30 rounded-md flex flex-col items-center justify-center gap-2">
              <span className="text-xs">
                Có lỗi xảy ra khi hiển thị mã QR. Vui lòng tải lại trang hoặc bạn có thể nhập thông
                tin chuyển khoản bên cạnh để tiến hành thanh toán
              </span>
            </div>
          </>
        )}
      </div>
      <p className="mt-1 text-sm font-semibold italic">Quét mã này để chuyển tiền</p>
    </div>
  )
}

export default VietQR
