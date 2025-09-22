import { NextRequest, NextResponse } from 'next/server';
import { testAnthropicAPI } from '@/lib/call-processor';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Anthropic API integration...');
    
    const result = await testAnthropicAPI();
    
    if (result.success) {
      console.log('✅', result.message);
      return NextResponse.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌', result.message, result.error);
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Error testing Anthropic API:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error while testing Anthropic API',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
