'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/CheckIn/useAuth';

import { Clock3, CheckCircle, XCircle } from 'lucide-react';

export default function ValidatePage() {
  const [ticketCode, setTicketCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [multipleTickets, setMultipleTickets] = useState<any[]>([]);
  const router = useRouter();
  const { token } = useAuth();
  const searchParams = useSearchParams();

  const eventId = searchParams?.get('eventId');
  const scheduleId = searchParams?.get('scheduleId');
  const eventLocation = searchParams?.get('eventLocation');
  const eventTitle = searchParams?.get('eventTitle');
  const scheduleDate = (searchParams?.get('eventScheduleDate') || '').split('T')[0];

  const handleCheckIn = async () => {
    if (!ticketCode.trim()) {
      alert('Please enter a ticket code');
      return;
    }
    if (!token) {
      alert('Please login first');
      router.push('/checkin');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/checkin-app/validate/${ticketCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ eventId, eventScheduleId: scheduleId }),
      });
      const data = await response.json();
      if (response.status === 300 && data.tickets) {
        setMultipleTickets(data.tickets);
        return;
      }
      if (response.status === 409 && data.ticket && data.checkinRecord) {
        const encodedTicket = encodeURIComponent(JSON.stringify({
          code: data.ticket.ticketCode,
          attendeeName: data.ticket.attendeeName,
          eventName: eventTitle,
          eventTime: scheduleDate,
          seat: data.ticket.seat,
        }));

        const encodedCheckinRecord = encodeURIComponent(JSON.stringify(data.checkinRecord));
        router.push(`/checkin/ticket-details?ticket=${encodedTicket}&checkinRecord=${encodedCheckinRecord}`);
        return;
      }
      if (response.status === 404) {
        alert(data.error || 'Ticket not found');
        return;
      }

      const encodedTicket = encodeURIComponent(JSON.stringify({
        code: data.ticket.ticketCode,
        attendeeName: data.ticket.attendeeName,
        eventName: eventTitle,
        eventTime: scheduleDate,
        seat: data.ticket.seat,
      }));

      router.push(`/checkin/ticket-details?ticket=${encodedTicket}`);
    } catch (error: any) {
      alert(error.message || 'Failed to check in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTicket = (ticket: any) => {
    const encodedTicket = encodeURIComponent(JSON.stringify({
      code: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
      eventName: eventTitle,
      eventLocation: eventLocation,
      eventTime: scheduleDate,
      seat: ticket.seat,
    }));

    const params: any = { ticket: encodedTicket };
    if (ticket.isCheckedIn && ticket.checkinRecord) {
      params.checkinRecord = encodeURIComponent(JSON.stringify(ticket.checkinRecord));
    }
    const query = new URLSearchParams(params).toString();
    router.push(`/checkin/ticket-details?${query}`);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
    <div className="max-w-xl mx-auto">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="Enter ticket code"
        value={ticketCode}
        onChange={(e) => setTicketCode(e.target.value)}
      />

      <button
        onClick={handleCheckIn}
        disabled={isLoading}
        className={`w-full py-3 rounded-lg text-white font-semibold ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        {isLoading ? 'Validating...' : 'Validate Ticket'}
      </button>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => router.push('/history')}
          className="flex items-center gap-1 text-orange-600 hover:underline"
        >
          <Clock3 size={16} /> View History
        </button>
      </div>

      {multipleTickets.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3">Multiple Tickets Found</h2>
          <div className="space-y-4">
            {multipleTickets.map((ticket, index) => (
              <div
                key={`ticket-${ticket.ticketCode}-${index}`}
                className={`border-l-4 rounded-lg p-4 shadow-sm cursor-pointer ${
                  ticket.isCheckedIn ? 'bg-red-100 border-red-600' : 'bg-green-100 border-green-600'
                }`}
                onClick={() => handleSelectTicket(ticket)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">{ticket.ticketCode}</span>
                  <span className={`flex items-center gap-1 text-white text-sm px-2 py-1 rounded-full ${
                    ticket.isCheckedIn ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {ticket.isCheckedIn ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    {ticket.isCheckedIn ? 'Used' : 'Valid'}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <p><strong>Event:</strong> {eventTitle} — {eventLocation}</p>
                  <p><strong>Schedule:</strong> {scheduleDate}</p>
                  <p><strong>Seat:</strong> {ticket.seat || 'N/A'}</p>
                  {ticket.isCheckedIn && ticket.checkinRecord && (
                    <p><strong>Checked in:</strong> {ticket.checkinRecord.checkInTime.split('T')[0]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
