import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint is accessible!',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: 'GET'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🧪 Test webhook received:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook test successful!',
      timestamp: new Date().toISOString(),
      receivedData: body
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Webhook test failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 400 });
  }
}
