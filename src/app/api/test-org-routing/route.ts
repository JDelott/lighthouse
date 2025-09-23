import { NextRequest, NextResponse } from 'next/server';
import { OrganizationResolver } from '@/lib/organization-resolver';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const assistantId = url.searchParams.get('assistantId') || '800c2d31-7d49-4744-a35c-6326610d760c';
    const phoneNumber = url.searchParams.get('phoneNumber') || '+12763838050';
    
    console.log('🧪 Testing organization routing...');
    
    // Test all resolution methods
    const results = {
      assistantIdResolution: await OrganizationResolver.getByAssistantId(assistantId),
      phoneNumberResolution: await OrganizationResolver.getByPhoneNumber(phoneNumber),
      urlParamResolution: OrganizationResolver.getFromUrlParams(request),
      defaultOrganization: await OrganizationResolver.getDefaultOrganization(),
      fullResolution: await OrganizationResolver.resolve({
        assistantId,
        phoneNumber,
        request,
        fallbackToDefault: true
      })
    };
    
    return NextResponse.json({
      success: true,
      message: 'Organization routing test completed',
      testInputs: {
        assistantId,
        phoneNumber,
        urlParams: Object.fromEntries(url.searchParams.entries())
      },
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error testing organization routing:', error);
    return NextResponse.json({
      success: false,
      message: 'Organization routing test failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, assistantId, phoneNumber } = body;
    
    if (!organizationId) {
      return NextResponse.json({
        success: false,
        message: 'Organization ID is required'
      }, { status: 400 });
    }
    
    console.log('🔧 Updating organization Vapi configuration...');
    
    const success = await OrganizationResolver.updateVapiConfig(organizationId, {
      assistantId,
      phoneNumber
    });
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Organization Vapi configuration updated successfully',
        organizationId,
        config: { assistantId, phoneNumber },
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to update organization configuration'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error updating organization configuration:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update organization configuration',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
