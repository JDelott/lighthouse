// Test transcripts based on the patterns we expect
const testCases = [
  {
    description: "Example from user - Jacob Bilott",
    summary: "Jacob Bilott, a new client referral, called to schedule a therapy appointment with Nick for next week. He provided his phone number, 9402933160, for Nick to call him back and confirm the appointment. The AI assistant confirmed Nick would follow up shortly.",
    expectedName: "Jacob Bilott"
  },
  {
    description: "Sarah Johnson from dummy data",
    transcript: "Sure, it's Sarah Johnson, and my phone number is 555-123-4567.",
    expectedName: "Sarah Johnson"
  },
  {
    description: "Simple introduction",
    transcript: "Hi, my name is John Smith and I'd like to schedule an appointment.",
    expectedName: "John Smith"
  },
  {
    description: "This is pattern",
    transcript: "This is Jane Doe calling about scheduling therapy.",
    expectedName: "Jane Doe"
  },
  {
    description: "No name present",
    transcript: "I'd like to schedule an appointment for next week please.",
    expectedName: undefined
  }
];

// Helper function to extract client name from transcript (copied from vapi-api.ts)
function extractClientNameFromTranscript(transcript) {
  if (!transcript) return undefined;
  
  // Common patterns for name extraction from therapy appointment calls
  const patterns = [
    // "Hi, my name is John Smith" or "My name is Jane Doe"
    /(?:hi|hello),?\s*(?:my\s+name\s+is|i'm|i\s+am)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    // "This is John Smith calling" or "John Smith here"
    /(?:this\s+is|it's)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s+calling|\s+here|\s+about)?/i,
    // "I'm calling for John Smith" or direct name mention
    /(?:i'm\s+calling\s+for|calling\s+for|my\s+name\s+is)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    // "Jacob Bilott" at the start of a sentence (as in the example)
    /^([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(?:a\s+new\s+client|called|is\s+calling)/i,
    // Name followed by common appointment phrases
    /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:,\s*(?:a\s+new\s+client|called|is\s+calling|wants\s+to\s+schedule))/i,
    // "Sure, it's [Name]" pattern
    /(?:sure|yes),?\s+it's\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Basic validation - should be 2-4 words, each starting with capital
      const words = name.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && 
          words.every(word => /^[A-Z][a-z]+$/.test(word))) {
        return name;
      }
    }
  }
  
  return undefined;
}

// Helper function for summary extraction (copied from CallSessionCard.tsx)
function extractClientNameFromSummary(summary) {
  if (!summary) return undefined;
  
  // Common patterns for name extraction from AI-generated summaries
  const patterns = [
    // "Jacob Bilott, a new client referral, called" - matches your example
    /^([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(?:a\s+new\s+client|called|is\s+calling|contacted|scheduled)/i,
    // "John Smith called" or "Jane Doe scheduled"
    /^([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(called|scheduled|contacted|requested)/i,
    // "Patient [Name] called"
    /Patient\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    // "Client [Name] requested"
    /Client\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    // "[Name] is seeking" or "[Name] wants to"
    /^([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:is\s+seeking|wants\s+to|needs\s+to|would\s+like)/i,
    // More flexible pattern for names at the beginning
    /^([A-Z][a-z]+\s+[A-Z][a-z]+)[\s,]/
  ];
  
  for (const pattern of patterns) {
    const match = summary.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Basic validation - should be 2-4 words, each starting with capital
      const words = name.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && 
          words.every(word => /^[A-Z][a-z]+$/.test(word))) {
        return name;
      }
    }
  }
  
  return undefined;
}

console.log('🧪 Testing Client Name Extraction\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.description}`);
  
  let extractedName;
  if (testCase.transcript) {
    extractedName = extractClientNameFromTranscript(testCase.transcript);
    console.log(`  Input (transcript): "${testCase.transcript}"`);
  } else if (testCase.summary) {
    extractedName = extractClientNameFromSummary(testCase.summary);
    console.log(`  Input (summary): "${testCase.summary}"`);
  }
  
  console.log(`  Expected: ${testCase.expectedName || 'undefined'}`);
  console.log(`  Extracted: ${extractedName || 'undefined'}`);
  
  const success = extractedName === testCase.expectedName;
  console.log(`  Result: ${success ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('🏁 Test completed');
