export type Ticket = {
    id: string
    attendeeName: string
    email: string
    event: any
    eventDate: string
    phoneNumber: string
    ticketCode: string
    seat: string
    status: string
    ticketPriceInfo?: any
    isCheckedIn?: boolean
    checkinRecord?: any
}