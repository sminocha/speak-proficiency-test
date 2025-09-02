'use client';

import { useState } from 'react';
import { Play, Mic, MicOff, ArrowLeft } from 'lucide-react';

type QuestionType = 'email' | 'summarize' | 'dictation' | 'speaking';

interface GradingResult {
  fluency: number;
  lexical: number;
  grammar: number;
  task: number;
  feedback: string;
}

interface AssessmentModuleProps {
  onBackToExam?: () => void;
}

export default function AssessmentModule({ onBackToExam }: AssessmentModuleProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType>('email');
  const [userResponse, setUserResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const questionTypes = [
    { id: 'email' as QuestionType, label: 'Email Response (Writing)' },
    { id: 'summarize' as QuestionType, label: 'Summarize Text (Reading & Writing)' },
    { id: 'dictation' as QuestionType, label: 'Dictation (Listening & Typing)' },
    { id: 'speaking' as QuestionType, label: 'Spoken Response (Speaking)' },
  ];

  const sampleArticle = `
The Rise of AI in Supply Chain Management

Artificial Intelligence is revolutionizing supply chain management across industries. Companies are leveraging AI-powered analytics to predict demand patterns, optimize inventory levels, and reduce operational costs. Machine learning algorithms can process vast amounts of data from multiple sources, including weather patterns, economic indicators, and consumer behavior trends.

Major retailers report up to 30% reduction in inventory costs and 25% improvement in delivery times since implementing AI solutions. The technology enables real-time decision-making, allowing businesses to respond quickly to market changes and supply disruptions. However, successful AI implementation requires significant investment in data infrastructure and employee training.

As AI technology continues to evolve, experts predict even greater integration in supply chain operations, with autonomous systems handling routine decisions and human oversight focusing on strategic planning and exception management.
  `;

  const handlePlayAudio = () => {
    setAudioPlayed(true);
    // Simulate audio playback - in real app, this would play actual audio
    const utterance = new SpeechSynthesisUtterance(
      "Our quarterly earnings exceeded expectations due to strong performance in the APAC region."
    );
    speechSynthesis.speak(utterance);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Simulate 30-second recording
    const timer = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 30) {
          setIsRecording(false);
          clearInterval(timer);
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleSubmitForGrading = async () => {
    if (!canSubmit()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userResponse: selectedQuestion === 'speaking' ? `[30-second recorded response]` : userResponse,
          questionType: selectedQuestion,
          prompt: typeof getPromptForQuestion() === 'string' ? getPromptForQuestion() : 'Complex prompt with article'
        }),
      });

      if (!response.ok) {
        throw new Error('Grading failed');
      }

      const result: GradingResult = await response.json();
      setGradingResult(result);
    } catch (error) {
      console.error('Grading error:', error);
      // Fallback to mock result if API fails
      const mockResult: GradingResult = {
        fluency: 4,
        lexical: 3,
        grammar: 4,
        task: 4,
        feedback: "Unable to connect to grading service. This is a sample result."
      };
      setGradingResult(mockResult);
    } finally {
      setIsLoading(false);
    }
  };

  const getPromptForQuestion = () => {
    switch (selectedQuestion) {
      case 'email':
        return "You are a project manager. Your team has missed an important deadline for a client, 'Global Innovations Inc.' Write a professional email (150-200 words) to the client. You need to apologize, briefly explain the reason for the delay (a technical issue), and provide a new, confident delivery date for this Friday.";
      
      case 'summarize':
        return (
          <div>
            <p className="mb-4">Read the following article and summarize the key points in 3-4 sentences:</p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-line">
              {sampleArticle}
            </div>
          </div>
        );
      
      case 'dictation':
        return (
          <div>
            <p className="mb-4">Click the play button and type exactly what you hear:</p>
            <button
              onClick={handlePlayAudio}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Play Audio</span>
            </button>
            {audioPlayed && (
              <p className="text-sm text-green-600 mt-2">✓ Audio played</p>
            )}
          </div>
        );
      
      case 'speaking':
        return (
          <div>
            <p className="mb-4">You are in a job interview. The interviewer asks: &ldquo;Can you tell me about a time you had to handle a difficult colleague?&rdquo; Prepare a brief, 30-second response. Click &lsquo;Record&rsquo; to begin.</p>
            <button
              onClick={handleStartRecording}
              disabled={isRecording}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-600 text-white cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? `Recording... ${recordingTime}s` : 'Record'}</span>
            </button>
          </div>
        );
    }
  };

  const getInputArea = () => {
    if (selectedQuestion === 'speaking') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          {isRecording ? (
            <p className="text-red-600 font-medium">Recording in progress... {recordingTime}/30 seconds</p>
          ) : recordingTime > 0 ? (
            <p className="text-green-600 font-medium">Recording completed ({recordingTime} seconds)</p>
          ) : (
            <p className="text-gray-500">Click &lsquo;Record&rsquo; to start your response</p>
          )}
        </div>
      );
    }

    return (
      <textarea
        value={userResponse}
        onChange={(e) => setUserResponse(e.target.value)}
        placeholder="Type your response here..."
        className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
    );
  };

  const canSubmit = () => {
    if (selectedQuestion === 'speaking') {
      return recordingTime > 0;
    }
    return userResponse.trim().length > 0;
  };

  // Rating Component with color coding
  const RatingDisplay = ({ score, maxScore = 5 }: { score: number; maxScore?: number }) => {
    const roundedScore = Math.round(score);
    
    // Color coding based on score quality
    const getColorClasses = () => {
      if (roundedScore >= 4) return 'from-green-500 to-green-600'; // Excellent: 4-5
      if (roundedScore >= 3) return 'from-orange-400 to-orange-500'; // Good: 3
      return 'from-red-400 to-red-500'; // Needs improvement: 1-2
    };
    
    const colorClasses = getColorClasses();
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(maxScore)].map((_, index) => {
          const isFilled = index < roundedScore;
          
          return (
            <div key={index} className="relative w-3 h-3">
              {/* Background circle */}
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              
              {/* Filled circle with color-coded gradient */}
              {isFilled && (
                <div className={`absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r ${colorClasses}`}></div>
              )}
            </div>
          );
        })}
        <span className="ml-2 text-sm font-medium text-gray-600">
          {roundedScore}/5
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Choose a Category to Practice</h1>
            {onBackToExam && (
              <button
                onClick={onBackToExam}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Exam</span>
              </button>
            )}
          </div>
          
          {/* Question Type Selector */}
          <div className="flex flex-wrap gap-2">
            {questionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedQuestion(type.id);
                  setUserResponse('');
                  setGradingResult(null);
                  setRecordingTime(0);
                  setAudioPlayed(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedQuestion === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Prompt</h2>
          <div className="text-gray-700">
            {getPromptForQuestion()}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Response</h2>
          {getInputArea()}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <button
            onClick={handleSubmitForGrading}
            disabled={!canSubmit() || isLoading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
              canSubmit() && !isLoading
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Grading in progress...' : 'Submit for AI Grade'}
          </button>
        </div>

        {/* Results Area */}
        {gradingResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Fluency & Cohesion</div>
                  <div className="mt-1 mb-2">
                    <RatingDisplay score={gradingResult.fluency} />
                  </div>
                  <div className="text-xs text-gray-600">
                    How smoothly ideas flow and connect together
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Lexical Resource</div>
                  <div className="mt-1 mb-2">
                    <RatingDisplay score={gradingResult.lexical} />
                  </div>
                  <div className="text-xs text-gray-600">
                    Range and accuracy of vocabulary usage
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Grammar</div>
                  <div className="mt-1 mb-2">
                    <RatingDisplay score={gradingResult.grammar} />
                  </div>
                  <div className="text-xs text-gray-600">
                    Sentence structure and grammatical accuracy
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">Task Achievement</div>
                  <div className="mt-1 mb-2">
                    <RatingDisplay score={gradingResult.task} />
                  </div>
                  <div className="text-xs text-gray-600">
                    How well the response addresses the prompt
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
              <p className="text-gray-700">{gradingResult.feedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
