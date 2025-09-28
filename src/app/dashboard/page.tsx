'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Removed dummy data imports - using real data only
// Removed server-side import - using API calls instead
import { VapiCallSession, AppointmentRequest, TherapistNote } from '@/lib/types';
import CallSessionCard from '../components/CallSessionCard';
import RefreshButton from '../components/RefreshButton';
// import VapiTestButton from '../components/VapiTestButton';
import { config, formatPhoneForDisplay } from '@/lib/config';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedFromDatabase, setHasLoadedFromDatabase] = useState(false);
  const [apiCallSessions, setApiCallSessions] = useState<VapiCallSession[]>([]);
  const [apiAppointmentRequests, setApiAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Use only API data from database
  const allCallSessions = apiCallSessions;
  
  // Load calls from database (webhooks automatically populate the database)
  const loadCallsFromDatabase = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Loading calls from database...');
      const response = await fetch('/api/calls');
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Loaded calls from database:', result.data.counts);
        setApiCallSessions(result.data.callSessions || []);
        setApiAppointmentRequests(result.data.appointmentRequests || []);
        setHasLoadedFromDatabase(true);
      } else {
        console.error('❌ Failed to load calls from database:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading calls:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh function - commented out since webhooks handle automatic sync
  // const handleRefresh = () => {
  //   console.log('🔄 Refreshing dashboard data...');
  //   setRefreshKey(prev => prev + 1);
  //   syncCallsFromAPI(true); // Force fetch from Vapi API
  // };
  
  // Auto-load data from database on component mount and periodically
  useEffect(() => {
    loadCallsFromDatabase(); // Load from database via API
    
    // Set up automatic refresh every 30 seconds (load from database)
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data from database...');
      loadCallsFromDatabase(); // Just load from database
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const callSessionCounts = {
    total: allCallSessions.length,
    completed: allCallSessions.filter(session => session.status === 'completed').length,
    inProgress: allCallSessions.filter(session => session.status === 'in-progress').length,
    appointmentRequests: allCallSessions.filter(session => session.callType === 'appointment_request').length,
  };

  // Show recent real call sessions only
  const recentCallSessions = allCallSessions.slice(0, 5);
  
  // Debug logging
  console.log('📊 Dashboard Debug:', {
    totalCallSessions: allCallSessions.length,
    recentCallSessions: recentCallSessions.length,
    callSessionCounts
  });


  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no session
  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8">
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
                        href="/calendar"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
              Welcome back, {session.user.name?.split(' ')[0]}
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-blue-500 to-cyan-400"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Column - Stats & Overview */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            
            {/* Quick Stats Card */}
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-6">Call Overview</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-light text-black">{callSessionCounts.total}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total Calls</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-black">{callSessionCounts.appointmentRequests}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Appointments</p>
                </div>
              </div>
            </div>

            {/* Monthly Usage Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-4">Calls This Month</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total calls</span>
                  <span className="font-medium text-black">{callSessionCounts.total}</span>
                </div>
                <div className="w-full bg-blue-200 h-2 rounded-full">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((callSessionCounts.total / 50) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  Monthly activity overview
                </p>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-4">AI Assistant</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-black">{formatPhoneForDisplay(config.vapi.phoneNumber)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm font-medium text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Calls */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-gray-100 rounded-lg">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-medium text-black">Recent Calls</h2>
                    <p className="text-sm text-gray-600 mt-1">AI information gathering and follow-up preparation</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500">
                      {callSessionCounts.total} total calls
                    </div>
                    <RefreshButton 
                      onRefresh={() => loadCallsFromDatabase()}
                      syncFromVapi={true}
                      className="bg-white border border-gray-200 hover:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {recentCallSessions.length > 0 ? (
                  <div className="space-y-6">
                    {recentCallSessions.map((callSession) => (
                      <CallSessionCard 
                        key={callSession.id} 
                        callSession={callSession}
                        showPatientInfo={true}
                        onDeleteSuccess={(deletedCallId) => {
                          console.log('Call deleted from dashboard:', deletedCallId);
                          // Immediately refresh data from database
                          loadCallsFromDatabase();
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-5 h-5 bg-white/30 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-medium text-black mb-2">No calls yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Clients can call {formatPhoneForDisplay(config.vapi.phoneNumber)} to share their information with the AI assistant for follow-up.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Vapi Test Button - Commented out for production
      <VapiTestButton />
      */}
    </div>
  );
}
