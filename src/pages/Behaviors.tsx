
import React from 'react';
import BehaviorManager from '@/components/behaviors/BehaviorManager';

const Behaviors = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pl-page">
      <div className="max-w-7xl mx-auto">
        <BehaviorManager />
      </div>
    </div>
  );
};

export default Behaviors;
