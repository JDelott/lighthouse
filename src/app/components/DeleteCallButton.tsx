'use client';

import { useState } from 'react';

interface DeleteCallButtonProps {
  callId: string;
  callInfo?: {
    clientPhone?: string;
    startedAt?: string;
  };
  onDeleteSuccess?: (callId: string) => void;
  className?: string;
}

export default function DeleteCallButton({ 
  callId, 
  callInfo, 
  onDeleteSuccess, 
  className = '' 
}: DeleteCallButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      // Auto-cancel after 10 seconds if no action taken
      setTimeout(() => {
        setShowConfirm(false);
      }, 10000);
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log('🗑️ Deleting call:', callId);
      
      const response = await fetch(`/api/calls/${callId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Call deleted successfully:', result.data);
        console.log(`📊 Remaining calls: ${result.data.remainingCalls}`);
        
        // Show success message briefly
        const successMsg = `Call deleted successfully. ${result.data.remainingCalls} calls remaining.`;
        
        // Call the success callback
        if (onDeleteSuccess) {
          onDeleteSuccess(callId);
        }
        
        // Show success and refresh
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } else {
        console.error('❌ Delete failed:', result.message);
        
        // Show user-friendly error messages
        let errorMsg = 'Failed to delete call';
        if (result.message.includes('not found')) {
          errorMsg = 'Call not found or already deleted';
        } else if (result.message.includes('access denied')) {
          errorMsg = 'You do not have permission to delete this call';
        } else {
          errorMsg = result.message;
        }
        
        alert(errorMsg);
      }
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Network error occurred while deleting call. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Delete this call?</p>
              {callInfo?.clientPhone && (
                <p className="text-xs text-red-600 mt-1">
                  {callInfo.clientPhone} • {callInfo.startedAt ? new Date(callInfo.startedAt).toLocaleDateString() : ''}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="bg-gray-200 text-gray-700 px-3 py-1 text-xs rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`
        p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title="Delete call"
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
        />
      </svg>
    </button>
  );
}
