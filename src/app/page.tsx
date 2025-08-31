'use client';

import { useState } from 'react';
import WelcomePage from '@/components/WelcomePage';
import AssessmentModule from '@/components/AssessmentModule';

export default function Home() {
  const [currentView, setCurrentView] = useState<'welcome' | 'assessment'>('welcome');
  const [employeeName] = useState('John Smith'); // In real app, this would come from URL params

  const handleBeginAssessment = () => {
    setCurrentView('assessment');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'welcome' ? (
        <WelcomePage 
          employeeName={employeeName}
          onBeginAssessment={handleBeginAssessment}
        />
      ) : (
        <AssessmentModule />
      )}
    </div>
  );
}