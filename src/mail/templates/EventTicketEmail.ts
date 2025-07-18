import { getAllCalendarLinks } from '@/utilities/calendarLinks'

export interface EventTicketData {
  eventName: string
  eventDate: string
  eventLocation: string
  ticketUrl: string
  eventStartTimeCalendar: string
  eventEndTimeCalendar: string
  orderCode: string
  guidelineUrl?: string
  zoneMapUrl?: string
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
  <title>🎟️ Vé Điện Tử | Digital Ticket – ${ticketData.eventName}</title>
  <style>
    /* Gmail-compatible email styles */
    body {
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    /* Container styles */
    .container {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      box-sizing: border-box;
    }
    
    /* Header styles */
    .header {
      background: #ffffff;
      color: #23272f;
      padding: 30px 20px 25px 20px;
      text-align: center;
      border-bottom: 1px solid #e9ecef;
    }
    
    .header h1 {
      margin: 0 0 15px 0;
      font-size: 24px;
      font-weight: bold;
      color: #23272f;
      line-height: 1.2;
    }
    
    .header .event-name {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #23272f;
      line-height: 1.3;
    }
    
    .header .greeting {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      color: #23272f;
    }
    
    .header .greeting .en {
      font-style: italic;
      color: #555555;
      font-size: 14px;
      display: block;
      margin-top: 2px;
    }
    
    .header .intro {
      margin: 15px 0 0 0;
      font-size: 15px;
      color: #23272f;
      font-weight: normal;
      line-height: 1.5;
    }
    
    .header .intro .en {
      font-style: italic;
      color: #555555;
      font-size: 14px;
      display: block;
      margin-top: 2px;
    }
    
    /* Section styles */
    .section {
      padding: 25px 20px 20px 20px;
      border-bottom: 1px solid #f1f3f4;
    }
    
    .section:last-child {
      border-bottom: none;
    }
    
    /* QR Section styles */
    .qr-section {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 24px 20px;
      margin: 25px 0 20px 0;
      text-align: center;
    }
    
    .qr-title {
      font-size: 16px;
      font-weight: bold;
      color: #23272f;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }
    
    .qr-subtitle {
      font-size: 13px;
      color: #666666;
      font-style: italic;
      margin: 0 0 20px 0;
      line-height: 1.4;
    }
    
    .qr-btn {
      display: inline-block;
      background: #667eea;
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 15px;
      margin: 0;
      min-width: 280px;
      max-width: 100%;
      box-sizing: border-box;
      border: none;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.3;
    }
    
    /* Info card styles */
    .info-cards {
      margin: 20px 0 0 0;
    }
    
    .info-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px 18px;
      margin-bottom: 12px;
      display: block;
    }
    
    .info-card:last-child {
      margin-bottom: 0;
    }
    
    .info-label {
      color: #6c757d;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 0.5px;
      line-height: 1.2;
      margin-bottom: 4px;
      display: block;
    }
    
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #23272f;
      line-height: 1.4;
      display: block;
    }
    
    /* Bilingual row styles */
    .bilingual-row {
      margin-bottom: 12px;
    }
    
    .bilingual-row .vn {
      font-size: 14px;
      font-weight: 500;
      display: block;
      margin-bottom: 2px;
    }
    
    .bilingual-row .en {
      color: #666666;
      font-style: italic;
      font-size: 13px;
      display: block;
    }
    
    /* Zone map styles */
    .zone-map {
      text-align: center;
      margin: 20px 0 0 0;
      padding: 20px 0 0 0;
      border-top: 1px dashed #e9ecef;
    }
    
    .zone-map-image {
      max-width: 100%;
      height: auto;
      border: 1px solid #e9ecef;
      margin: 0 auto;
      display: block;
    }
    
    .zone-map-container {
      text-align: center;
      margin: 15px 0 0 0;
    }
    
