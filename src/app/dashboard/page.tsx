'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Removed dummy data imports - using real data only
import { getAllCallSessions } from '@/lib/call-processor';
import { Referral, VapiCallSession, AppointmentRequest, TherapistNote } from '@/lib/types';
import CallSessionCard from '../components/CallSessionCard';
// import VapiTestButton from '../components/VapiTestButton';
import { config, formatPhoneForDisplay } from '@/lib/config';

export default function DashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | Referral['status']>('all');
  const [activeTab, setActiveTab] = useState<'referrals' | 'calls'>('referrals');
  const [isLoading, setIsLoading] = useState(false);
  const [apiCallSessions, setApiCallSessions] = useState<VapiCallSession[]>([]);
  const [apiAppointmentRequests, setApiAppointmentRequests] = useState<AppointmentRequest[]>([]);
  
  // Remove dummy referrals - this will be replaced with real referral system later
  const statusCounts = {
    all: 0,
    pending: 0,
    assigned: 0,
    contacted: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  };

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

  // No referrals to show - remove dummy data
  const filteredReferrals: Referral[] = [];

  // Show recent real call sessions only
  const recentCallSessions = allCallSessions.slice(0, 5);
  
  // Debug logging
  console.log('📊 Dashboard Debug:', {
    totalCallSessions: allCallSessions.length,
    recentCallSessions: recentCallSessions.length,
    callSessionCounts
  });

  const getStatusColor = (status: Referral['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Referral['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = dummyPatients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getProviderName = (providerId?: string) => {
    if (!providerId) return 'Unassigned';
    const provider = dummyProviders.find(p => p.id === providerId);
    return provider ? provider.name : 'Unknown Provider';
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
                href="/referrals/new"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                New Referral
              </Link>
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
          <h1 className="text-3xl font-bold text-gray-900">Referral Management Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage and track mental health referrals with comprehensive status monitoring
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{statusCounts.all}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
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

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('referrals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'referrals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mental Health Referrals ({statusCounts.all})
              </button>
              <button
                onClick={() => setActiveTab('calls')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'calls'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                AI Call Sessions ({callSessionCounts.total})
              </button>
            </nav>
          </div>

          {activeTab === 'referrals' ? (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Mental Health Referrals</h2>
              <div className="flex space-x-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status as 'all' | Referral['status'])}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getPatientName(referral.patientId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.source.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {referral.referralReason}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.symptoms.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getPriorityColor(referral.priority)}`}></div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {referral.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Urgency: {referral.urgencyLevel}/10
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getProviderName(referral.providerId)}
                      </div>
                      {referral.scheduledAppointment && (
                        <div className="text-sm text-gray-500">
                          {referral.scheduledAppointment.date} at {referral.scheduledAppointment.time}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/referrals/${referral.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </Link>
                      <Link
                        href={`/referrals/${referral.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReferrals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                No referrals found for the selected status.
              </div>
            </div>
          )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </main>
      
      {/* Vapi Test Button - Commented out for production
      <VapiTestButton />
      */}
    </div>
  );
}
