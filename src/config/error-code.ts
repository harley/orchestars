export const PROMOTION_ERROR_CODE = {
  PROMO001: 'Mã giảm giá không được để trống',
  PROMO002: 'Mã giảm giá không hợp lệ',
  PROMO003: 'Mã giảm giá đã hết lượt sử dụng',
  PROMO004: 'Không thể dùng mã giảm giá trước thời gian quy định',
  PROMO005: 'Mã giảm giá đã hết hạn',
  PROMO006: 'Chưa thoả mãn số lượng vé tối thiểu để áp dụng mã giảm giá',
  PROMO007: 'Bạn đã dùng hết số lượt được áp dụng cho giảm giá {{promotionCode}} này',
  PROMO008: 'Chưa thoả mãn số lượng vé tối thiểu để áp dụng mã giảm giá {{promotionCode}}',
}

export const EVENT_ERROR_CODE = {
  EVT001: 'Sự kiện không được để trống',
  EVT002: 'Sự kiện không tồn tại',
  EVT003: 'Sự kiện chưa được mở bán',
  EVT004: 'Sự kiện đã đóng bán',
  EVT005: 'Sự kiện đã bị hủy',
  EVT006: 'Ngày tham gia sự kiện không được để trống',
  EVT007: 'Ngày tham dự sự kiện {{eventTitle}} không đúng',
  EVT008: 'Event ID không được để trống',
  EVT009: 'Event schedule ID không được để trống',
}

export const SEAT_ERROR_CODE = {
  SEAT001: 'Ghế không được để trống',
  SEAT002: 'Ghế {{seats}} đang được giữ bởi người khác! Vui lòng chọn ghế khác',
  SEAT003: 'Ghế {{seats}} hiện đã được đặt. Vui lòng chọn ghế khác.',
  SEAT004: 'Phiên chữ chỗ đã hết hạn! Vui lòng chọn lại ghế và thực hiện lại',
  SEAT005: 'Ghế {{seat}} bị lặp! Vui lòng kiểm tra lại',
}

export const TICKET_ERROR_CODE = {
  TICK001: 'Loại vé không được để trống',
  TICK002: 'Tên loại vé không được để trống',
  TICK003: 'Số lượng vé phải là số nguyên dương',
  TICK004: 'Loại vé không tồn tại',
  TICK005: 'Vé {{ticketClass}} hiện đã được đặt hết! Vui lòng chọn vé khác.',
  TICK006:
    'Vé {{ticketClass}} hiện chỉ còn tối đa {{remaining}} vé!. Vui lòng nhập lại số lượng mua',
  TICK007: 'Loại vé không tồn tại cho sự kiện {{eventTitle}}',
  TICK008:
    'Ghế hạng vé {{ticketClass}} cho ngày đã chọn đã được đặt hết! Vui lòng chọn chỗ ngồi hạng vé khác',
  TICK009:
    'Ghế hạng vé {{ticketClass}} cho ngày đã chọn chỉ còn tối đa {{remaining}} vé! Vui lòng chọn lại',
  TICK010: 'Ticket Price ID không được để trống',
}

export const BOOKING_ERROR_CODE = {
  BOOK001: 'Invalid booking type',
}

export const SYSTEM_ERROR_CODE = {
  SYS001: 'Có lỗi xảy ra! Vui lòng thử lại',
}

export const ORDER_ERROR_CODE = {
  ORD001: 'Danh mục đơn hàng không được để trống',
  ORD002: 'Đơn hàng không tồn tại',
  ORD003: 'Đơn hàng đã được thanh toán',
  ORD004: 'Đơn hàng đã hết hạn thanh toán',
  ORD005: 'Vui lòng chọn ghế và thực hiện lại thao tác',
}

export const CHECKIN_ERROR_CODE = {
  CHECKIN001: 'Ticket not found',
  CHECKIN004: 'Failed to create checkin record',
  CHECKIN005: 'Unauthorized',
  CHECKIN013: 'Ticket code missing',
}

export const ERROR_CODES = {
  ...PROMOTION_ERROR_CODE,
  ...EVENT_ERROR_CODE,
  ...SEAT_ERROR_CODE,
  ...TICKET_ERROR_CODE,
  ...BOOKING_ERROR_CODE,
  ...SYSTEM_ERROR_CODE,
  ...ORDER_ERROR_CODE,
  ...CHECKIN_ERROR_CODE,
}
