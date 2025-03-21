export interface CustomerInfo {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
}

export interface NewOrderItem {
  price: number
  quantity: number
  seat?: string
  eventId: number
  ticketPriceId: string
  eventScheduleId: string
}

export interface NewInputOrder {
  currency: string
  orderItems: NewOrderItem[]
  promotionCode?: string
}

export interface BankTransferTransaction {
  code: string
}
