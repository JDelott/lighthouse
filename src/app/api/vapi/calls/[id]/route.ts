import { NextRequest, NextResponse } from 'next/server';
import { 
  getCallSessionById, 
  getTranscriptsByCallId
} from '@/lib/database';

// GET /api/vapi/calls/[id] - Get specific call session with transcripts and notes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get real call session from database
    const callSession = await getCallSessionById(id);
    
    if (!callSession) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Call session not found' 
        },
        { status: 404 }
      );
    }

    // Get transcripts from database
    let transcripts = await getTranscriptsByCallId(id);
    
    // If no separate transcript entries but call has transcript text, create a single entry
    if (transcripts.length === 0 && callSession.transcript) {
      transcripts = [{
        id: `transcript-${id}-full`,
        callSessionId: id,
        speaker: 'user', // Default to user, or we could parse this
        text: callSession.transcript,
        timestamp: callSession.startedAt,
        confidence: 1.0
      }];
    }

    return NextResponse.json({
      success: true,
      data: {
        callSession,
        transcripts,
        therapistNotes: [], // Empty for now, can add later if needed
        stats: {
          transcriptCount: transcripts.length,
          noteCount: 0,
          averageConfidence: transcripts.length > 0 
            ? transcripts.reduce((sum, t) => sum + (t.confidence || 0), 0) / transcripts.length
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching call session details:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch call session details' 
      },
      { status: 500 }
    );
  }
}
