export interface TicketData {
  ticketCode?: string
  seat?: string
  eventName: string
  eventDate?: string
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

          <p> OrcheStars xin cảm ơn bạn đã <strong>đặt hàng thành công</strong> cho chương trình hòa nhạc <strong>${ticketData.eventName}</strong>.<br />
          <em>We appreciate your successful order for the ${ticketData.eventName} concert.</em></p>

          <p><strong>Thông tin vé của bạn:</strong><br />
          <em>Your Booking Details:</em></p>
          <ul>
            <li> Mã vé | Ticket Code: ${ticketData.ticketCode || 'N/A'}</li>
            ${ticketData?.seat ? `<li>Số ghế | Seat Number: ${ticketData.seat}</li>` : ''}
            ${ticketData?.eventDate ? `<li>Thời gian | Time: ${ticketData?.eventDate || 'N/A'}</li>` : ''}
            <li>Địa điểm | Venue: Nhà hát Quân Đội – 140 Cộng Hòa, Phường 4, Quận Tân Bình, TP.HCM</li>
          </ul>
          <p>

          Trong lúc chờ đến ngày diễn ra chương trình, bạn có thể theo dõi những cập nhật mới nhất trên 
          <a href="https://www.facebook.com/orchestars" target="_blank">OrcheStars Fanpage</a>.<br />
          <em>
          In the meantime, feel free to check out the latest updates on our
            <a href="https://www.facebook.com/orchestars" target="_blank">OrcheStars Fanpage</a>.
          </em>
          </p>
        
          <p>Hẹn gặp bạn tại hòa nhạc ${ticketData.eventName}!<br />
          <em>See you at the ${ticketData.eventName} concert.</em></p>

          <p>Trân trọng,<br />
          <em>Best regards,</em></p>

          <p>OrcheStars </p>
        </div>
      </body>
    </html>
  `
}
