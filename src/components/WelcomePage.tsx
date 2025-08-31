import { CheckCircle } from 'lucide-react';

interface WelcomePageProps {
  employeeName: string;
  onBeginAssessment: () => void;
}

export default function WelcomePage({ employeeName, onBeginAssessment }: WelcomePageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8 space-y-8 border border-gray-100">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You&rsquo;ve been invited to take the Speak Proficiency Assessment.
          </h1>
        </div>

        {/* Welcome Text */}
        <div className="bg-blue-50 rounded-lg p-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            Hi <span className="font-semibold text-blue-700">{employeeName}</span>, 
            your company has invited you to complete the Speak English Proficiency Assessment. 
            The test will take approximately <span className="font-semibold">45 minutes</span>. 
            Please ensure you are in a quiet place with a stable internet connection.
          </p>
        </div>

        {/* System Check Simulation */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">System Check</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-lg text-gray-700">Microphone Detected</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-lg text-gray-700">Camera Detected</span>
            </div>
          </div>
        </div>

        {/* Begin Assessment Button */}
        <div className="pt-6">
          <button
            onClick={onBeginAssessment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Begin Assessment
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p>Make sure you have a stable internet connection throughout the assessment.</p>
        </div>
      </div>
    </div>
  );
}
