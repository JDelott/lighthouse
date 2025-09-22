'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Removed dummy data imports - using real data only
import { getAllCallSessions } from '@/lib/call-processor';
import { VapiCallSession, AppointmentRequest, TherapistNote } from '@/lib/types';
import CallSessionCard from '../components/CallSessionCard';
// import VapiTestButton from '../components/VapiTestButton';
import { config, formatPhoneForDisplay } from '@/lib/config';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  // Get real call sessions (fallback to in-memory, prefer API data)
  const memoryCallSessions = getAllCallSessions();
  const allCallSessions = apiCallSessions.length > 0 ? apiCallSessions : memoryCallSessions;
  
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
    pendingScheduling: allCallSessions.filter(session => session.metadata?.schedulingStatus === 'pending_confirmation').length,
    urgentRequests: allCallSessions.filter(session => session.metadata?.urgencyLevel && session.metadata.urgencyLevel >= 4).length,
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
                Lighthouse AI Assistant
              </Link>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                HIPAA Compliant
              </span>
              <div className="ml-4 text-sm text-gray-600">
                <span className="font-medium">{session.user.organization?.name}</span>
                {session.user.organization?.planType && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">
                    {session.user.organization.planType}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-medium text-gray-900">{session.user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{session.user.role}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{session.user.name}</div>
                      <div className="text-sm text-gray-500">{session.user.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {session.user.organization?.name} • {session.user.role}
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Account Settings
                        </div>
                      </Link>
                      <Link
                        href="/pricing"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Billing & Plans
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session.user.name?.split(' ')[0]}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                Here's what's happening at <span className="font-medium">{session.user.organization?.name}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Plan</div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full capitalize">
                  {session.user.organization?.planType || 'Trial'}
                </span>
                {session.user.organization?.planType === 'trial' && (
                  <Link 
                    href="/pricing" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Progress Bar for Trial Users */}
        {session.user.organization?.planType === 'trial' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Trial Usage</h3>
              <Link 
                href="/pricing" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Upgrade Plan
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Calls this month</span>
                <span className="font-medium">{callSessionCounts.total} / 50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((callSessionCounts.total / 50) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {50 - callSessionCounts.total} calls remaining in your trial
              </p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{callSessionCounts.total}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">{callSessionCounts.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-6 9l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Appointment Requests</p>
                <p className="text-2xl font-bold text-gray-900">{callSessionCounts.appointmentRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{callSessionCounts.pendingScheduling}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Scheduling</p>
                <p className="text-2xl font-bold text-gray-900">{callSessionCounts.pendingScheduling}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{callSessionCounts.urgentRequests}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent Requests</p>
                <p className="text-2xl font-bold text-gray-900">{callSessionCounts.urgentRequests}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">AI Appointment Scheduling Calls</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  Appointment Requests: {callSessionCounts.appointmentRequests}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  Pending Scheduling: {callSessionCounts.pendingScheduling}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Urgent: {callSessionCounts.urgentRequests}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {recentCallSessions.length > 0 ? (
              <div className="grid gap-6">
                {recentCallSessions.map((callSession) => (
                  <CallSessionCard 
                    key={callSession.id} 
                    callSession={callSession}
                    showPatientInfo={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="text-gray-500">
                  No appointment scheduling calls yet. Clients can call {formatPhoneForDisplay(config.vapi.phoneNumber)} to schedule appointments with the AI assistant.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Vapi Test Button - Commented out for production
      <VapiTestButton />
      */}
    </div>
  );
}
