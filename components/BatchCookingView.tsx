import React from 'react';
import { BatchCookingStep } from '../types';
import { Clock } from 'lucide-react';

interface BatchCookingViewProps {
  steps: BatchCookingStep[];
}

export const BatchCookingView: React.FC<BatchCookingViewProps> = ({ steps }) => {
  return (
    <div className="bg-amber-50 p-6 rounded-xl shadow-md border border-amber-200">
      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
        <Clock className="w-6 h-6 mr-2" />
        Batch Cooking (Sunday - Max 1h30)
      </h2>
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.step} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center font-bold">
              {step.step}
            </div>
            <div>
              <p className="text-amber-900 text-sm md:text-base">{step.instruction}</p>
              <span className="text-xs font-semibold text-amber-700 mt-1 block">
                Duration: {step.timeEstimate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};