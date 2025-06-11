export const resetPasswordEmailHtml = ({ resetLink }: { resetLink: string }) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Reset Your Password</title>
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

      <p>
        Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.<br />
        <em>You are receiving this email because you (or someone else) have requested to reset the password for your account.</em>
      </p>

      <p>
        Vui lòng nhấp vào liên kết sau, hoặc dán vào trình duyệt của bạn để tiếp tục quá trình: 
        <a href="${resetLink}" target="_blank">TẠI ĐÂY</a>, liên kết này sẽ hết hạn sau 1 giờ.<br />
        <em>Please click on the following link, or paste it into your browser to complete the process: 
        <a href="${resetLink}" target="_blank">HERE</a>. This link will expire in 1 hour.</em>
      </p>

      <p>
        Nếu bạn không yêu cầu điều này, xin vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.<br />
        <em>If you did not request this, please ignore this email and your password will remain unchanged.</em>
      </p>

      <p>Trân trọng,<br />
      <em>Best regards,</em></p>

      <p>OrcheStars</p>
    </div>
  </body>
</html>`
}
