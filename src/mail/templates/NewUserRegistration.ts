export const newUserRegistrationEmailHtml = ({ setupLink }: { setupLink: string }) => {
    return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Welcome to OrcheStars - Account Verification</title>
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
        <p><strong>Xin chào và chào mừng bạn đến với OrcheStars!</strong><br />
        <em>Hello and welcome to OrcheStars!</em></p>
  
        <p>
          Tài khoản của bạn đã được đăng ký thành công. Để xác minh tài khoản và bắt đầu sử dụng, bạn cần thiết lập mật khẩu cho tài khoản của mình.<br />
          <em>Your account has been successfully registered. To verify your account and get started, you need to set up a password for your account.</em>
        </p>
  
        <p>
          Vui lòng nhấp vào liên kết sau để thiết lập mật khẩu và xác minh tài khoản của bạn: 
          <a href="${setupLink}" target="_blank">THIẾT LẬP MẬT KHẨU & XÁC MINH</a>. Liên kết này sẽ hết hạn sau 1 giờ.<br />
          <em>Please click on the following link to set up your password and verify your account: 
          <a href="${setupLink}" target="_blank">SET UP PASSWORD & VERIFY</a>. This link will expire in 1 hour.</em>
        </p>
  
        <p>
          Sau khi xác minh, bạn sẽ có thể truy cập vào hệ thống OrcheStars và sử dụng các tính năng dành cho bạn.<br />
          <em>After verification, you will be able to access the OrcheStars system and use all available features.</em>
        </p>
  
        <p>
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.<br />
          <em>If you have any questions, please contact our support team.</em>
        </p>
  
        <p>Trân trọng,<br />
        <em>Best regards,</em></p>
  
        <p>OrcheStars</p>
      </div>
    </body>
  </html>
  `
  }
  