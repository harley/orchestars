export const getZalopayCallbackErrorHtml = ({
  timestamp,
  source,
  errorMessage,
  payload,
}: {
  timestamp: string
  source: string
  errorMessage: string
  payload: string
}) => {
  return `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>[ALERT] OrcheStars Payment Callback Failed</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #000;
        background-color: #f9f9f9;
        margin: 0;
        padding: 20px;
      }

      .container {
        max-width: 700px;
        margin: 0 auto;
        padding: 24px;
        background-color: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
      }

      h2 {
        color: #d32f2f;
        margin-bottom: 16px;
      }

      .alert {
        background-color: #ffe9e9;
        color: #b30000;
        padding: 12px 16px;
        border-left: 5px solid #d32f2f;
        border-radius: 4px;
        font-weight: bold;
        margin-bottom: 24px;
      }

      .section {
        margin-top: 20px;
      }

      .log-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
        margin-top: 10px;
      }

      .log-table th,
      .log-table td {
        padding: 10px;
        border: 1px solid #ccc;
        text-align: left;
        vertical-align: top;
      }

      pre {
        white-space: pre-wrap;
        background-color: #f1f1f1;
        padding: 10px;
        border-radius: 4px;
        font-size: 13px;
        overflow-x: auto;
      }

      .footer {
        margin-top: 32px;
        font-size: 13px;
        color: #777;
      }

      .logo {
        text-align: center;
        margin-bottom: 24px;
      }

      .logo img {
        max-height: 50px;
      }

      strong {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <img src="https://www.orchestars.vn/logos/logo-black-wide.png" alt="OrcheStars Logo" />
      </div>

      <h2>⚠️ PAYMENT CALLBACK ERROR DETECTED</h2>

      <div class="alert">
        🚨 A critical payment callback has failed. Immediate admin review required!
      </div>

      <p><strong>Xin chào Quản trị viên,</strong><br />
      <em>Hello Admin,</em></p>

      <p>
        Một lỗi nghiêm trọng đã xảy ra trong quá trình xử lý thanh toán qua callback. Vui lòng kiểm tra chi tiết lỗi bên dưới và xử lý càng sớm càng tốt.<br />
        <em>A critical error occurred during the payment callback process. Please review the details below and investigate immediately.</em>
      </p>

      <div class="section">
        <strong>🧾 Chi tiết lỗi / Error Details:</strong>
        <table class="log-table">
          <tr>
            <th>⏱️ Thời gian / Timestamp</th>
            <td>${timestamp}</td>
          </tr>
          <tr>
            <th>📌 Nguồn / Source</th>
            <td>${source}</td>
          </tr>
          <tr>
            <th>❗ Thông báo lỗi / Error Message</th>
            <td>${errorMessage}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <strong>📦 Dữ liệu callback nhận được / Received Payload:</strong>
        <pre>${payload}</pre>
      </div>

      <p>
        Nếu thanh toán không được ghi nhận đúng, vui lòng xác minh trạng thái từ hệ thống thanh toán và cập nhật thủ công nếu cần.<br />
        <em>If the payment was not recorded correctly, please verify with the payment provider and take corrective action.</em>
      </p>

      <div class="footer">
        Email này được gửi tự động từ hệ thống OrcheStars.<br />
        <em>This is an automated message from the OrcheStars system.</em>
      </div>
    </div>
  </body>
</html>

`
}
