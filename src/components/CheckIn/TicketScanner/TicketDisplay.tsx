// Enhanced ticket display component

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { formatLocalizedDate } from '@/utilities/formatLocalizedDate'
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Clock, 
  Ticket, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import type { ValidatedTicket } from '@/types/TicketScanning'

interface TicketDisplayProps {
  ticket: ValidatedTicket
  onCheckin: () => void
  onRescan: () => void
  isCheckingIn: boolean
  className?: string
}

export const TicketDisplay: React.FC<TicketDisplayProps> = ({
  ticket,
  onCheckin,
  onRescan,
  isCheckingIn,
  className
}) => {
  const getStatusBadge = () => {
    if (ticket.isCheckedIn) {
      return (
        <Badge className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white">
          <CheckCircle className="w-4 h-4 mr-1" />
          Đã check-in
        </Badge>
      )
    }

    switch (ticket.status) {
      case 'booked':
        return (
          <Badge className="text-sm px-3 py-1 bg-green-500 text-white hover:bg-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            Sẵn sàng check-in
          </Badge>
        )
      case 'pending_payment':
        return (
          <Badge className="text-sm px-3 py-1 bg-yellow-500 text-white hover:bg-yellow-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            Chờ thanh toán
          </Badge>
        )
      case 'hold':
        return (
          <Badge className="text-sm px-3 py-1 bg-blue-500 text-white hover:bg-blue-600">
            <Clock className="w-4 h-4 mr-1" />
            Đang giữ chỗ
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="text-sm px-3 py-1 bg-gray-500 text-white hover:bg-gray-600">
            <XCircle className="w-4 h-4 mr-1" />
            Đã hủy
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-sm px-3 py-1">
            {(ticket.status as string).toUpperCase()}
          </Badge>
        )
    }
  }

  const canCheckin = ticket.status === 'booked' && !ticket.isCheckedIn

  return (
    <div className={cn('w-full mt-4', className)}>
      <Card className={cn(
        'transition-all duration-300 shadow-lg',
        ticket.isCheckedIn 
          ? 'bg-green-50 border-green-200' 
          : canCheckin 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-yellow-50 border-yellow-200'
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-600" />
              <span>Thông tin vé</span>
            </div>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Customer Information */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Tên khách hàng</p>
                <p className="font-semibold text-gray-900">
                  {ticket.user?.firstName} {ticket.user?.lastName}
                </p>
              </div>
            </div>

            {ticket.user?.email && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900 break-all">
                    {ticket.user.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Details */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Ticket className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Mã vé</p>
                <p className="font-mono font-bold text-lg text-blue-600">
                  {ticket.ticketCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Ghế</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {ticket.seat}
                </p>
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Sự kiện</p>
                <p className="font-semibold text-gray-900">
                  {ticket.eventTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Thời gian</p>
                <div className="flex flex-col gap-1">
                  {ticket.eventStartDatetime && ticket.eventEndDatetime && (
                    <p className="font-semibold text-gray-900">
                      {formatLocalizedDate(ticket.eventStartDatetime, { format: 'HH:mm' })} -{' '}
                      {formatLocalizedDate(ticket.eventEndDatetime, { format: 'HH:mm' })}
                    </p>
                  )}
                  {ticket.eventDate && (
                    <p className="text-gray-700">
                      {formatLocalizedDate(ticket.eventDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1 border-blue-400 text-blue-700 hover:bg-blue-50"
              onClick={onRescan}
              disabled={isCheckingIn}
            >
              {ticket.isCheckedIn ? 'Quét vé mới' : 'Quét lại'}
            </Button>
            
            <Button
              className={cn(
                'flex-1 px-6 py-2 font-semibold transition-all duration-200',
                canCheckin
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              )}
              onClick={onCheckin}
              disabled={!canCheckin || isCheckingIn}
            >
              {isCheckingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang check-in...
                </>
              ) : ticket.isCheckedIn ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Đã check-in
                </>
              ) : canCheckin ? (
                'Xác nhận check-in'
              ) : (
                'Không thể check-in'
              )}
            </Button>
          </div>

          {/* Additional Info */}
          {ticket.isCheckedIn && ticket.checkinRecord && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Đã check-in lúc:{' '}
                {ticket.checkinRecord.checkInTime && 
                  formatLocalizedDate(ticket.checkinRecord.checkInTime, { 
                    format: 'dd/MM/yyyy HH:mm' 
                  })
                }
              </p>
              {ticket.checkinRecord.checkedInBy && (
                <p className="text-sm text-green-700 mt-1">
                  Được check-in bởi: {ticket.checkinRecord.checkedInBy.email}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TicketDisplay
