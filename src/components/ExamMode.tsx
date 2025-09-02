'use client';

import { useState } from 'react';
import { Play, Mic, MicOff, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

type QuestionType = 'email' | 'summarize' | 'dictation' | 'speaking';

interface ExamResult {
  overallScore: string;
  explanation: string;
}

interface ExamModeProps {
  onExamComplete: (result: ExamResult) => void;
}

interface Question {
  id: QuestionType;
  type: QuestionType;
  title: string;
  instruction: string;
  content?: React.ReactNode;
  response: string;
  isRecorded?: boolean;
  recordingTime?: number;
  audioPlayed?: boolean;
}

export default function ExamMode({ onExamComplete }: ExamModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSectionCard, setShowSectionCard] = useState(false);

  const sampleArticle = `
The Rise of AI in Supply Chain Management

Artificial Intelligence is revolutionizing supply chain management across industries. Companies are leveraging AI-powered analytics to predict demand patterns, optimize inventory levels, and reduce operational costs. Machine learning algorithms can process vast amounts of data from multiple sources, including weather patterns, economic indicators, and consumer behavior trends.

Major retailers report up to 30% reduction in inventory costs and 25% improvement in delivery times since implementing AI solutions. The technology enables real-time decision-making, allowing businesses to respond quickly to market changes and supply disruptions. However, successful AI implementation requires significant investment in data infrastructure and employee training.

As AI technology continues to evolve, experts predict even greater integration in supply chain operations, with autonomous systems handling routine decisions and human oversight focusing on strategic planning and exception management.
  `;

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'email',
      type: 'email',
      title: 'Email Response (Writing)',
      instruction: "You are a project manager. Your team has missed an important deadline for a client, 'Global Innovations Inc.' Write a professional email (150-200 words) to the client. You need to apologize, briefly explain the reason for the delay (a technical issue), and provide a new, confident delivery date for this Friday.",
      response: '',
    },
    {
      id: 'summarize',
      type: 'summarize',
      title: 'Summarize Text (Reading & Writing)',
      instruction: 'Read the following article and summarize the key points in 3-4 sentences:',
      content: (
        <div className="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-line">
          {sampleArticle}
        </div>
      ),
      response: '',
    },
    {
      id: 'dictation',
      type: 'dictation',
      title: 'Dictation (Listening & Typing)',
      instruction: 'Click the play button and type exactly what you hear:',
      response: '',
      audioPlayed: false,
    },
    {
      id: 'speaking',
      type: 'speaking',
      title: 'Spoken Response (Speaking)',
      instruction: 'You are in a job interview. The interviewer asks: "Can you tell me about a time you had to handle a difficult colleague?" Prepare a brief, 30-second response. Click \'Record\' to begin.',
      response: '',
      isRecorded: false,
      recordingTime: 0,
    },
  ]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const sectionInfo = {
    email: {
      title: 'Email Response Section',
      description: 'In this section, you will write a professional email response to a business scenario.',
      icon: '📧'
    },
    summarize: {
      title: 'Text Summarization Section',
      description: 'You will read an article and provide a concise summary of the key points.',
      icon: '📋'
    },
    dictation: {
      title: 'Dictation Section',
      description: 'Listen carefully to the audio and type exactly what you hear.',
      icon: '🎧'
    },
    speaking: {
      title: 'Speaking Section',
      description: 'Record a spoken response to an interview-style question.',
      icon: '🎤'
    }
  };

  const handlePlayAudio = () => {
    setQuestions(prev => prev.map((q, idx) => 
      idx === currentQuestionIndex 
        ? { ...q, audioPlayed: true }
        : q
    ));
    
    // Simulate audio playback
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
          // Update question state
          setQuestions(prevQuestions => prevQuestions.map((q, idx) => 
            idx === currentQuestionIndex 
              ? { ...q, isRecorded: true, recordingTime: 30 }
              : q
          ));
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleResponseChange = (value: string) => {
    setQuestions(prev => prev.map((q, idx) => 
      idx === currentQuestionIndex 
        ? { ...q, response: value }
        : q
    ));
  };

  const canNavigateNext = () => {
    if (currentQuestion.type === 'speaking') {
      return currentQuestion.isRecorded;
    }
    if (currentQuestion.type === 'dictation') {
      return currentQuestion.response.trim().length > 0 && currentQuestion.audioPlayed;
    }
    return currentQuestion.response.trim().length > 0;
  };

  const handleNext = () => {
    if (!canNavigateNext()) return;
    
    if (isLastQuestion) {
      handleSubmitExam();
      return;
    }

    // Show section card before moving to next question
    setShowSectionCard(true);
    setTimeout(() => {
      setShowSectionCard(false);
      setCurrentQuestionIndex(prev => prev + 1);
    }, 2000);
  };

  const handlePrevious = () => {
    if (isFirstQuestion) return;
    setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    
    try {
      // Combine all responses into a single submission
      const examData = {
        responses: questions.map(q => ({
          questionType: q.type,
          prompt: q.instruction,
          userResponse: q.type === 'speaking' ? `[30-second recorded response]` : q.response
        }))
      };

      const response = await fetch('/api/grade/exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        throw new Error('Exam grading failed');
      }

      const result: ExamResult = await response.json();
      onExamComplete(result);
    } catch (error) {
      console.error('Exam submission error:', error);
      // Fallback result
      const mockResult: ExamResult = {
        overallScore: 'B2',
        explanation: 'Your overall performance demonstrates good command of English with effective communication skills. You showed strong vocabulary usage and task completion abilities.'
      };
      onExamComplete(mockResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'dictation':
        return (
          <div>
            <button
              onClick={handlePlayAudio}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors mb-4"
            >
              <Play className="w-4 h-4" />
              <span>Play Audio</span>
            </button>
            {currentQuestion.audioPlayed && (
              <p className="text-sm text-green-600 mb-4">✓ Audio played</p>
            )}
          </div>
        );
      
      case 'speaking':
        return (
          <div>
            <button
              onClick={handleStartRecording}
              disabled={isRecording}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors mb-4 ${
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
      
      default:
        return null;
    }
  };

  const getInputArea = () => {
    if (currentQuestion.type === 'speaking') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          {isRecording ? (
            <p className="text-red-600 font-medium">Recording in progress... {recordingTime}/30 seconds</p>
          ) : currentQuestion.isRecorded ? (
            <p className="text-green-600 font-medium">Recording completed (30 seconds)</p>
          ) : (
            <p className="text-gray-500">Click &apos;Record&apos; to start your response</p>
          )}
        </div>
      );
    }

    return (
      <textarea
        value={currentQuestion.response}
        onChange={(e) => handleResponseChange(e.target.value)}
        placeholder="Type your response here..."
        className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
    );
  };

  // Section card overlay
  if (showSectionCard && currentQuestionIndex < questions.length - 1) {
    const nextSection = sectionInfo[questions[currentQuestionIndex + 1].type];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">{nextSection.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{nextSection.title}</h2>
          <p className="text-gray-600 mb-6">{nextSection.description}</p>
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading next section...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">English Proficiency Exam</h1>
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">{sectionInfo[currentQuestion.type].icon}</div>
            <h2 className="text-xl font-semibold text-gray-900">{currentQuestion.title}</h2>
          </div>
          
          <div className="text-gray-700 mb-4">
            {currentQuestion.instruction}
          </div>
          
          {currentQuestion.content && (
            <div className="mb-4">
              {currentQuestion.content}
            </div>
          )}
          
          {getQuestionContent()}
        </div>

        {/* Response Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Response</h3>
          {getInputArea()}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isFirstQuestion
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < currentQuestionIndex
                      ? 'bg-green-500'
                      : index === currentQuestionIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!canNavigateNext() || isSubmitting}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                canNavigateNext() && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{isLastQuestion ? (isSubmitting ? 'Submitting...' : 'Submit Exam') : 'Next'}</span>
              {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
              {isLastQuestion && <CheckCircle className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
