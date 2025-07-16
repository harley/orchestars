import { getAllCalendarLinks } from '@/utilities/calendarLinks'

export interface EventTicketData {
  eventName: string
  eventDate: string
  eventLocation: string
  ticketUrl: string
  eventStartTimeCalendar: string
  eventEndTimeCalendar: string
  orderCode: string
}

export function generateEventTicketEmailHtml(ticketData: EventTicketData) {
  // Generate calendar links
  const calendarLinks = getAllCalendarLinks({
    title: ticketData.eventName,
    description: `Your ticket for ${ticketData.eventName}. Ticket Url: ${ticketData.ticketUrl}`,
    location: ticketData.eventLocation,
    startTime: new Date(ticketData.eventStartTimeCalendar),
    endTime: new Date(ticketData.eventEndTimeCalendar),
    timezone: 'Asia/Ho_Chi_Minh',
  })

  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Ticket - ${ticketData.eventName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 30px 20px;
    }
    .order-card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 15px;
      padding: 25px;
      margin: 20px 0;
      color: white;
      box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
    }
    .order-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .order-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 10px 0;
    }
    .order-details {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    .order-info {
      flex: 1;
      min-width: 200px;
      text-align: center;
      width: 100%;
    }
    .order-info h3 {
      margin: 0 0 5px 0;
      font-size: 14px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .order-info p {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .qr-section {
      text-align: center;
      margin: 30px 0;
      padding: 25px;
      background-color: #f8f9fa;
      border-radius: 10px;
      border: 2px dashed #dee2e6;
    }
    .qr-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff !important;
      text-decoration: none;
      padding: 15px 30px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s ease;
    }
    .qr-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
    .calendar-section {
      background-color: #f8f9fa;
      border-radius: 10px;
      padding: 25px;
      margin: 25px 0;
    }
    .calendar-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 15px 0;
      color: #495057;
      text-align: center;
    }
    .calendar-buttons {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .calendar-btn {
      display: inline-block;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      border: 2px solid transparent;
    }
    .google-cal {
      background-color: #4285f4;
      color: #fff !important;
    }
    .google-cal:hover {
      background-color: #3367d6;
      transform: translateY(-1px);
    }
    .outlook-cal {
      background-color: #0078d4;
      color: white;
    }
    .outlook-cal:hover {
      background-color: #106ebe;
      transform: translateY(-1px);
    }
    .ical-cal {
      background-color: #6c757d;
      color: white;
    }
    .ical-cal:hover {
      background-color: #5a6268;
      transform: translateY(-1px);
    }
    .event-details {
      background-color: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 25px;
      margin: 25px 0;
    }
    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f1f3f4;
    }
    .detail-row:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .detail-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .detail-content h4 {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-content p {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #495057;
    }
    .footer {
      background-color: #343a40;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    @media (max-width: 600px) {
      .order-details {
        flex-direction: column;
        text-align: center;
      }
      .calendar-buttons {
        flex-direction: column;
        align-items: center;
      }
      .calendar-btn {
        width: 200px;
        text-align: center;
      }
      .detail-row {
        flex-direction: column;
        text-align: center;
      }
      .detail-icon {
        margin-right: 0;
        margin-bottom: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <p style="font-size: 18px; margin-bottom: 20px;">
        <strong>Xin chào Quý Khách,</strong><br />
        <em>Dear Valued Guest,</em>
      </p>

      <p style="margin-bottom: 25px;">
        <em>Chúng tôi rất vui mừng xác nhận vé của bạn cho <strong>${ticketData.eventName}</strong>! Vé điện tử của bạn đã sẵn sàng và bao gồm mọi thứ bạn cần để vào cửa.</em>
        <br /><br />
        We're excited to confirm your ticket for <strong>${ticketData.eventName}</strong>! Your digital ticket is ready and includes everything you need for entry.
      </p>

      <!-- Order Card -->
      <div class="order-card">
        <div class="order-header">
          <div class="order-title">${ticketData.eventName}</div>
        </div>
        <div class="order-details">
          <div class="order-info">
            <h3>Mã đơn hàng | Order Code</h3>
            <p>${ticketData.orderCode}</p>
          </div>
        </div>
      </div>

      <!-- Event Details -->
      <div class="event-details">
        <div class="detail-row">
          <div class="detail-icon">
            <span style="color: white; font-size: 18px;">📅</span>
          </div>
          <div class="detail-content">
            <h4>Ngày & Giờ | Date & Time</h4>
            <p>${ticketData.eventDate}</p>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">
            <span style="color: white; font-size: 18px;">📍</span>
          </div>
          <div class="detail-content">
            <h4>Địa điểm | Venue</h4>
            <p>${ticketData.eventLocation}</p>
          </div>
        </div>
      </div>

      <!-- Calendar Integration -->
      <div class="calendar-section">
        <h3 class="calendar-title">📅 Thêm vào Lịch | Add to Your Calendar</h3>
        <div class="calendar-buttons">
          <a href="${calendarLinks.google}" target="_blank" class="calendar-btn google-cal">
            📅 Google Calendar
          </a>
        </div>
      </div>

      <!-- QR Code Section -->
      <div class="qr-section">
        <h3 style="margin: 0 0 15px 0; color: #495057;">🔗 Xem Vé Điện Tử Của Bạn</h3>
        <p style="margin: 0 0 20px 0; color: #6c757d;">
          <em>Nhấp vào nút bên dưới để xem vé của bạn với mã QR để vào cửa</em>
          <br />Click the button below to view your ticket with QR code for entry
        </p>
        <a href="${ticketData.ticketUrl}" class="qr-button">
          📱 Xem Vé Của Tôi | View My Ticket
        </a>
      </div>

      <!-- Important Information -->
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Thông Tin Quan Trọng | Important Information</h4>
        <ul style="margin: 0; padding-left: 20px; color: #856404;">
          <li>Vui lòng đến trước 30 phút | Please arrive 30 minutes before the event starts</li>
          <li>Mang theo giấy tờ tùy thân hợp lệ | Bring a valid ID for verification</li>
          <li>Xuất trình mã QR vé điện tử tại lối vào | Show your digital ticket QR code at the entrance</li>
        </ul>
      </div>

      <p style="margin-top: 30px;">
        <em>Chúng tôi mong được gặp bạn tại <strong>${ticketData.eventName}</strong>!</em>
        <br />We look forward to seeing you at <strong>${ticketData.eventName}</strong>!
      </p>

      <p>Trân trọng,<br />
      <em>Best regards,</em></p>

      <p>OrcheStars</p>
    </div>
  </div>
</body>
</html>
  `
}
