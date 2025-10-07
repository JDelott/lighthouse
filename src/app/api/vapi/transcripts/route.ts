import { NextRequest, NextResponse } from 'next/server';
import { realTranscripts, getTranscriptsByCallId } from '@/lib/call-processor';

// GET /api/vapi/transcripts - Get transcripts with filtering
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const callSessionId = url.searchParams.get('callSessionId');
    const speaker = url.searchParams.get('speaker') as 'user' | 'assistant' | null;
    const limit = url.searchParams.get('limit');

    // Get real transcripts only (no dummy data)
    let transcripts = realTranscripts;

    // Filter by call session
    if (callSessionId) {
      transcripts = getTranscriptsByCallId(callSessionId);
    }

    // Filter by speaker
    if (speaker && ['user', 'assistant'].includes(speaker)) {
      transcripts = transcripts.filter(t => t.speaker === speaker);
    }

    // Sort by timestamp
    transcripts = transcripts.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        transcripts = transcripts.slice(0, limitNum);
      }
    }

    return NextResponse.json({
      success: true,
      data: transcripts,
      total: transcripts.length,
      filters: {
        callSessionId,
        speaker,
        limit: limit ? parseInt(limit) : undefined
      }
    });

  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch transcripts' 
      },
      { status: 500 }
    );
  }
}