    /* Calendar section styles */
    .calendar-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px 15px;
      margin: 20px 0 0 0;
      text-align: center;
    }
    
    .calendar-btn {
      display: inline-block;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      background: #4285f4;
      color: #ffffff !important;
      margin: 8px 0 0 0;
    }
    
    /* Reminders styles */
    .reminders {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      padding: 18px 18px 10px 18px;
      margin: 20px 0 0 0;
      color: #856404;
      font-size: 14px;
    }
    
    .reminders ul {
      margin: 0 0 0 18px;
      padding: 0;
    }
    
    .reminders li {
      margin-bottom: 8px;
    }
    
    /* Guidelines styles */
    .guidelines {
      text-align: center;
      margin: 20px 0 0 0;
    }
    
    .guidelines-link {
      display: inline-block;
      background: #f5576c;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 14px;
      margin: 10px 0 0 0;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.3;
      text-align: center;
    }
    
    /* Mobile responsive styles */
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
        width: 100% !important;
      }
      
      .header {
        padding: 20px 15px 15px 15px;
      }
      
      .header h1 {
        font-size: 20px;
      }
      
      .header .event-name {
        font-size: 16px;
        margin-bottom: 10px;
      }
      
      .header .intro {
        font-size: 14px;
      }
      
      .header .greeting {
        font-size: 14px;
      }
      
      .section {
        padding: 20px 15px 15px 15px;
      }
      
      .qr-section {
        padding: 20px 16px;
        margin: 20px 0 15px 0;
        border-radius: 8px;
      }
      
      .qr-title {
        font-size: 15px;
        margin-bottom: 6px;
      }
      
      .qr-subtitle {
        font-size: 12px;
        margin-bottom: 16px;
      }
      
      .qr-btn {
        display: block;
        width: 100%;
        min-width: 0;
        padding: 14px 12px;
        font-size: 13px;
        border-radius: 6px;
        margin: 0;
        box-sizing: border-box;
        word-wrap: break-word;
        white-space: normal;
        line-height: 1.4;
        text-align: center;
      }
      
      .info-cards {
        margin: 15px 0 0 0;
      }
      
      .info-card {
        padding: 14px 16px;
        margin-bottom: 10px;
        border-radius: 6px;
      }
      
      .info-label {
        font-size: 12px;
        margin-bottom: 3px;
      }
      
      .info-value {
        font-size: 15px;
        font-weight: 700;
      }
      
      .bilingual-row .vn {
        font-size: 13px;
      }
      
      .bilingual-row .en {
        font-size: 12px;
      }
      
      .zone-map-image {
        max-width: 100%;
        border-radius: 6px;
      }
      
      .zone-map-container {
        margin: 10px 0 0 0;
      }
      
      .calendar-section {
        padding: 15px 10px;
        margin: 15px 0 0 0;
      }
      
      .reminders {
        padding: 15px 15px 8px 15px;
        margin: 15px 0 0 0;
        font-size: 13px;
      }
      
      .guidelines-link {
        padding: 12px 16px;
        font-size: 12px;
        word-wrap: break-word;
        white-space: normal;
        line-height: 1.4;
        text-align: center;
        border-radius: 20px;
      }
    }
    
    /* Gmail specific fixes */
    .gmail-fix {
      display: none;
      display: none !important;
    }
    
    /* Email client compatibility */
    * {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    /* Prevent text scaling on mobile */
    * {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    .qr-title-en {
      display: inline;
    }
    @media only screen and (max-width: 600px) {
      .qr-title-en {
        display: block;
        margin-top: 2px;
      }
    }
    
    /* QR button text responsive */
    .qr-btn-text-full {
      display: inline;
    }
    .qr-btn-text-compact {
      display: none;
    }
    @media only screen and (max-width: 480px) {
      .qr-btn-text-full {
        display: none;
      }
      .qr-btn-text-compact {
        display: inline;
      }
    }
    
    /* Guidelines button text responsive */
    .guidelines-text-full {
      display: inline;
    }
    .guidelines-text-compact {
      display: none;
    }
    @media only screen and (max-width: 480px) {
      .guidelines-text-full {
        display: none;
      }
      .guidelines-text-compact {
        display: inline;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎟️ [QR Code] Vé Điện Tử | Digital Ticket</h1>
      <div class="event-name">${ticketData.eventName} by OrcheStars</div>
      <div class="greeting">
        <span class="vn">Xin chào Quý Khách,</span>
        <span class="en">Dear Valued Guest,</span>
      </div>
      <div class="intro">
        <span class="vn">Tấm vé điện tử có Mã <b>QR Code</b> để bước vào thế giới cổ tích <strong>${ticketData.eventName}</strong> của bạn đã sẵn sàng!</span>
        <span class="en">Your digital ticket with QR Code to the magical world of <strong>${ticketData.eventName}</strong> is ready!</span>
      </div>
    </div>

    <div class="qr-section">
      <div class="qr-title">
        ✨ <span class="qr-title-vn">MÃ QR CỦA BẠN</span> <span class="qr-title-en">YOUR QR CODE TICKET</span>
      </div>
      <div class="qr-subtitle">You’ll use your QR code on the e-ticket to check in at the entrance.</div>
      <a href="${ticketData.ticketUrl}" class="qr-btn">
        <span class="qr-btn-text-full">📱 Xem Mã QR Của Tôi | View My QR Code Ticket</span>
        <span class="qr-btn-text-compact">📱 Xem QR Code | View QR</span>
      </a>
    </div>
    <div class="info-cards">
        <div class="info-card">
          <span class="info-label">Mã đơn hàng | Order Code</span>
          <span class="info-value">${ticketData.orderCode}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Thời gian sự kiện | Show-time</span>
          <span class="info-value">${ticketData.eventDate}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Địa điểm | Venue</span>
          <span class="info-value">${ticketData.eventLocation}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="bilingual-row">
        <span class="vn">🕔 <b>THỜI GIAN MỞ CỬA CHO CÁC HOẠT ĐỘNG VUI CHƠI, ẨM THỰC & GIẢI KHÁT:</b> lúc 4:00 PM</span>
        <span class="en">TIME FOR PRE-CONCERT ACTIVITIES (F&B): from <b>4:00 PM</b></span>
      </div>
      <div class="bilingual-row">
        <span class="vn">🕔 <b>THỜI GIAN BẮT ĐẦU CHECK-IN VÀO SÂN KHẤU:</b> từ <b>5:15 PM đến 6:30 PM</b></span>
        <span class="en">TIME FOR CHECK-IN: from <b>5:15 PM to 6:30 PM</b></span>
      </div>
      <div class="bilingual-row">
        <span class="vn">Sau <b>6:50 PM</b> (20 phút sau giờ diễn), BTC sẽ <b>ngừng tiếp nhận check-in</b>. Vui lòng đến sớm ít nhất 30 phút để check-in và tìm chỗ ngồi.</span>
        <span class="en">After <b>6:50 PM</b> (20 minutes after the show starts), <b>check-in will be closed.</b> Please arrive at least 30 minutes early to check in and find your seat.</span>
      </div>
    </div>

    ${
      ticketData.zoneMapUrl
        ? `
    <div class="section">
      <div class="bilingual-row">
        <span class="vn">SƠ ĐỒ KHU VỰC SỰ KIỆN | CONCERT ZONE MAP</span>
        <span class="en">(See your seat/zone map below)</span>
      </div>
      <div class="zone-map">
        <div class="zone-map-container">
          <img src="${ticketData.zoneMapUrl}" alt="Concert Zone Map - Disney 25 Event" class="zone-map-image" />
        </div>
      </div>
    </div>
    `
        : ''
    }

    <div class="calendar-section">
      <div class="bilingual-row">
        <span class="vn">📅 <b>Thêm vào Lịch</b></span>
        <span class="en">Add to Your Calendar</span>
      </div>
      <a href="${calendarLinks.google}" target="_blank" class="calendar-btn">📅 Google Calendar</a>
    </div>

    <div class="reminders">
      <div class="bilingual-row">
        <span class="vn">⚠️ <b>THÔNG TIN QUAN TRỌNG | IMPORTANT REMINDERS</b></span>
        <span class="en"></span>
      </div>
      <ul>
        <li>🎟 Vé điện tử có Mã QR Code chỉ dùng một lần duy nhất.<br><em>Your QR Code ticket is valid for one-time use only.</em></li>
        <li>📲 Không chia sẻ Mã QR để tránh mất quyền vào cổng.<br><em>Do not share your QR code to avoid entry issues.</em></li>
        <li>🪪 Mang theo giấy tờ tùy thân (CMND/CCCD/hộ chiếu) để đối chiếu khi cần thiết. Đặc biệt trẻ em dưới 3 tuổi, phụ huynh cần giấy tờ chứng minh độ tuổi của bé.<br><em>Bring a valid ID (passport or government-issued) for verification just in case. Especially for children under 3 years old, parents are required to provide documents to verify the child's age.</em></li>
        <li>Quyết định của BTC là quyết định cuối cùng trong mọi trường hợp.<br><em>In all cases, the Organizer’s decision shall be considered final.</em></li>
      </ul>
    </div>

    ${
      ticketData.guidelineUrl
        ? ` <div class="guidelines">
      <div class="bilingual-row">
        <span class="vn">⚠️ <b>QUY ĐỊNH CHI TIẾT XIN VUI LÒNG XEM TẠI LINK:</b></span>
        <span class="en">⚠️ <b>FOR FULL EVENT GUIDELINES, PLEASE VISIT:</b></span>
      </div>
      <a href="${ticketData.guidelineUrl}" class="guidelines-link">
        <span class="guidelines-text-full">Xem Quy Định Sự Kiện | View Event Guidelines</span>
        <span class="guidelines-text-compact">Xem Quy Định | Guidelines</span>
      </a>
    </div>`
        : ''
    }

   

    <div class="section" style="text-align:center;">
      <div class="bilingual-row">
        <span class="vn">Chúng tôi rất mong được gặp bạn tại đêm nhạc cổ tích <strong>${ticketData.eventName}</strong>.</span>
        <span class="en">We can’t wait to see you at this enchanted musical night – <strong>${ticketData.eventName}</strong>.</span>
      </div>
      <div style="margin-top: 18px; font-weight: 600;">OrcheStars Team</div>
    </div>
  </div>
</body>
</html>
  `
}
