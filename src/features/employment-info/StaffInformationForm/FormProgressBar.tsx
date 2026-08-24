// src/features/employment-info/StaffInformationForm/FormProgressBar.tsx
import React from 'react';
import { User, Briefcase, Phone, Banknote } from 'lucide-react';

interface FormProgressBarProps {
  completionPercentage: number;
  completedSections: {
    personal: boolean;
    job: boolean;
    emergency: boolean;
    bank: boolean;
  };
}

const sections = [
  { key: 'personal' as const, label: 'Personal', icon: User },
  { key: 'job' as const, label: 'Job', icon: Briefcase },
  { key: 'emergency' as const, label: 'Emergency', icon: Phone },
  { key: 'bank' as const, label: 'Bank', icon: Banknote },
];

export const FormProgressBar: React.FC<FormProgressBarProps> = ({
  completionPercentage,
  completedSections,
}) => {
  const isComplete = Object.values(completedSections).every(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 z-20 backdrop-blur-sm bg-white/90">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-medium text-gray-700">Profile Completion</span>
        <span className="text-sm sm:text-base font-semibold text-blue-600">
          {completionPercentage}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
        <div
          className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 mt-4">
        {sections.map(({ key, label, icon: Icon }) => {
          const completed = completedSections[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-2 sm:gap-1.5 ${
                key === 'emergency' || key === 'bank'
                  ? 'sm:justify-start justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`p-1.5 sm:p-1 rounded-full flex-shrink-0 ${completed ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                <Icon
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${completed ? 'text-green-600' : 'text-gray-400'}`}
                />
              </div>
              <span
                className={`text-xs whitespace-nowrap ${completed ? 'text-green-600 font-medium' : 'text-gray-500'}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="sm:hidden mt-3 text-center">
        <p className="text-xs text-gray-500">
          {isComplete
            ? '✨ Profile complete!'
            : `${Object.values(completedSections).filter(Boolean).length}/4 sections completed`}
        </p>
      </div>
    </div>
  );
};
