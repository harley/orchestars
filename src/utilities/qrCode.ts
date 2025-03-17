import QRCode from 'qrcode'

export const getQRCodeStringBuffer = (val: string): Promise<Buffer> =>
  new Promise((res) =>
    QRCode.toBuffer(val, async (err, buffer) => {
      res(buffer)
    }),
  )
