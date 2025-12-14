import React from 'react';

const AlgorithmInfo = ({ algorithmState, futureAlgorithm = null }) => {
  const { currentAlgorithm, currentStepIndex, totalSteps } = algorithmState || {};

  const isFutureAlgorithm = futureAlgorithm !== null;

  return (
    <section className="rounded-xl border border-purple-100 bg-purple-50/70 shadow-sm p-4 space-y-2">
      <h3 className="text-sm font-semibold text-purple-900">Algorithm Info</h3>
      <p className="text-xs text-purple-900/80">
        This panel will show the current algorithm, step-by-step explanation, and key ideas in
        simple language.
      </p>
      <div className="rounded-lg border border-purple-100 bg-white/80 p-3 text-xs text-purple-900/80">
        {!currentAlgorithm && (
          <>
            <p className="font-medium">Select an algorithm to begin</p>
            <p>Choose an algorithm to see how it explores the graph.</p>
          </>
        )}
        {isFutureAlgorithm && (
          <>
            <p className="font-medium">{futureAlgorithm}</p>
            <p className="mt-2">This algorithm will be supported in a future stage.</p>
          </>
        )}
        {currentAlgorithm && !isFutureAlgorithm && (
          <>
            <p className="font-medium">{currentAlgorithm}</p>
            {currentStepIndex >= 0 && totalSteps > 0 && (
              <p className="mt-2">
                Step {currentStepIndex + 1} of {totalSteps}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AlgorithmInfo;



