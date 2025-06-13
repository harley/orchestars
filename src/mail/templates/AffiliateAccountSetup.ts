export const affiliateAccountSetupEmailHtml = ({ setupLink }: { setupLink: string }) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to OrcheStars Affiliate Program</title>
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
      <p><strong>Xin chào và chào mừng bạn đến với chương trình đối tác OrcheStars!</strong><br />
      <em>Hello and welcome to the OrcheStars Affiliate Program!</em></p>

      <p>
        Tài khoản đối tác của bạn đã được tạo thành công. Để bắt đầu sử dụng, bạn cần thiết lập mật khẩu cho tài khoản của mình.<br />
        <em>Your affiliate account has been successfully created. To get started, you need to set up a password for your account.</em>
      </p>

      <p>
        Vui lòng nhấp vào liên kết sau để thiết lập mật khẩu của bạn: 
        <a href="${setupLink}" target="_blank">THIẾT LẬP MẬT KHẨU</a>. Liên kết này sẽ hết hạn sau 1 giờ.<br />
        <em>Please click on the following link to set up your password: 
        <a href="${setupLink}" target="_blank">SET UP PASSWORD</a>. This link will expire in 1 hour.</em>
      </p>

      <p>
        Sau khi thiết lập mật khẩu, bạn sẽ có thể truy cập vào bảng điều khiển đối tác để quản lý các liên kết và theo dõi hiệu suất của mình.<br />
        <em>After setting up your password, you will be able to access the affiliate dashboard to manage your links and track your performance.</em>
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
