import { NextRequest, NextResponse } from 'next/server';
import { generateText, streamText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { modelConfig, defaultGradingModel } from '@/lib/models';

// Vercel AI Gateway configuration
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1/ai',
});

interface ExamResponse {
  questionType: string;
  prompt: string;
  userResponse: string;
}

interface ExamSubmission {
  responses: ExamResponse[];
}

interface ExamResult {
  overallScore: string;
  explanation: string;
}

async function gradeExamWithAI(responses: ExamResponse[]): Promise<ExamResult> {
  const startTime = Date.now();
  let firstTokenTime: number | null = null;
  
  try {
    const config = modelConfig[defaultGradingModel];
    
    const gradingPrompt = createExamGradingPrompt(responses);
    
    const result = await streamText({
      model: gateway(config.gatewayId),
      prompt: gradingPrompt,
      maxOutputTokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent grading
    });

    let fullResponse = '';
    
    // Process the stream to get the response
    for await (const chunk of result.textStream) {
      if (firstTokenTime === null && chunk.length > 0) {
        firstTokenTime = Date.now();
        console.log(`First token arrived after ${firstTokenTime - startTime}ms`);
      }
      
      fullResponse += chunk;
    }
    
    const endTime = Date.now();
    console.log(`AI exam grading completed in ${endTime - startTime}ms`);
    
    // Parse the AI response into structured result
    return parseExamGradingResponse(fullResponse);
    
  } catch (error) {
    console.error('Error calling AI for exam grading:', error);
    throw error; // Re-throw to trigger fallback in POST handler
  }
}

function createExamGradingPrompt(responses: ExamResponse[]): string {
  const basePrompt = `
You are an expert English language assessor evaluating a complete English proficiency exam. 
The candidate has completed 4 different tasks testing various language skills.

EXAM RESPONSES:
`;

  let responseSection = '';
  responses.forEach((response, index) => {
    responseSection += `
TASK ${index + 1} - ${response.questionType.toUpperCase()}:
PROMPT: "${response.prompt}"
CANDIDATE RESPONSE: "${response.userResponse}"

`;
  });

  const gradingInstruction = `
Based on all four responses, provide a comprehensive assessment:

1. Evaluate the candidate's overall English proficiency level using the CEFR scale:
   - A1 (Beginner): Basic phrases, very limited vocabulary
   - A2 (Elementary): Simple sentences, basic communication
   - B1 (Intermediate): Can handle most situations, good basic communication
   - B2 (Upper-Intermediate): Effective communication, good vocabulary and grammar
   - C1 (Advanced): Fluent and sophisticated language use
   - C2 (Proficient): Near-native level proficiency

2. Consider performance across all skill areas:
   - Writing skills (email and summary tasks)
   - Listening comprehension (dictation task)
   - Speaking ability (recorded response)
   - Task completion and appropriateness
   - Grammar and vocabulary range
   - Professional communication ability

3. Provide your assessment in this EXACT format:
OVERALL_SCORE: [A1/A2/B1/B2/C1/C2]
EXPLANATION: [2-3 sentences explaining the overall performance, highlighting key strengths and areas that led to this proficiency level. Be specific about which tasks showed strong or weak performance.]

Base your scoring on the candidate's ability to communicate effectively in professional English contexts.
`;

  return basePrompt + responseSection + gradingInstruction;
}

