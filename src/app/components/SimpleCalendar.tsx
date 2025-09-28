'use client';

import { useState, useEffect, useCallback } from 'react';
import { AvailableSlot, Appointment } from '@/lib/types';

interface SimpleCalendarProps {
  appointmentRequestId?: string;
  clientInfo?: {
    name: string;
    phone: string;
    email?: string;
  };
  onAppointmentBooked?: (appointment: Appointment) => void;
  onDateChange?: (date: string, slots: any[]) => void;
  onAppointmentAction?: (action: 'confirm' | 'cancel', slotId: string) => void;
  className?: string;
}

interface SlotWithStatus extends AvailableSlot {
  isBooked?: boolean;
  appointmentId?: string;
  clientName?: string;
  clientPhone?: string;
  appointmentType?: string;
  status?: string;
}

export default function SimpleCalendar({ 
  appointmentRequestId, 
  clientInfo, 
  onAppointmentBooked,
  onDateChange,
  onAppointmentAction,
  className = ''
}: SimpleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allSlots, setAllSlots] = useState<SlotWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<string | null>(null); // Track which slot is being booked
  const [error, setError] = useState<string | null>(null);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/calendar/slots?date=${selectedDate}&duration=60`);
      const result = await response.json();
      
      if (result.success) {
        setAllSlots(result.data.allSlots);
        // Notify parent of date change and slots data
        if (onDateChange) {
          onDateChange(selectedDate, result.data.allSlots);
        }
      } else {
        setError(result.error || 'Failed to load slots');
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      setError('Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const handleBookSlot = async (slot: AvailableSlot) => {
    if (!clientInfo) {
      setError('Client information is required to book appointment');
      return;
    }

    const slotKey = `${slot.therapistId}-${slot.startTime}`;
    setBooking(slotKey);
    setError(null);

    try {
      const response = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentRequestId,
          therapistId: slot.therapistId,
          clientName: clientInfo.name,
          clientPhone: clientInfo.phone,
          clientEmail: clientInfo.email,
          appointmentType: 'initial_consultation',
          appointmentDate: slot.date,
          startTime: slot.startTime,
          durationMinutes: slot.durationMinutes,
          notes: appointmentRequestId ? 'Booked via AI assistant call' : 'Booked via calendar'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        onAppointmentBooked?.(result.data);
        loadAvailability(); // Refresh slots to remove the booked one
      } else {
        setError(result.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment');
    } finally {
      setBooking(null);
    }
  };

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time; // Fallback to original time if formatting fails
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr; // Fallback to original date if formatting fails
    }
  };

  const getNextWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        label: formatDate(dateStr),
        isToday: i === 0
      });
    }
    return days;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {allSlots.filter(s => !s.isBooked).length} available slots on {formatDate(selectedDate)}
        </h3>
        {loading && (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Client Info Display */}
      {clientInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Booking for:</strong> {clientInfo.name} ({clientInfo.phone})
          </p>
        </div>
      )}
      
       {/* Date Selector */}
       <div className="mb-6">
         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
           <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
           <span>Select Date</span>
         </h3>
         <div className="grid grid-cols-7 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
           {getNextWeekDays().map((day) => (
             <button
               key={day.date}
               onClick={() => setSelectedDate(day.date)}
               className={`relative flex flex-col items-center justify-center p-3 rounded-lg text-center transition-all duration-200 hover:scale-105 ${
                 selectedDate === day.date
                   ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                   : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow-md'
               } ${day.isToday ? 'ring-2 ring-blue-300' : ''}`}
             >
               <div className="text-xs font-medium opacity-75 mb-1">
                 {day.label.split(' ')[0]}
               </div>
               <div className="text-lg font-bold">
                 {day.label.split(' ')[2]}
               </div>
               <div className="text-xs font-medium opacity-75 mt-1">
                 {day.label.split(' ')[1]}
               </div>
               {day.isToday && (
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white"></div>
               )}
             </button>
           ))}
         </div>
       </div>

      {/* Available Slots */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500">Loading available times...</p>
          </div>
        ) : allSlots.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No available appointments</p>
            <p className="text-gray-400 text-sm mt-1">Try selecting a different date</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-3">
              {allSlots.filter(s => !s.isBooked).length} available slot{allSlots.filter(s => !s.isBooked).length !== 1 ? 's' : ''} on {formatDate(selectedDate)}
            </div>
            {allSlots.map((slot, index) => {
              const slotKey = `${slot.therapistId}-${slot.startTime}`;
              const isBooking = booking === slotKey;
              const isBooked = slot.isBooked;
              
              return (
                <div
                  key={`${slot.therapistId}-${slot.startTime}-${index}`}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                    isBooked 
                      ? (slot as any).status === 'appointment_booked'
                        ? 'border-green-300 bg-green-50 shadow-sm ring-1 ring-green-200' // Confirmed - green accent
                        : 'border-gray-300 bg-gray-50' // Pending
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm' // Available
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {slot.durationMinutes} minutes
                        </p>
                        {isBooked && slot.clientName && (
                          <p className="text-sm text-gray-600 mt-1">
                            Client: {slot.clientName}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {!isBooked && (
                          <p className="text-sm font-medium text-green-600">
                            Available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {isBooked ? (
                      // Show different UI based on appointment status
                      (slot as any).status === 'appointment_booked' ? (
                        <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                          ✅ Confirmed
                        </span>
                      ) : (slot as any).status === 'cancelled' ? (
                        <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                          ❌ Cancelled
                        </span>
                      ) : (
                        // Show action buttons for pending appointments
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const slotId = slot.appointmentRequestId || slot.appointmentId || `${slot.therapistId}-${slot.startTime}`;
                              console.log('🔍 Confirm button clicked for slot:', { 
                                slotId, 
                                appointmentRequestId: slot.appointmentRequestId, 
                                appointmentId: slot.appointmentId,
                                fallback: `${slot.therapistId}-${slot.startTime}`,
                                fullSlot: slot 
                              });
                              onAppointmentAction?.('confirm', slotId);
                            }}
                            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => onAppointmentAction?.('cancel', slot.appointmentRequestId || slot.appointmentId || `${slot.therapistId}-${slot.startTime}`)}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => handleBookSlot(slot)}
                        disabled={isBooking || !clientInfo}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          !clientInfo
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isBooking
                            ? 'bg-blue-400 text-white cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isBooking ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Scheduling...</span>
                          </div>
                        ) : (
                          'Schedule'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Instructions */}
      {!clientInfo && (
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> Client information is required to schedule follow-up appointments. 
            This component is typically used with client information gathered by the AI assistant.
          </p>
        </div>
      )}
    </div>
  );
}
