import { NextRequest, NextResponse } from 'next/server';
import { 
  findVapiCallSessionById, 
  getTranscriptsByCallSession,
  getTherapistNotesByCallSession 
} from '@/lib/dummy-data';
import { 
  getCallSessionById, 
  getTranscriptsByCallId,
  getTherapistNotes 
} from '@/lib/call-processor';

// GET /api/vapi/calls/[id] - Get specific call session with transcripts and notes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get real call session only (no dummy data fallback)
    const callSession = getCallSessionById(params.id);
    
    if (!callSession) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Call session not found' 
        },
        { status: 404 }
      );
    }

    const transcripts = getTranscriptsByCallId(params.id);
    const allTherapistNotes = getTherapistNotes();
    const therapistNotes = allTherapistNotes.filter(note => note.callSessionId === params.id);

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
