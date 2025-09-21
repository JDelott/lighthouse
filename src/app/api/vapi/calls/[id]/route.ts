import { NextRequest, NextResponse } from 'next/server';
import { 
  findVapiCallSessionById, 
  getTranscriptsByCallSession,
  getTherapistNotesByCallSession 
} from '@/lib/dummy-data';

// GET /api/vapi/calls/[id] - Get specific call session with transcripts and notes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const callSession = findVapiCallSessionById(params.id);
    
    if (!callSession) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Call session not found' 
        },
        { status: 404 }
      );
    }

    const transcripts = getTranscriptsByCallSession(params.id);
    const therapistNotes = getTherapistNotesByCallSession(params.id);

    return NextResponse.json({
      success: true,
      data: {
        callSession,
        transcripts,
        therapistNotes,
        stats: {
          transcriptCount: transcripts.length,
          noteCount: therapistNotes.length,
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
