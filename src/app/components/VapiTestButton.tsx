'use client';

import { useState } from 'react';
import { config } from '@/lib/config';

export default function VapiTestButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testVapiWebhook = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      const response = await fetch('/api/vapi/webhook', {
        method: 'GET',
      });
      
      const data = await response.json();
      setTestResult(`✅ Webhook endpoint active: ${data.message}`);
    } catch (error) {
      setTestResult(`❌ Webhook test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testVapiCallsAPI = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      const response = await fetch('/api/vapi/calls');
      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ Calls API working: ${data.total} call sessions found`);
      } else {
        setTestResult(`❌ Calls API error: ${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Calls API test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Hide in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Vapi Integration Test</h3>
      
      <div className="space-y-2 mb-3">
        <div className="text-xs text-gray-600">
          <strong>Phone:</strong> {config.vapi.phoneNumber}
        </div>
        <div className="text-xs text-gray-600">
          <strong>Assistant ID:</strong> {config.vapi.assistantId || 'Not set'}
        </div>
        <div className="text-xs text-gray-600">
          <strong>Public Key:</strong> {config.vapi.publicKey ? '✅ Set' : '❌ Missing'}
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={testVapiWebhook}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Webhook'}
        </button>
        
        <button
          onClick={testVapiCallsAPI}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Calls API'}
        </button>
      </div>
      
      {testResult && (
        <div className="mt-2 text-xs p-2 bg-gray-100 rounded">
          {testResult}
        </div>
      )}
    </div>
  );
}
