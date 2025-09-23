'use client';

import { useState } from 'react';

interface RefreshButtonProps {
  onRefresh?: () => void;
  className?: string;
}

export default function RefreshButton({ onRefresh, className = '' }: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    
    try {
      // Sync latest call from API
      const response = await fetch('/api/sync-latest-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Synced:', result.data?.isNewCall ? 'New call' : 'Updated call');
      }
      
      // Call the refresh callback
      if (onRefresh) {
        onRefresh();
      }
      
      // Refresh the page
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Sync error:', error);
      // Still refresh the page to show any existing data
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading}
      className={`
        p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 disabled:opacity-50
        ${className}
      `}
      title="Sync latest calls"
    >
      <svg 
        className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    </button>
  );
}
