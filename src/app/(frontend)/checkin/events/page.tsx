'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/CheckIn/useAuth';

import { format } from 'date-fns';


export default function ChooseEventPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const router = useRouter();
  const { isHydrated, token } = useAuth();

  useEffect(() => {
    if (!isHydrated) return; 
    if (!token) {
      router.replace('/checkin');
      return;
    }

    fetchEvents();
  }, [isHydrated, token]);

  const fetchEvents = async () => {
    if (!token) {
      alert('Please login first');
      router.push('/checkin');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/checkin-app/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`,
        },
      });
      const json = await response.json();
      setEvents(json.events?.docs);
    } catch (error: any) {
      alert(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setSelectedSchedule(null);
  };

  const handleSelectSchedule = (schedule: any) => {
    setSelectedSchedule(schedule);
  };

  const handleConfirm = () => {
    if (!selectedEvent || !selectedSchedule) {
      alert('Please select an event and schedule');
      return;
    }

    router.push(
      `/checkin/validates?eventId=${selectedEvent.id}&scheduleId=${selectedSchedule.id}&eventLocation=${selectedEvent.eventLocation}&eventTitle=${selectedEvent.title}&eventScheduleDate=${selectedSchedule.date}`
    );
  };

  const formatDate = (iso: string) => format(new Date(iso), 'PPpp');
  const formatDateRange = (start: string, end: string) =>
    `${formatDate(start)} - ${formatDate(end)}`;

  return (
    <div className="min-h-screen py-12 p-6 bg-gray-100">
      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-sm text-gray-500 mb-2">
              {formatDateRange(event.startDatetime, event.endDatetime)}
            </p>
            <button
              onClick={() => handleSelectEvent(event)}
              className={`w-full py-2 px-4 text-white rounded ${
                selectedEvent?.id === event.id ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {selectedEvent?.id === event.id ? 'Selected' : 'Select Event'}
            </button>

            {selectedEvent?.id === event.id && (
              <div className="mt-4 flex flex-wrap gap-2">
                {event.schedules && event.schedules.length > 0 ? (
                  event.schedules.map((schedule: any) => (
                    <button
                      key={schedule.id}
                      onClick={() => handleSelectSchedule(schedule)}
                      className={`px-3 py-2 rounded text-white text-sm ${
                        selectedSchedule?.id === schedule.id
                          ? 'bg-green-600'
                          : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    >
                      {formatDate(schedule.date)}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No schedules available for this event</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedSchedule && (
        <button
          onClick={handleConfirm}
          className="mt-6 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded"
        >
          Confirm
        </button>
      )}
    </div>
  );
}
