export interface TicketData {
  ticketCode?: string
  seat?: string
  eventName: string
  eventDate?: string
  eventLocation?: string
}

// todo
// using dynamic template set on Admin Panel instead of this static template
export function generateTicketDisneyEventBookEmailHtml(ticketData: TicketData) {
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
          <p>
            <strong>Xin chào Quý Khách,</strong><br />
            <em>Dear Valued Guest,</em>
          </p>

          <p>
            OrcheStars xin gửi đến bạn vé điện tử tham dự chương trình hòa nhạc <strong>${ticketData.eventName}</strong> – đêm nhạc đưa bạn bước vào thế giới cổ tích đầy màu nhiệm của DISNEY.<br />
            <em>Thank you for your successful booking to <strong>${ticketData.eventName}</strong> – a magical symphonic journey through Disney’s beloved classics.</em>
          </p>

          <p>
            Khi đến tham dự, quý vị vui lòng mang theo ảnh chụp hoặc bản in email này để check-in.<br />
            <em>When attending, please bring a screenshot or a printed copy of this email for check-in.</em>
          </p>

          <p>
            <strong>Thông tin vé của bạn:</strong><br />
            <em>Your Booking Details:</em>
          </p>
          <ul>
            <li> Mã vé | Ticket Code: ${ticketData.ticketCode || 'N/A'}</li>
            ${ticketData?.seat ? `<li>Số ghế | Seat Number: ${ticketData.seat}</li>` : ''}
            ${ticketData?.eventDate ? `<li>Thời gian | Time: ${ticketData?.eventDate || 'N/A'}</li>` : ''}
            <li>Địa điểm | Venue: ${ticketData.eventLocation || 'N/A'}</li>
          </ul>
          <p>
            Trong thời gian chờ đến ngày diễn ra chương trình, bạn có thể theo dõi các thông tin mới nhất tại <a href="https://www.facebook.com/orchestars" target="_blank">Fanpage chính thức của OrcheStars</a>.<br />
            <em>
              In the meantime, feel free to stay updated through our official <a href="https://www.facebook.com/orchestars" target="_blank">OrcheStars Fanpage</a>.
            </em>
          </p>
          
          <br />
          <p>
            <strong>Điều khoản và điều kiện:</strong><br />
            <em>Terms and Conditions:</em>
          </p>

          <p>
            Vé này được đảm bảo có giá trị check-in tại sự kiện <strong>OrcheStars: ${ticketData.eventName}</strong><br />
            <em>This ticket is guaranteed to be valid for check-in at the event <strong>OrcheStars: ${ticketData.eventName}</strong></em>
          </p>
          
          <p>
            Khách tham dự phải xuất trình vé ở khu vực check-in để tham gia sự kiện.<br />
            <em>Attendees must present their ticket at the check-in area to participate in the event.</em>
          </p>
         
          <p>
            Khách tham dự chịu trách nhiệm bảo mật thông tin mã vé.<br />
            <em>Attendees are responsible for keeping their ticket code confidential.</em>
          </p>

          <p>
            Trong mọi trường hợp, quyết định của Ban Tổ Chức là quyết định cuối cùng.<br />
            <em>In all cases, the decision of the Organizing Committee is final.</em>
          </p>
          
          <p>
            Chúng tôi rất mong được gặp bạn tại đêm hòa nhạc!<br />
            <em>We look forward to seeing you at the concert!</em>
          </p>

          <p>Trân trọng,<br />
          <em>Best regards,</em></p>

          <p>OrcheStars </p>
        </div>
      </body>
    </html>
  `
}
