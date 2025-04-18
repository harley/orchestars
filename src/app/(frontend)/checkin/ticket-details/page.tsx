'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/CheckIn/useAuth';

import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function TicketDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const ticket = searchParams?.get('ticket');
  const checkinRecord = searchParams?.get('checkinRecord');

  const ticketData = ticket ? JSON.parse(decodeURIComponent(ticket)) : null;
  const checkinData = checkinRecord ? JSON.parse(decodeURIComponent(checkinRecord)) : null;
  const alreadyCheckedIn = !!checkinData;

  const handleCheckIn = async () => {    
    if (!ticketData?.code) return;
    setIsCheckingIn(true);
    try {
      const res = await fetch(`/api/checkin-app/checkin/${ticketData.code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Failed to check in');
        return;
      }
      alert('Ticket checked in successfully');
      router.replace('/checkin/validates');
    } catch (err: any) {
      alert(err.message || 'Failed to check in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (!ticketData) {
    return <div className="p-6 text-center text-red-500 font-semibold">Invalid ticket data</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className={`max-w-xl mx-auto rounded-xl p-6 text-white text-center ${
        alreadyCheckedIn ? 'bg-red-500' : 'bg-green-500'
      }`}>
        {alreadyCheckedIn ? <XCircle size={60} className="mx-auto mb-2" /> : <CheckCircle size={60} className="mx-auto mb-2" />}
        <h1 className="text-2xl font-bold mb-1">
          {alreadyCheckedIn ? 'TICKET USED' : 'VALID TICKET'}
        </h1>
        <p className="text-lg font-semibold mb-4">#{ticketData.code}</p>

        {alreadyCheckedIn && (
          <div className="bg-white text-gray-800 rounded-md p-4 mb-4 text-left">
            <p><strong>Checked in at:</strong> {new Date(checkinData.checkedInAt).toLocaleString()}</p>
            <p><strong>By:</strong> {checkinData.checkedInBy?.email || 'N/A'}</p>
          </div>
        )}

        <div className="bg-white text-gray-800 rounded-md p-4 text-left mb-4">
          <h2 className="font-bold text-base mb-2">TICKET DETAILS</h2>
          <p><strong>Name:</strong> {ticketData.attendeeName}</p>
          <p><strong>Event:</strong> {ticketData.eventName}</p>
          <p><strong>Date:</strong> {ticketData.eventTime}</p>
          <p><strong>Seat:</strong> {ticketData.seat || 'N/A'}</p>
        </div>

        <button
          onClick={handleCheckIn}
          disabled={alreadyCheckedIn || isCheckingIn}
          className={`w-full py-3 rounded-full font-bold transition ${
            alreadyCheckedIn ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-green-600 hover:bg-gray-100'
          }`}
        >
          {alreadyCheckedIn ? 'ALREADY CHECKED IN' : isCheckingIn ? 'CHECKING IN...' : 'CHECK IN NOW'}
        </button>
      </div>
    </div>
  );
}
