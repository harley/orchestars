export const affiliateRegistrationEmailHtml = ({ contactEmail }: { contactEmail: string }) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Affiliate Registration Confirmation</title>
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
        <p><strong>Xin chào Đối Tác,</strong><br />
        <em>Dear Affiliate Partner,</em></p>
  
        <p>
          Cảm ơn bạn đã đăng ký tham gia chương trình Đối Tác Affiliate của chúng tôi!<br />
          <em>Thank you for registering to join our Affiliate Partner program!</em>
        </p>
  
        <p>
          Tài khoản affiliate của bạn hiện đang ở trạng thái <strong>Đang chờ phê duyệt</strong>. 
          Chúng tôi sẽ xem xét đơn đăng ký của bạn và thông báo kết quả trong thời gian sớm nhất.<br />
          <em>Your affiliate account is currently in <strong>Pending</strong> status. 
          We will review your application and notify you of the outcome as soon as possible.</em>
        </p>
  
        ${
          contactEmail
            ? ` <p>
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi qua 
          <a href="mailto:${contactEmail}">${contactEmail}</a>.<br />
          <em>If you have any questions, please contact our support team at 
          <a href="mailto:${contactEmail}">${contactEmail}</a>.</em>
        </p>`
            : ''
        }
       
  
        <p>Trân trọng,<br />
        <em>Best regards,</em></p>
  
        <p>OrcheStars</p>
      </div>
    </body>
  </html>
  `
}
