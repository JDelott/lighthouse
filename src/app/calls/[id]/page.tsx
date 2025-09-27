'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { VapiCallSession, VapiTranscriptEntry, TherapistNote } from '@/lib/types';
import { 
  findVapiCallSessionById, 
  getTranscriptsByCallSession, 
  getTherapistNotesByCallSession 
} from '@/lib/dummy-data';
import TranscriptViewer from '../../components/TranscriptViewer';
import { formatDuration, formatPhoneNumber, formatRelativeTime } from '@/lib/utils';

interface CallSessionPageProps {
  params: { id: string };
}

export default function CallSessionPage({ params }: CallSessionPageProps) {
  const [callSession, setCallSession] = useState<VapiCallSession | null>(null);
  const [transcripts, setTranscripts] = useState<VapiTranscriptEntry[]>([]);
  const [therapistNotes, setTherapistNotes] = useState<TherapistNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const session = findVapiCallSessionById(params.id);
    if (session) {
      setCallSession(session);
      setTranscripts(getTranscriptsByCallSession(params.id));
      setTherapistNotes(getTherapistNotesByCallSession(params.id));
    }
    setLoading(false);
  }, [params.id]);

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

  const getStatusColor = (status: VapiCallSession['status']) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (level?: number) => {
    if (!level) return 'bg-gray-500';
    if (level >= 8) return 'bg-red-500';
    if (level >= 6) return 'bg-orange-500';
    if (level >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
                The Mental Health Hub
              </Link>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                HIPAA Compliant
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Call Session Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Call Session Details
              </h1>
              <p className="text-gray-600">
                {callSession.metadata?.clientName || 'Anonymous Caller'} • {formatPhoneNumber(callSession.clientPhone)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(callSession.status)}`}>
                {callSession.status}
              </span>
              {callSession.metadata?.urgencyLevel && (
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getUrgencyColor(callSession.metadata.urgencyLevel)}`}></div>
                  <span className="text-sm text-gray-600">
                    Urgency: {callSession.metadata.urgencyLevel}/10
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Call Summary */}
          {callSession.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Summary</h3>
              <p className="text-gray-700 leading-relaxed">{callSession.summary}</p>
            </div>
          )}

          {/* Call Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Call Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Started:</span> {new Date(callSession.startedAt).toLocaleString()}</p>
                {callSession.endedAt && (
                  <p><span className="font-medium">Ended:</span> {new Date(callSession.endedAt).toLocaleString()}</p>
                )}
                {callSession.duration && (
                  <p><span className="font-medium">Duration:</span> {formatDuration(callSession.duration)}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Assessment</h4>
              <div className="space-y-1 text-sm">
                {callSession.metadata?.emotionalState && (
                  <p><span className="font-medium">Emotional State:</span> {callSession.metadata.emotionalState}</p>
                )}
                <p><span className="font-medium">Follow-up Required:</span> {callSession.metadata?.followUpRequired ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Referral Needed:</span> {callSession.metadata?.referralNeeded ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Actions</h4>
              <div className="space-y-2">
                {callSession.recordingUrl && (
                  <a
                    href={callSession.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8.464 8.464L4 12l4.464 4.464" />
                    </svg>
                    Listen to Recording
                  </a>
                )}
                <div>
                  <Link
                    href={`/calls/${callSession.id}/notes`}
                    className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Add Therapist Note
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Key Topics */}
          {callSession.metadata?.keyTopics && callSession.metadata.keyTopics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Key Topics Discussed</h4>
              <div className="flex flex-wrap gap-2">
                {callSession.metadata.keyTopics.map((topic, index) => (
                  <span 
                    key={index}
                    className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Therapist Notes */}
        {therapistNotes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Therapist Notes</h2>
            <div className="space-y-4">
              {therapistNotes.map((note) => (
                <div key={note.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">Note by Therapist</h3>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{note.note}</p>
                  {note.actionItems && note.actionItems.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Action Items:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {note.actionItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <TranscriptViewer 
            transcripts={transcripts}
            showTimestamps={true}
            showConfidence={true}
            showEmotions={true}
          />
        </div>
      </main>
    </div>
  );
}
