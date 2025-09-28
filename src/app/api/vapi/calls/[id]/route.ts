import { NextRequest, NextResponse } from 'next/server';
import { 
  getCallSessionById, 
  getTranscriptsByCallId
} from '@/lib/database';
import { VapiTranscriptEntry } from '@/lib/types';

// Parse transcript text into conversation turns
function parseTranscriptIntoTurns(transcript: string, callSessionId: string): VapiTranscriptEntry[] {
  const turns: VapiTranscriptEntry[] = [];
  
  // Split by common patterns that indicate speaker changes
  const segments = transcript.split(/(?:AI:|User:|Assistant:|Caller:)/i).filter(segment => segment.trim());
  
  // More sophisticated parsing - look for "AI:" and "User:" patterns
  const lines = transcript.split(/\n|\. (?=(?:AI|User|Assistant|Caller):)/i);
  let currentSpeaker: 'assistant' | 'user' = 'assistant';
  let turnIndex = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check if line starts with speaker indicator
    if (trimmedLine.match(/^(AI|Assistant):/i)) {
      currentSpeaker = 'assistant';
      const text = trimmedLine.replace(/^(AI|Assistant):\s*/i, '').trim();
      if (text) {
        turns.push({
          id: `transcript-${callSessionId}-${turnIndex++}`,
          callSessionId,
          speaker: currentSpeaker,
          text,
          timestamp: new Date().toISOString(),
          confidence: 1.0
        });
      }
    } else if (trimmedLine.match(/^(User|Caller):/i)) {
      currentSpeaker = 'user';
      const text = trimmedLine.replace(/^(User|Caller):\s*/i, '').trim();
      if (text) {
        turns.push({
          id: `transcript-${callSessionId}-${turnIndex++}`,
          callSessionId,
          speaker: currentSpeaker,
          text,
          timestamp: new Date().toISOString(),
          confidence: 1.0
        });
      }
    } else if (trimmedLine.length > 0) {
      // Continue with current speaker if no explicit indicator
      turns.push({
        id: `transcript-${callSessionId}-${turnIndex++}`,
        callSessionId,
        speaker: currentSpeaker,
        text: trimmedLine,
        timestamp: new Date().toISOString(),
        confidence: 1.0
      });
    }
  }
  
  return turns;
}

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
    
    // If no separate transcript entries but call has transcript text, parse it into turns
    if (transcripts.length === 0 && callSession.transcript) {
      transcripts = parseTranscriptIntoTurns(callSession.transcript, id);
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
