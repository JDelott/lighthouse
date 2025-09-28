'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SimpleCalendar from '../components/SimpleCalendar';
import RefreshButton from '../components/RefreshButton';
import { Appointment } from '@/lib/types';

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendarKey, setCalendarKey] = useState(0); // Force calendar refresh
  const [appointmentRequests, setAppointmentRequests] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateTotal, setSelectedDateTotal] = useState(0);
  const [confirmedAppointments, setConfirmedAppointments] = useState<any[]>([]);
  const [showConfirmedDropdown, setShowConfirmedDropdown] = useState(false);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Set loading to false after session loads and load data
  useEffect(() => {
    if (session) {
      setLoading(false);
      loadAppointmentRequests();
    }
  }, [session]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleAppointmentBooked = (appointment: Appointment) => {
    console.log('✅ Appointment booked:', appointment);
    // Could show a success notification here
  };

  const handleDateChange = (date: string, dateSlots: any[]) => {
    setSelectedDate(date);
    // Count only the booked/pending slots for this specific date
    const dateFollowUps = dateSlots.filter(slot => slot.isBooked).length;
    setSelectedDateTotal(dateFollowUps);
  };

  // Format date consistently (same as SimpleCalendar)
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleAppointmentAction = async (action: 'confirm' | 'cancel', slotId: string) => {
    try {
      console.log(`${action === 'confirm' ? '✅' : '❌'} ${action}ing appointment:`, slotId);
      
      const response = await fetch(`/api/calendar/appointments/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slotId, action }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Appointment ${action}ed successfully`);
        
        // Force complete refresh of all data
        console.log('🔄 Refreshing all calendar data...');
        
        // 1. Refresh appointment requests (for overview counts)
        await loadAppointmentRequests();
        
        // 2. Force calendar component to reload (for slot display)
        setCalendarKey(prev => prev + 1);
        
        // 3. Reset selected date info to trigger recalculation
        if (selectedDate) {
          // The calendar will automatically call handleDateChange when it reloads
          console.log('📅 Calendar will refresh selected date info');
        }
        
        console.log('✅ All data refreshed');
      } else {
        console.error(`❌ Failed to ${action} appointment:`, result.error);
        alert(`Failed to ${action} appointment: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error ${action}ing appointment:`, error);
      alert(`Error ${action}ing appointment. Please try again.`);
    }
  };

  // Load appointment requests that need follow-up
  const loadAppointmentRequests = async () => {
    try {
      console.log('📋 Loading appointment requests...');
      const response = await fetch('/api/calls');
      const result = await response.json();
      
      console.log('📋 API response:', result);
      
      if (result.success) {
        const requests = result.data.appointmentRequests || [];
        setAppointmentRequests(requests);
        const pending = requests.filter((req: any) => 
          req.status === 'info_gathered' || 
          req.status === 'pending_therapist_review'
        ).length;
        const scheduled = requests.filter((req: any) => 
          req.status === 'follow_up_scheduled' || req.status === 'appointment_booked'
        ).length;
        
        
        // Extract confirmed appointments for quick view
        const confirmed = requests.filter((req: any) => req.status === 'appointment_booked');
        setConfirmedAppointments(confirmed);
        setPendingCount(pending);
        
        console.log('✅ Loaded appointment requests:', {
          total: requests.length,
          pending: pending,
          scheduled: scheduled,
          statuses: requests.map(r => ({ id: r.id, status: r.status })),
          pendingRequests: requests.filter((req: any) => 
            req.status === 'info_gathered' || 
            req.status === 'pending_therapist_review'
          ),
          allStatuses: [...new Set(requests.map(r => r.status))]
        });
      } else {
        console.error('❌ Failed to load appointment requests:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading appointment requests:', error);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Refreshing calendar data...');
    try {
      // Force calendar component to refresh by changing key
      setCalendarKey(prev => prev + 1);
      console.log('📅 Calendar key updated');
      
      // Also refresh appointment requests
      await loadAppointmentRequests();
      console.log('✅ Calendar refresh completed');
    } catch (error) {
      console.error('❌ Error during calendar refresh:', error);
    }
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no session
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-px h-6 bg-gradient-to-b from-blue-500 to-cyan-400 mr-3"></div>
                <Link href="/" className="text-xl font-normal tracking-tight text-black hover:text-blue-600 transition-colors">
                  The Mental Health Hub
                </Link>
              </div>
            </div>
            
            
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-sm bg-white border border-gray-200 px-4 py-2 hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-light text-sm">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-normal text-black">{session.user.name}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{session.user.name}</div>
                      <div className="text-sm text-gray-500">{session.user.email}</div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 012 2v6l-3 2-3-2V7a2 2 0 012-2z" />
                          </svg>
                          Dashboard
                        </div>
                      </Link>
                      <Link
                        href="/calendar"
                        className="block px-4 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Calendar
                        </div>
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-light text-black leading-tight">
              Follow-up & Appointment Management
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-cyan-400"></div>
            <p className="text-xl text-gray-600 font-light leading-relaxed">
              Review client information and schedule follow-up appointments
            </p>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium text-black">Appointment Calendar</h2>
                <p className="text-gray-600 mt-1">Select available time slots to schedule follow-up appointments</p>
              </div>
              <RefreshButton 
                onRefresh={handleRefresh}
                syncFromVapi={true}
                className="bg-white border border-gray-200 hover:border-blue-500"
              />
            </div>
            
            {/* Follow-up Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-orange-50 rounded border border-orange-100">
                <div className="text-lg font-bold text-orange-600">{pendingCount}</div>
                <div className="text-xs text-orange-700">Total Pending Follow-ups</div>
              </div>
              <div className="relative">
                <div 
                  className="text-center p-2 bg-blue-50 rounded border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => setShowConfirmedDropdown(!showConfirmedDropdown)}
                >
                  <div className="text-lg font-bold text-blue-600">
                    {appointmentRequests.filter(req => req.status === 'follow_up_scheduled' || req.status === 'appointment_booked').length}
                  </div>
                  <div className="text-xs text-blue-700 flex items-center justify-center">
                    Total Scheduled
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Confirmed Appointments Dropdown */}
                {showConfirmedDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <div className="p-3">
                      <div className="text-xs font-medium text-gray-600 mb-2">Confirmed Appointments</div>
                      {confirmedAppointments.length > 0 ? (
                        <div className="space-y-2">
                          {confirmedAppointments.map((appt, index) => (
                            <div key={appt.id} className="text-xs p-2 bg-green-50 rounded border-l-2 border-green-400">
                              <div className="font-medium text-green-800">
                                {appt.clientInfo?.fullName || 'Client'}
                              </div>
                              <div className="text-green-600">
                                {appt.appointmentDetails?.preferredDates?.[0]} at {appt.appointmentDetails?.preferredTimes?.[0]}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">No confirmed appointments yet</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center p-2 bg-green-50 rounded border border-green-100">
                <div className="text-lg font-bold text-green-600">
                  {selectedDate ? selectedDateTotal : '--'}
                </div>
                <div className="text-xs text-green-700">
                  {selectedDate ? formatDate(selectedDate) : 'Select Date'}
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <SimpleCalendar 
              key={calendarKey}
              onAppointmentBooked={handleAppointmentBooked}
              onDateChange={handleDateChange}
              onAppointmentAction={handleAppointmentAction}
              initialDate={searchParams.get('date') || undefined}
              className="h-fit"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
