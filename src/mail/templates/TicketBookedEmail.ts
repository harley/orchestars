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
            color: #000;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .content p {
            margin-bottom: 12px;
          }
          strong {
            font-weight: bold;
          }
          a {
            color: #0a5cd9;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p><strong>Xin chào Quý Khách,</strong><br />
          <em>Dear Valued Guest,</em></p>

          <p> OrcheStars xin cảm ơn bạn đã đặt vé tham dự chương trình hòa nhạc <strong>${ticketData.eventName}</strong>.<br />
          <em>We appreciate your purchase of tickets to the ${ticketData.eventName} concert.</em></p>

          <p><strong>Thông tin vé của bạn:</strong><br />
          <em>Your booking details:</em><br />
          <strong>Ticket Code: ${ticketData.ticketCode || 'N/A'}</strong></p>

          <p><strong>Chúng tôi xác nhận bạn đã thanh toán thành công. Thông tin số ghế cụ thể và hạng vé sẽ được cập nhật trong vòng 24–48 giờ làm việc tới.</strong><br />
          <em>Your payment has been successfully confirmed. We will send you the detailed seat and ticket category information within the next 24–48 business hours.</em></p>

          <p>
          Trong thời gian chờ đợi, bạn có thể theo dõi những cập nhật mới nhất trên 
          <a href="https://www.facebook.com/orchestars" target="_blank">OrcheStars Fanpage</a>.<br />
          <em>
            While waiting, feel free to check out the latest updates on the 
            <a href="https://www.facebook.com/orchestars" target="_blank">OrcheStars Fanpage</a>.
          </em>
          </p>
        
          <p>Hẹn gặp bạn tại hòa nhạc <strong>${ticketData.eventName}</strong>!<br />
          <em>See you at the ${ticketData.eventName} concert.</em></p>

          <p>Trân trọng,<br />
          <em>Best regards,</em></p>

          <p>OrcheStars </p>
        </div>
      </body>
    </html>
  `
}
