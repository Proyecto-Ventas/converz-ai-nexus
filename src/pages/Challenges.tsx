
import React from 'react';
import ChallengesManagerEnhanced from '@/components/ChallengesManagerEnhanced';

const Challenges = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pl-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Centro de Desafíos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea y gestiona desafíos individuales y de equipo para motivar el aprendizaje
          </p>
        </div>

        <ChallengesManagerEnhanced />
      </div>
    </div>
  );
};

export default Challenges;
