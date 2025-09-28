'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { VapiCallSession, VapiTranscriptEntry, TherapistNote } from '@/lib/types';
import TranscriptViewer from '../../components/TranscriptViewer';
import { formatDuration, formatPhoneNumber, formatRelativeTime } from '@/lib/utils';

interface CallSessionPageProps {
  params: Promise<{ id: string }>;
}

export default function CallSessionPage({ params }: CallSessionPageProps) {
  const { data: session } = useSession();
  const [callSession, setCallSession] = useState<VapiCallSession | null>(null);
  const [transcripts, setTranscripts] = useState<VapiTranscriptEntry[]>([]);
  const [therapistNotes, setTherapistNotes] = useState<TherapistNote[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function fetchCallData() {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/vapi/calls/${resolvedParams.id}`);
        const result = await response.json();
        
        if (result.success) {
          setCallSession(result.data.callSession);
          setTranscripts(result.data.transcripts);
          setTherapistNotes(result.data.therapistNotes);
        }
      } catch (error) {
        console.error('Error fetching call data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCallData();
  }, [params]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading call session...</p>
        </div>
      </div>
    );
  }

  if (!callSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Call Session Not Found</h1>
          <p className="text-gray-600 mb-4">The requested call session could not be found.</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Extract client name from summary or metadata
  const getClientName = () => {
    // First check metadata
    if (callSession.metadata?.clientName) {
      return callSession.metadata.clientName;
    }
    
    // Extract from summary if available
    if (callSession.summary) {
      // Common patterns for name extraction from AI-generated summaries
      const patterns = [
        // "Jacob Delott called Nick Sundstrom's AI assistant" - matches your example
        /^([A-Z][a-z]+\s+[A-Z][a-z]+)\s+called/i,
        // "John Smith scheduled" or "Jane Doe requested"
        /^([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(scheduled|requested|contacted)/i,
        // More flexible pattern for names at the beginning
        /^([A-Z][a-z]+\s+[A-Z][a-z]+)[\s,]/
      ];
      
      for (const pattern of patterns) {
        const match = callSession.summary.match(pattern);
        if (match && match[1]) {
          const name = match[1].trim();
          // Basic validation - should be 2-4 words, each starting with capital
          const words = name.split(/\s+/);
          if (words.length >= 2 && words.length <= 4 && 
              words.every(word => /^[A-Z][a-z]+$/.test(word))) {
            return name;
          }
        }
      }
    }
    
    return 'Anonymous Caller';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Real Header - Same as Dashboard */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-px h-6 bg-gradient-to-b from-blue-500 to-cyan-400 mr-3"></div>
                <Link href="/dashboard" className="text-xl font-normal tracking-tight text-black hover:text-blue-600 transition-colors">
                  The Mental Health Hub
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              {session && (
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
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Simplified Call Overview */}
        <div className="bg-white border border-gray-100 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-light text-black mb-2">
                {getClientName()}
              </h1>
              <p className="text-gray-600">
                {formatPhoneNumber(callSession.clientPhone)} • {new Date(callSession.startedAt).toLocaleDateString()} at {new Date(callSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              {callSession.duration && (
                <p className="text-sm text-gray-500">
                  Duration: {formatDuration(callSession.duration)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {callSession.recordingUrl && (
                <a
                  href={callSession.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8.464 8.464L4 12l4.464 4.464" />
                  </svg>
                  Listen
                </a>
              )}
            </div>
          </div>

          {/* Call Summary */}
          {callSession.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-black mb-2">Summary</h3>
              <p className="text-gray-700 leading-relaxed">{callSession.summary}</p>
            </div>
          )}
        </div>

        {/* Transcript */}
        <div className="bg-white border border-gray-100 rounded-lg p-6">
          <TranscriptViewer 
            transcripts={transcripts}
            showTimestamps={false}
            showConfidence={false}
            showEmotions={false}
          />
        </div>
      </main>
    </div>
  );
}
