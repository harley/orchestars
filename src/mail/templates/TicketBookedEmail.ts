export interface TicketData {
  ticketCode?: string
  eventName: string
}

export async function generateTicketBookEmailHtml(ticketData: TicketData) {
  return `
  <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Ticket Confirmation - ${ticketData.eventName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 20px;
          }
          .terms {
            font-size: 0.9em;
            color: #555;
          }
          .qr-code {
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Xin chào Quý Khách,</h1>
            <h2>Imagine Philharmonic Orchestra (IPO)</h2>
          </div>
          <div class="content">
            <p>
              Imagine Philharmonic Orchestra (IPO) xin cảm ơn bạn đã đặt vé tham dự
              chương trình hòa nhạc
              <strong>${ticketData.eventName}</strong>.
            </p>
            <p>
              We appreciate your purchasing tickets to the
              <strong>${ticketData.eventName}</strong> concert.
            </p>
            <p>
              <strong>Thông tin vé của bạn như sau:</strong><br />
              <strong>Your booking details are as follows:</strong>
            </p>
            <p>
              Ticket Code: ${ticketData.ticketCode || 'N/A'}<br />
              <!-- You can insert additional dynamic details here -->
            </p>
            <p>
              Bạn vui lòng xem điều khoản &amp; điều kiện, quy định check-in đính
              kèm bên dưới và mang theo email vé điện tử có chứa QR code để check-in
              tại đêm nhạc.<br />
              Please check the attached terms &amp; conditions and check in. You
              will need this email ticket containing QR code to check in at the
              show.
            </p>
            <p>
              Khách hàng có trách nhiệm bảo mật tuyệt đối mã Mã QR Vé điện tử của
              mình. Trường hợp có nhiều hơn 1 người check-in bằng 1 Mã QR Vé điện
              tử, BTC sẽ chấp nhận người đầu tiên check-in mã QR Vé đó được tham gia
              chương trình.<br />
              Audiences are responsible for keeping the E-Ticket QR code absolutely
              confidential. In case more than 1 person checks in with 1 e-Ticket QR
              Code, the Organizing Committee will accept the first person to check
              in with that QR Code as referenced in the show.
            </p>
            <p>
              Hẹn gặp bạn tại hòa nhạc giao hưởng
              <strong>${ticketData.eventName}</strong>!<br />
              See you at the <strong>${ticketData.eventName}</strong> concert!
            </p>
            <p>
              Trân trọng,<br />
              Best regards,
            </p>
          </div>
        </div>
      </body>
    </html>
    `
}
