'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'organization', name: 'Organization', icon: '🏢' },
    { id: 'billing', name: 'Billing', icon: '💳' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{session.user.name}</div>
                <div className="text-gray-500">{session.user.organization?.name}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          {/* Sidebar */}
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group w-full rounded-md px-3 py-2 flex items-center text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-blue-500'
                      : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        value={session.user.name || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={session.user.email || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <input
                        type="text"
                        value={session.user.role || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 capitalize"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User ID</label>
                      <input
                        type="text"
                        value={session.user.id || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-xs"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      To update your profile information, please contact support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === 'organization' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Details</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                      <input
                        type="text"
                        value={session.user.organization?.name || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Plan</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full capitalize">
                          {session.user.organization?.planType || 'Trial'}
                        </span>
                        <Link 
                          href="/pricing" 
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Change Plan
                        </Link>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="text"
                        value={session.user.organization?.phoneNumber || 'Not set'}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organization ID</label>
                      <input
                        type="text"
                        value={session.user.organizationId || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-xs"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Billing & Usage</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Current Plan</h4>
                        <p className="text-sm text-gray-500 capitalize">
                          {session.user.organization?.planType || 'Trial'} Plan
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {session.user.organization?.planType === 'trial' ? '$0' : 
                           session.user.organization?.planType === 'starter' ? '$79' :
                           session.user.organization?.planType === 'professional' ? '$199' : '$499'}
                        </div>
                        <div className="text-sm text-gray-500">per month</div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Usage This Month</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Calls processed</span>
                          <span className="text-sm font-medium">0 / {
                            session.user.organization?.planType === 'trial' ? '50' :
                            session.user.organization?.planType === 'starter' ? '200' :
                            session.user.organization?.planType === 'professional' ? '500' : '∞'
                          }</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Minutes used</span>
                          <span className="text-sm font-medium">0</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Link
                        href="/pricing"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Upgrade Plan
                      </Link>
                      <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium">
                        View Invoices
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive updates about your account and calls</p>
                      </div>
                      <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Usage Alerts</h4>
                        <p className="text-sm text-gray-500">Get notified when approaching plan limits</p>
                      </div>
                      <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Urgent Call Alerts</h4>
                        <p className="text-sm text-gray-500">Immediate notifications for urgent patient calls</p>
                      </div>
                      <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
