'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SimpleCalendar from '../components/SimpleCalendar';
import { Appointment, Therapist } from '@/lib/types';

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Load therapists and recent appointments
  useEffect(() => {
    if (session) {
      loadCalendarData();
    }
  }, [session]);

  const loadCalendarData = async () => {
    try {
      // Load therapists
      const therapistsResponse = await fetch('/api/therapists');
      const therapistsResult = await therapistsResponse.json();
      if (therapistsResult.success) {
        setTherapists(therapistsResult.data);
      }

      // Load recent appointments (you'd need to create this API endpoint)
      // For now, we'll just set empty array
      setRecentAppointments([]);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleAppointmentBooked = (appointment: Appointment) => {
    console.log('✅ Appointment booked:', appointment);
    // Refresh calendar data
    loadCalendarData();
    // Could show a success notification here
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
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-black text-sm font-normal tracking-wide transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/calendar"
                className="text-blue-600 text-sm font-medium tracking-wide"
              >
                Calendar
              </Link>
              <Link
                href="/settings"
                className="text-gray-700 hover:text-black text-sm font-normal tracking-wide transition-colors"
              >
                Settings
              </Link>
            </nav>
            
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
        <div className="mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-light text-black leading-tight">
              Appointment Calendar
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-cyan-400"></div>
            <p className="text-xl text-gray-600 font-light leading-relaxed">
              Manage your practice schedule and book appointments in real-time
            </p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Calendar */}
          <div className="col-span-12 lg:col-span-8">
            <SimpleCalendar 
              onAppointmentBooked={handleAppointmentBooked}
              className="h-fit"
            />
          </div>
          
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Therapists Card */}
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-4">Your Team</h3>
              {therapists.length > 0 ? (
                <div className="space-y-3">
                  {therapists.map((therapist) => (
                    <div key={therapist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{therapist.name}</p>
                        <p className="text-sm text-gray-500">
                          {therapist.isActive ? 'Available' : 'Unavailable'}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${therapist.isActive ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No therapists found</p>
              )}
              
              <button 
                onClick={() => {
                  // Could open a modal to create a therapist
                  console.log('Add therapist clicked');
                }}
                className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                + Add Therapist
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-4">Today's Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Appointments Today</span>
                  <span className="font-medium text-black">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available Slots</span>
                  <span className="font-medium text-green-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Therapists Active</span>
                  <span className="font-medium text-black">{therapists.filter(t => t.isActive).length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => console.log('Block time clicked')}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Block Time</p>
                      <p className="text-sm text-gray-500">Mark unavailable</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => console.log('Working hours clicked')}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Working Hours</p>
                      <p className="text-sm text-gray-500">Configure schedules</p>
                    </div>
                  </div>
                </button>

                <Link
                  href="/dashboard"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">View Dashboard</p>
                      <p className="text-sm text-gray-500">See recent calls</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-3">
                <span className="mr-2">📅</span>
                Calendar Active
              </h3>
              <p className="text-sm text-green-700 leading-relaxed mb-4">
                Your calendar system is live! Clients calling your AI assistant can now book appointments in real-time.
              </p>
              <div className="flex items-center text-xs text-green-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Real-time booking enabled
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
