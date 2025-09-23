'use client';

import { VapiCallSession } from '@/lib/types';
import { formatDuration, formatPhoneNumber } from '@/lib/utils';
import Link from 'next/link';
import DeleteCallButton from './DeleteCallButton';

interface CallSessionCardProps {
  callSession: VapiCallSession;
  showPatientInfo?: boolean;
}

export default function CallSessionCard({ callSession, showPatientInfo = true }: CallSessionCardProps) {
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

  // Extract client name from summary or metadata
  const getClientName = () => {
    // First check metadata
    if (callSession.metadata?.clientName) {
      return callSession.metadata.clientName;
    }
    
    // Extract from summary if available
    if (callSession.summary) {
      // Look for patterns like "John Smith called" or "Jane Doe scheduled"
      const nameMatch = callSession.summary.match(/^([A-Z][a-z]+ [A-Z][a-z]+)\s+(called|scheduled|contacted|requested)/);
      if (nameMatch) {
        return nameMatch[1];
      }
      
      // Alternative pattern: "Patient [Name] called"
      const patientMatch = callSession.summary.match(/Patient ([A-Z][a-z]+ [A-Z][a-z]+)/);
      if (patientMatch) {
        return patientMatch[1];
      }
    }
    
    return 'Anonymous Caller';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getClientName()}
            </h3>
            <p className="text-sm text-gray-600">
              {formatPhoneNumber(callSession.clientPhone)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(callSession.status)}`}>
            {callSession.status}
          </span>
          {callSession.metadata?.urgencyLevel && (
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${getUrgencyColor(callSession.metadata.urgencyLevel)}`}></div>
              <span className="text-xs text-gray-600">
                Urgency: {callSession.metadata.urgencyLevel}/10
              </span>
            </div>
          )}
          <DeleteCallButton 
            callId={callSession.id}
            callInfo={{
              clientPhone: callSession.clientPhone,
              startedAt: callSession.startedAt
            }}
            onDeleteSuccess={(deletedCallId) => {
              console.log('Call deleted:', deletedCallId);
            }}
          />
        </div>
      </div>

      {callSession.summary && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">
            {callSession.summary}
          </p>
        </div>
      )}

      {callSession.metadata?.keyTopics && callSession.metadata.keyTopics.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {callSession.metadata.keyTopics.slice(0, 3).map((topic, index) => (
              <span 
                key={index}
                className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {topic}
              </span>
            ))}
            {callSession.metadata.keyTopics.length > 3 && (
              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                +{callSession.metadata.keyTopics.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>
            {new Date(callSession.startedAt).toLocaleDateString()} at{' '}
            {new Date(callSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {callSession.duration && (
            <span>Duration: {formatDuration(callSession.duration)}</span>
          )}
        </div>
        <div className="flex space-x-2">
          {callSession.metadata?.followUpRequired && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              Follow-up Required
            </span>
          )}
          {callSession.metadata?.referralNeeded && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
              Referral Needed
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <Link
            href={`/calls/${callSession.id}`}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View Transcript
          </Link>
          {callSession.recordingUrl && (
            <a
              href={callSession.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Listen to Recording
            </a>
          )}
        </div>
        {(callSession.metadata?.followUpRequired || callSession.metadata?.referralNeeded) && (
          <Link
            href={`/calls/${callSession.id}/notes`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Add Note
          </Link>
        )}
      </div>
    </div>
  );
}
