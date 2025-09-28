'use client';

import { VapiCallSession } from '@/lib/types';
import { formatDuration, formatPhoneNumber } from '@/lib/utils';
import Link from 'next/link';
import DeleteCallButton from './DeleteCallButton';

interface CallSessionCardProps {
  callSession: VapiCallSession;
  showPatientInfo?: boolean;
  onDeleteSuccess?: (callId: string) => void;
}

export default function CallSessionCard({ callSession, showPatientInfo = true, onDeleteSuccess }: CallSessionCardProps) {
  const getStatusColor = (status: VapiCallSession['status']) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        // "Jacob Bilott, a new client referral, called" - matches your example
        /^([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(?:a\s+new\s+client|called|is\s+calling|contacted|scheduled)/i,
        // "John Smith called" or "Jane Doe scheduled"
        /^([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(called|scheduled|contacted|requested)/i,
        // "Patient [Name] called"
        /Patient\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
        // "Client [Name] requested"
        /Client\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
        // "[Name] is seeking" or "[Name] wants to"
        /^([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:is\s+seeking|wants\s+to|needs\s+to|would\s+like)/i,
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
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
          {callSession.status !== 'completed' && (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(callSession.status)}`}>
              {callSession.status}
            </span>
          )}
          <DeleteCallButton 
            callId={callSession.id}
            callInfo={{
              clientPhone: callSession.clientPhone,
              startedAt: callSession.startedAt
            }}
            onDeleteSuccess={(deletedCallId) => {
              console.log('Call deleted:', deletedCallId);
              // Call parent callback if provided
              if (onDeleteSuccess) {
                onDeleteSuccess(deletedCallId);
              }
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
