import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook Forwarder - Receives Vapi webhooks and forwards them to both local and production
 * This allows 1:1 mirroring of calls to both environments for testing
 */

const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/vapi/webhook';
const PRODUCTION_WEBHOOK_URL = 'https://lighthouse-16ze.vercel.app/api/vapi/webhook';

export async function POST(request: NextRequest) {
  try {
    // Get the webhook payload
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('🔄 Webhook forwarder received call, forwarding to both environments...');
    console.log('📦 Payload size:', payload.length, 'bytes');
    
    // Forward to both local and production simultaneously
    const forwardPromises = [
      forwardToEndpoint(LOCAL_WEBHOOK_URL, payload, headers, 'LOCAL'),
      forwardToEndpoint(PRODUCTION_WEBHOOK_URL, payload, headers, 'PRODUCTION')
    ];
    
    // Wait for both forwards to complete
    const results = await Promise.allSettled(forwardPromises);
    
    // Log results
    results.forEach((result, index) => {
      const target = index === 0 ? 'LOCAL' : 'PRODUCTION';
      if (result.status === 'fulfilled') {
        console.log(`✅ ${target} forward successful:`, result.value);
      } else {
        console.error(`❌ ${target} forward failed:`, result.reason);
      }
    });
    
    // Return success if at least one forward succeeded
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    if (successCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Webhook forwarded to ${successCount}/2 endpoints`,
        results: {
          local: results[0].status === 'fulfilled' ? 'success' : 'failed',
          production: results[1].status === 'fulfilled' ? 'success' : 'failed'
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'All webhook forwards failed',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Webhook forwarder error:', error);
    return NextResponse.json({
      success: false,
      message: 'Webhook forwarder internal error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function forwardToEndpoint(
  url: string, 
  payload: string, 
  originalHeaders: Record<string, string>,
  target: string
): Promise<string> {
  try {
    console.log(`📤 Forwarding to ${target}: ${url}`);
    
    // Prepare headers for forwarding (exclude hop-by-hop headers)
    const forwardHeaders: Record<string, string> = {};
    
    // Copy relevant headers
    const headersToForward = [
      'content-type',
      'x-vapi-signature',
      'user-agent',
      'authorization'
    ];
    
    headersToForward.forEach(header => {
      if (originalHeaders[header]) {
        forwardHeaders[header] = originalHeaders[header];
      }
    });
    
    // Add forwarder identification
    forwardHeaders['x-forwarded-by'] = 'lighthouse-webhook-forwarder';
    forwardHeaders['x-original-host'] = originalHeaders['host'] || 'unknown';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: forwardHeaders,
      body: payload,
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000)
    });
    
    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ ${target} responded:`, response.status, responseText.substring(0, 100));
      return `${target}: ${response.status} OK`;
    } else {
      console.error(`❌ ${target} error:`, response.status, responseText);
      throw new Error(`${target}: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error(`❌ ${target} forward failed:`, error);
    throw new Error(`${target}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// GET endpoint for testing the forwarder
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const test = url.searchParams.get('test');
  
  if (test === 'endpoints') {
    // Test connectivity to both endpoints
    try {
      console.log('🧪 Testing webhook forwarder endpoints...');
      
      const testPayload = JSON.stringify({
        type: 'test',
        message: 'Webhook forwarder connectivity test',
        timestamp: new Date().toISOString()
      });
      
      const results = await Promise.allSettled([
        testEndpoint(LOCAL_WEBHOOK_URL, 'LOCAL'),
        testEndpoint(PRODUCTION_WEBHOOK_URL, 'PRODUCTION')
      ]);
      
      return NextResponse.json({
        success: true,
        message: 'Webhook forwarder endpoint test completed',
        endpoints: {
          local: {
            url: LOCAL_WEBHOOK_URL,
            status: results[0].status === 'fulfilled' ? 'reachable' : 'unreachable',
            result: results[0].status === 'fulfilled' ? results[0].value : results[0].reason
          },
          production: {
            url: PRODUCTION_WEBHOOK_URL,
            status: results[1].status === 'fulfilled' ? 'reachable' : 'unreachable',
            result: results[1].status === 'fulfilled' ? results[1].value : results[1].reason
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Endpoint test failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  }
  
  return NextResponse.json({
    success: true,
    message: 'Webhook forwarder is active',
    endpoints: {
      local: LOCAL_WEBHOOK_URL,
      production: PRODUCTION_WEBHOOK_URL
    },
    usage: 'POST webhook events here to forward to both endpoints',
    test: 'Add ?test=endpoints to test connectivity',
    timestamp: new Date().toISOString()
  });
}

async function testEndpoint(url: string, target: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    return `${target}: ${response.status} ${response.statusText}`;
  } catch (error) {
    throw `${target}: ${error instanceof Error ? error.message : String(error)}`;
  }
}
