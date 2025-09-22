'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Removed dummy data imports - using real data only
import { getAllCallSessions } from '@/lib/call-processor';
import { VapiCallSession, AppointmentRequest, TherapistNote } from '@/lib/types';
import CallSessionCard from '../components/CallSessionCard';
// import VapiTestButton from '../components/VapiTestButton';
import { config, formatPhoneForDisplay } from '@/lib/config';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiCallSessions, setApiCallSessions] = useState<VapiCallSession[]>([]);
  const [apiAppointmentRequests, setApiAppointmentRequests] = useState<AppointmentRequest[]>([]);

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
            </div>
            <div className="flex items-center space-x-4">
              {/* Manual Sync Button - Commented out since webhooks handle automatic sync
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>{isLoading ? 'Syncing...' : 'Sync from Vapi'}</span>
              </button>
              {lastSync && (
                <div className="text-xs text-gray-500">
                  Last sync: {new Date(lastSync).toLocaleTimeString()}
                </div>
              )}
              */}
              <Link
                href="/dashboard"
                className="bg-gray-100 text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Call Management Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage AI-powered appointment scheduling calls with comprehensive analytics
          </p>
        </div>

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
