import { NextRequest, NextResponse } from 'next/server';
import { generateText, streamText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { GradingRequest, GradingResponse, LLMResponse } from '@/types/grading';
import { modelConfig, defaultGradingModel } from '@/lib/models';

// Vercel AI Gateway configuration
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1/ai',
});

async function gradeWithAI(
  userResponse: string,
  questionType: string,
  prompt: string
): Promise<GradingResponse> {
  const startTime = Date.now();
  let firstTokenTime: number | null = null;
  
  try {
    const config = modelConfig[defaultGradingModel];
    
    const gradingPrompt = createGradingPrompt(userResponse, questionType, prompt);
    
    const result = await streamText({
      model: gateway(config.gatewayId),
      prompt: gradingPrompt,
      maxOutputTokens: 800,
      temperature: 0.3, // Lower temperature for more consistent grading
    });

    let fullResponse = '';
    let tokenCount = 0;
    
    // Process the stream to get the response
    for await (const chunk of result.textStream) {
      if (firstTokenTime === null && chunk.length > 0) {
        firstTokenTime = Date.now();
        console.log(`First token arrived after ${firstTokenTime - startTime}ms`);
      }
      
      fullResponse += chunk;
      tokenCount += Math.ceil(chunk.length / 4);
    }
    
    const endTime = Date.now();
    
    if (firstTokenTime === null) {
      firstTokenTime = endTime;
    }
    
    // Get usage data if available
    const usage = await result.usage;
    if (usage?.totalTokens) {
      tokenCount = usage.totalTokens;
    }
    
    console.log(`AI grading completed in ${endTime - startTime}ms with ${tokenCount} tokens`);
    
    // Parse the AI response into structured grades
    return parseAIGradingResponse(fullResponse);
    
  } catch (error) {
    console.error('Error calling AI for grading:', error);
    throw error; // Re-throw to trigger fallback in POST handler
  }
}

function createGradingPrompt(userResponse: string, questionType: string, originalPrompt: string): string {
  const basePrompt = `
You are an expert English language assessor evaluating business English proficiency. 
Evaluate the following response using a 5-point scale (1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent).

ORIGINAL TASK: "${originalPrompt}"
QUESTION TYPE: ${questionType}
USER RESPONSE: "${userResponse}"

Evaluate on these criteria:

1. FLUENCY (1-5): Natural flow, rhythm, and ease of expression
   - Consider sentence variety, transitions, and overall coherence
   - Look for natural-sounding English without awkward phrasing

2. LEXICAL RESOURCE (1-5): Vocabulary range and appropriateness
   - Assess word choice, professional vocabulary usage
   - Consider precision and variety of language

3. GRAMMAR (1-5): Grammatical accuracy and complexity
   - Check sentence structure, verb tenses, articles
   - Consider both accuracy and range of structures used

4. TASK ACHIEVEMENT (1-5): How well the response addresses the specific requirements
`;

  // Add task-specific criteria
  let taskSpecificCriteria = '';
  if (questionType === 'email') {
    taskSpecificCriteria = `
   For EMAIL tasks, check if the response includes:
   - Appropriate greeting and closing
   - Clear explanation of the issue/situation
   - Professional tone and register
   - All required information addressed`;
  } else if (questionType === 'summarize') {
    taskSpecificCriteria = `
   For SUMMARY tasks, check if the response:
   - Captures main points accurately
   - Uses appropriate length (concise but complete)
   - Demonstrates understanding of key concepts
   - Uses own words rather than copying text`;
  } else if (questionType === 'dictation') {
    taskSpecificCriteria = `
   For DICTATION tasks, check:
   - Accuracy of transcription
   - Correct spelling and punctuation
   - Proper capitalization
   - Complete sentences captured`;
  }

  const outputFormat = `
${taskSpecificCriteria}

Provide your assessment in this EXACT format:
FLUENCY: [score 1-5]
LEXICAL: [score 1-5]
GRAMMAR: [score 1-5]
TASK: [score 1-5]
FEEDBACK: [2-3 sentences of specific, constructive feedback highlighting strengths and areas for improvement]

Be precise with scoring - use the full 1-5 range appropriately.`;

  return basePrompt + outputFormat;
}

function parseAIGradingResponse(aiResponse: string): GradingResponse {
  try {
    // Extract scores using regex patterns
    const fluencyMatch = aiResponse.match(/FLUENCY:\s*(\d+(?:\.\d+)?)/i);
    const lexicalMatch = aiResponse.match(/LEXICAL:\s*(\d+(?:\.\d+)?)/i);
    const grammarMatch = aiResponse.match(/GRAMMAR:\s*(\d+(?:\.\d+)?)/i);
    const taskMatch = aiResponse.match(/TASK:\s*(\d+(?:\.\d+)?)/i);
    const feedbackMatch = aiResponse.match(/FEEDBACK:\s*([\s\S]+?)(?:\n\n|$)/i);
    
    // Parse scores with validation
    const fluency = Math.min(5, Math.max(1, fluencyMatch ? parseFloat(fluencyMatch[1]) : 3));
    const lexical = Math.min(5, Math.max(1, lexicalMatch ? parseFloat(lexicalMatch[1]) : 3));
    const grammar = Math.min(5, Math.max(1, grammarMatch ? parseFloat(grammarMatch[1]) : 3));
    const task = Math.min(5, Math.max(1, taskMatch ? parseFloat(taskMatch[1]) : 3));
    
    let feedback = feedbackMatch ? feedbackMatch[1].trim() : 'Assessment completed successfully.';
    
    // Clean up feedback - remove any remaining formatting artifacts
    feedback = feedback.replace(/^[\[\]"']+|[\[\]"']+$/g, '').trim();
    
    return {
      fluency: Math.round(fluency * 2) / 2, // Round to nearest 0.5
      lexical: Math.round(lexical * 2) / 2,
      grammar: Math.round(grammar * 2) / 2,
      task: Math.round(task * 2) / 2,
      feedback
    };
  } catch (error) {
    console.error('Error parsing AI grading response:', error);
    console.log('Raw AI response:', aiResponse);
    
    // Return fallback scores if parsing fails
    return {
      fluency: 3,
      lexical: 3,
      grammar: 3,
      task: 3,
      feedback: 'Unable to parse detailed assessment. Please try again.'
    };
  }
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

    // Use AI grading with actual LLM
    const gradingResult = await gradeWithAI(userResponse, questionType, prompt);

    return NextResponse.json(gradingResult);
  } catch (error) {
    console.error('Grading error:', error);
    // Fallback to mock grading if AI fails
    console.log('AI grading failed, falling back to mock grading');
    try {
      const { userResponse: fallbackUserResponse, questionType: fallbackQuestionType, prompt: fallbackPrompt } = await request.json();
      const fallbackResult = await simulateAIGrading(fallbackUserResponse, fallbackQuestionType, fallbackPrompt);
      return NextResponse.json(fallbackResult);
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}

async function simulateAIGrading(
  userResponse: string, 
  questionType: string, 
  _prompt: string
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
  _wordCount: number
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