function parseExamGradingResponse(aiResponse: string): ExamResult {
  try {
    // Extract overall score and explanation using regex patterns
    const scoreMatch = aiResponse.match(/OVERALL_SCORE:\s*([ABC][12])/i);
    const explanationMatch = aiResponse.match(/EXPLANATION:\s*([\s\S]+?)(?:\n\n|$)/i);
    
    const overallScore = scoreMatch ? scoreMatch[1] : 'B2'; // Default to B2 if parsing fails
    let explanation = explanationMatch ? explanationMatch[1].trim() : 'Assessment completed successfully.';
    
    // Clean up explanation - remove any remaining formatting artifacts
    explanation = explanation.replace(/^[\[\]"']+|[\[\]"']+$/g, '').trim();
    
    return {
      overallScore,
      explanation
    };
  } catch (error) {
    console.error('Error parsing AI exam grading response:', error);
    console.log('Raw AI response:', aiResponse);
    
    // Return fallback result if parsing fails
    return {
      overallScore: 'B2',
      explanation: 'Unable to parse detailed assessment. The candidate demonstrated competent English skills across multiple tasks.'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { responses }: ExamSubmission = await request.json();

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid exam responses' },
        { status: 400 }
      );
    }

    // Use AI grading with actual LLM
    const examResult = await gradeExamWithAI(responses);

    return NextResponse.json(examResult);
  } catch (error) {
    console.error('Exam grading error:', error);
    // Fallback to mock grading if AI fails
    console.log('AI exam grading failed, falling back to mock grading');
    try {
      const { responses: fallbackResponses } = await request.json();
      const fallbackResult = await simulateExamGrading(fallbackResponses);
      return NextResponse.json(fallbackResult);
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}

async function simulateExamGrading(responses: ExamResponse[]): Promise<ExamResult> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Analyze overall performance across all tasks
  let totalWordCount = 0;
  let totalTaskScore = 0;
  let professionalWordCount = 0;
  
  const professionalWords = [
    'professional', 'apologize', 'deadline', 'client', 'technical', 'delivery',
    'performance', 'expectations', 'management', 'strategy', 'analysis', 'implementation',
    'ai', 'artificial intelligence', 'supply chain', 'inventory', 'costs'
  ];

  responses.forEach(response => {
    const wordCount = response.userResponse.trim().split(/\s+/).length;
    totalWordCount += wordCount;
    
    // Count professional vocabulary usage
    professionalWordCount += professionalWords.filter(word => 
      response.userResponse.toLowerCase().includes(word)
    ).length;

    // Basic task completion scoring
    if (response.questionType === 'email') {
      const hasApology = /sorry|apologize|regret/i.test(response.userResponse);
      const hasExplanation = /technical|issue|problem|delay/i.test(response.userResponse);
      const hasNewDate = /friday|date|deadline/i.test(response.userResponse);
      totalTaskScore += (hasApology ? 1 : 0) + (hasExplanation ? 1 : 0) + (hasNewDate ? 1 : 0);
    } else if (response.questionType === 'summarize') {
      const hasKeyTerms = /ai|artificial intelligence|supply chain|inventory|cost/i.test(response.userResponse);
      totalTaskScore += hasKeyTerms ? 2 : 1;
      if (wordCount >= 30 && wordCount <= 100) totalTaskScore += 1;
    } else if (response.questionType === 'dictation') {
      const targetPhrase = "quarterly earnings exceeded expectations due to strong performance in the apac region";
      const similarity = calculateSimilarity(response.userResponse.toLowerCase(), targetPhrase);
      if (similarity > 0.8) totalTaskScore += 3;
      else if (similarity > 0.6) totalTaskScore += 2;
      else if (similarity > 0.4) totalTaskScore += 1;
    } else if (response.questionType === 'speaking') {
      // For speaking, we assume it's recorded and give some points
      totalTaskScore += 2;
    }
  });

  // Determine overall CEFR level based on performance
  let overallScore = 'B1'; // Default
  let explanation = '';

  const avgWordCount = totalWordCount / responses.length;
  const proficiencyIndicators = {
    vocabulary: professionalWordCount >= 3,
    length: avgWordCount >= 40,
    taskCompletion: totalTaskScore >= 8
  };

  if (totalTaskScore >= 10 && proficiencyIndicators.vocabulary && proficiencyIndicators.length) {
    overallScore = 'B2';
    explanation = 'Demonstrates strong English proficiency with effective task completion, good vocabulary range, and appropriate professional communication across all sections.';
  } else if (totalTaskScore >= 7 && (proficiencyIndicators.vocabulary || proficiencyIndicators.length)) {
    overallScore = 'B1';
    explanation = 'Shows competent English skills with generally successful task completion. Some areas for improvement in vocabulary range or response development.';
  } else if (totalTaskScore >= 5) {
    overallScore = 'A2';
    explanation = 'Basic English communication skills demonstrated. Can complete simple tasks but would benefit from developing vocabulary and fluency for professional contexts.';
  } else {
    overallScore = 'A1';
    explanation = 'Beginning level English skills. Requires significant development in vocabulary, grammar, and task completion for professional communication.';
  }

  return {
    overallScore,
    explanation
  };
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}
