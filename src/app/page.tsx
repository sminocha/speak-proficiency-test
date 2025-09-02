'use client';

import { useState, useEffect } from 'react';
import AdminPortal from '@/components/AdminPortal';
import WelcomePage from '@/components/WelcomePage';
import AssessmentModule from '@/components/AssessmentModule';
import ExamMode from '@/components/ExamMode';
import ExamResultPage from '@/components/ExamResultPage';

type ViewType = 'admin' | 'welcome' | 'assessment' | 'exam' | 'examResult';

interface ExamResult {
  overallScore: string;
  explanation: string;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('admin');
  const [employeeName, setEmployeeName] = useState('John Smith');
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    // Check URL parameters to determine if this is an assessment link
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
      // This is an assessment link, extract employee name and go to welcome page
      setEmployeeId(id);
      // Convert ID back to readable name (for demo purposes)
      const name = id.split('-').slice(0, -1).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      setEmployeeName(name || 'Employee');
      setCurrentView('welcome');
    } else {
      // No ID parameter, show admin portal
      setCurrentView('admin');
    }
  }, []);

  const handleStartAssessment = (empId: string, empName: string) => {
    setEmployeeId(empId);
    setEmployeeName(empName);
    setCurrentView('welcome');
  };

  const handleBeginAssessment = () => {
    setCurrentView('exam');
  };

  const handleFreePractice = () => {
    setCurrentView('assessment');
  };

  const handleExamComplete = async (result: ExamResult) => {
    setExamResult(result);
    setCurrentView('examResult');
    
    // Update the employee's score in the admin portal (simulate API call)
    if (employeeId) {
      try {
        // In a real application, this would be an API call to update the database
        console.log(`Updating employee ${employeeId} with score ${result.overallScore}`);
        localStorage.setItem(`employee_${employeeId}_score`, result.overallScore);
      } catch (error) {
        console.error('Failed to update employee score:', error);
      }
    }
  };

  const handleReturnToWelcome = () => {
    setCurrentView('welcome');
    setExamResult(null);
  };

  const handleBackToExam = () => {
    setCurrentView('welcome');
  };

  const handleBackToAdmin = () => {
    setCurrentView('admin');
    setEmployeeId(null);
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'admin' ? (
        <AdminPortal onStartAssessment={handleStartAssessment} />
      ) : currentView === 'welcome' ? (
        <div>
          {/* Back to Admin button for navigation */}
          {!employeeId && (
            <div className="p-4">
              <button
                onClick={handleBackToAdmin}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Admin Portal
              </button>
            </div>
          )}
          <WelcomePage 
            employeeName={employeeName}
            onBeginAssessment={handleBeginAssessment}
            onFreePractice={handleFreePractice}
          />
        </div>
      ) : currentView === 'assessment' ? (
        <AssessmentModule onBackToExam={handleBackToExam} />
      ) : currentView === 'exam' ? (
        <ExamMode onExamComplete={handleExamComplete} />
      ) : currentView === 'examResult' && examResult ? (
        <ExamResultPage 
          result={examResult}
          employeeName={employeeName}
          onReturnToWelcome={handleReturnToWelcome}
        />
      ) : null}
    </div>
  );
}