import { NextRequest, NextResponse } from 'next/server';

interface GradingRequest {
  userResponse: string;
  questionType: string;
  prompt: string;
}

interface GradingResponse {
  fluency: number;
  lexical: number;
  grammar: number;
  task: number;
  feedback: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userResponse, questionType, prompt }: GradingRequest = await request.json();

    if (!userResponse || !questionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, we'll simulate the AI grading with a more sophisticated mock
    // In production, this would call your LLM API with the specific rubric
    const gradingResult = await simulateAIGrading(userResponse, questionType, prompt);

    return NextResponse.json(gradingResult);
  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function simulateAIGrading(
  userResponse: string, 
  questionType: string, 
  prompt: string
): Promise<GradingResponse> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Basic analysis for more realistic scoring
  const wordCount = userResponse.trim().split(/\s+/).length;
  const sentenceCount = userResponse.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  
  // Check for professional vocabulary
  const professionalWords = [
    'professional', 'apologize', 'deadline', 'client', 'technical', 'delivery',
    'performance', 'expectations', 'management', 'strategy', 'analysis', 'implementation'
  ];
  const professionalWordCount = professionalWords.filter(word => 
    userResponse.toLowerCase().includes(word)
  ).length;

  // Scoring logic based on content analysis
  let fluency = 3;
  let lexical = 3;
  let grammar = 3;
  let task = 3;

  // Fluency scoring
  if (avgWordsPerSentence > 8 && avgWordsPerSentence < 25) fluency += 1;
  if (sentenceCount >= 3) fluency += 1;
  if (fluency > 5) fluency = 5;

  // Lexical scoring
  if (professionalWordCount >= 2) lexical += 1;
  if (wordCount >= 50) lexical += 1;
  if (lexical > 5) lexical = 5;

  // Grammar scoring (basic checks)
  const hasCapitalization = /^[A-Z]/.test(userResponse.trim());
  const hasProperPunctuation = /[.!?]$/.test(userResponse.trim());
  if (hasCapitalization) grammar += 1;
  if (hasProperPunctuation) grammar += 1;
  if (grammar > 5) grammar = 5;

  // Task achievement scoring based on question type
  if (questionType === 'email') {
    const hasApology = /sorry|apologize|regret/i.test(userResponse);
    const hasExplanation = /technical|issue|problem|delay/i.test(userResponse);
    const hasNewDate = /friday|date|deadline/i.test(userResponse);
    
    if (hasApology) task += 1;
    if (hasExplanation) task += 1;
    if (hasNewDate) task += 1;
  } else if (questionType === 'summarize') {
    const hasKeyTerms = /ai|artificial intelligence|supply chain|inventory|cost/i.test(userResponse);
    if (hasKeyTerms) task += 1;
    if (wordCount >= 30 && wordCount <= 100) task += 1;
  } else if (questionType === 'dictation') {
    const targetPhrase = "quarterly earnings exceeded expectations due to strong performance in the apac region";
    const similarity = calculateSimilarity(userResponse.toLowerCase(), targetPhrase);
    if (similarity > 0.8) task = 5;
    else if (similarity > 0.6) task = 4;
    else if (similarity > 0.4) task = 3;
  }
  
  if (task > 5) task = 5;

  // Generate contextual feedback
  const feedback = generateFeedback(fluency, lexical, grammar, task, questionType, wordCount);

  return {
    fluency,
    lexical,
    grammar,
    task,
    feedback
  };
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}

function generateFeedback(
  fluency: number, 
  lexical: number, 
  grammar: number, 
  task: number, 
  questionType: string,
  wordCount: number
): string {
  const feedbacks = [];

  if (fluency >= 4) {
    feedbacks.push("Well-structured and coherent response");
  } else {
    feedbacks.push("Consider improving sentence flow and organization");
  }

  if (lexical >= 4) {
    feedbacks.push("good use of professional vocabulary");
  } else {
    feedbacks.push("expand vocabulary range for enhanced impact");
  }

  if (grammar >= 4) {
    feedbacks.push("strong grammatical accuracy");
  } else {
    feedbacks.push("review grammar and sentence structure");
  }

  if (task >= 4) {
    feedbacks.push("effectively addresses the task requirements");
  } else {
    if (questionType === 'email') {
      feedbacks.push("ensure all email components are included (apology, explanation, new date)");
    } else if (questionType === 'summarize') {
      feedbacks.push("focus on capturing key points more comprehensively");
    } else {
      feedbacks.push("better alignment with task objectives needed");
    }
  }

  return feedbacks.join(", ") + ".";
}
