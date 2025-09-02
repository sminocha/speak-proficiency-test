'use client';

import { CheckCircle, Award, RotateCcw } from 'lucide-react';

interface ExamResult {
  overallScore: string;
  explanation: string;
}

interface ExamResultPageProps {
  result: ExamResult;
  employeeName: string;
  onReturnToWelcome: () => void;
}

export default function ExamResultPage({ result, employeeName, onReturnToWelcome }: ExamResultPageProps) {
  const getScoreColor = (score: string) => {
    switch (score) {
      case 'C2':
      case 'C1':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'B2':
      case 'B1':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'A2':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'A1':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreDescription = (score: string) => {
    switch (score) {
      case 'C2':
        return 'Proficient - Near-native level proficiency';
      case 'C1':
        return 'Advanced - Fluent and sophisticated language use';
      case 'B2':
        return 'Upper-Intermediate - Effective communication, good vocabulary and grammar';
      case 'B1':
        return 'Intermediate - Can handle most situations, good basic communication';
      case 'A2':
        return 'Elementary - Simple sentences, basic communication';
      case 'A1':
        return 'Beginner - Basic phrases, very limited vocabulary';
      default:
        return 'Assessment completed';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8 space-y-8 border border-gray-100">
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Exam Completed Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you, <span className="font-semibold text-blue-700">{employeeName}</span>
          </p>
        </div>

        {/* Score Display */}
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <Award className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your English Proficiency Level</h2>
            <div className={`inline-block px-6 py-3 rounded-lg border-2 ${getScoreColor(result.overallScore)}`}>
              <div className="text-3xl font-bold">{result.overallScore}</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {getScoreDescription(result.overallScore)}
            </p>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Assessment Summary</h3>
          <p className="text-gray-700 leading-relaxed">
            {result.explanation}
          </p>
        </div>

        {/* CEFR Scale Reference */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">CEFR Proficiency Scale</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">C2 - Proficient:</span>
              <span className="text-gray-600">Near-native level</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">C1 - Advanced:</span>
              <span className="text-gray-600">Fluent and sophisticated</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">B2 - Upper-Intermediate:</span>
              <span className="text-gray-600">Effective communication</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">B1 - Intermediate:</span>
              <span className="text-gray-600">Good basic communication</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">A2 - Elementary:</span>
              <span className="text-gray-600">Simple sentences</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">A1 - Beginner:</span>
              <span className="text-gray-600">Basic phrases</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>• Your results have been automatically saved to your company&apos;s admin portal</li>
            <li>• Your HR team will be notified of your completed assessment</li>
            <li>• You may receive a digital certificate via email within 24 hours</li>
            <li>• For questions about your results, contact your HR department</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <button
            onClick={onReturnToWelcome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Return to Welcome Page</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p>Assessment completed at {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
