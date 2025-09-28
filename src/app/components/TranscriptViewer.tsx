'use client';

import { VapiTranscriptEntry } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

interface TranscriptViewerProps {
  transcripts: VapiTranscriptEntry[];
  showTimestamps?: boolean;
  showConfidence?: boolean;
  showEmotions?: boolean;
}

export default function TranscriptViewer({ 
  transcripts, 
  showTimestamps = true, 
  showConfidence = false,
  showEmotions = true 
}: TranscriptViewerProps) {
  if (transcripts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>No transcript available for this call session.</p>
      </div>
    );
  }

  const getSpeakerIcon = (speaker: 'user' | 'assistant') => {
    if (speaker === 'assistant') {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    }
  };

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Conversation Transcript
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 rounded-full mr-2"></div>
            AI Assistant
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 rounded-full mr-2"></div>
            Client
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {transcripts.map((entry, index) => (
          <div 
            key={entry.id}
            className={`flex space-x-3 ${
              entry.speaker === 'assistant' ? 'justify-start' : 'justify-start'
            }`}
          >
            {getSpeakerIcon(entry.speaker)}
            
            <div className="flex-1 min-w-0">
              <div className={`inline-block p-3 rounded-lg max-w-3xl ${
                entry.speaker === 'assistant' 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'bg-gray-50 text-gray-900'
              }`}>
                <p className="text-sm leading-relaxed">{entry.text}</p>
                
                {/* Metadata row */}
                <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                  <div className="flex items-center space-x-2">
                    {showTimestamps && (
                      <span>
                        {new Date(entry.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    )}
                    
                    {showConfidence && entry.confidence && (
                      <span className={`${getConfidenceColor(entry.confidence)}`}>
                        {Math.round(entry.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>

                  {/* Emotions */}
                  {showEmotions && entry.emotions && (
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 rounded text-xs ${getSentimentColor(entry.emotions.sentiment)}`}>
                        {entry.emotions.sentiment}
                      </span>
                      {entry.emotions.emotions && entry.emotions.emotions.length > 0 && (
                        <div className="flex space-x-1">
                          {entry.emotions.emotions.slice(0, 2).map((emotion, idx) => (
                            <span 
                              key={idx}
                              className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                            >
                              {emotion}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
