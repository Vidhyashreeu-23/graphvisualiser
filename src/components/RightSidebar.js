import React from 'react';
import AlgorithmInfo from './AlgorithmInfo';
import DataStructuresPanel from './DataStructuresPanel';
import AlgorithmSetupPanel from './AlgorithmSetupPanel';

const RightSidebar = ({
  algorithmState,
  futureAlgorithm,
  pendingAlgorithm,
  availableNodes,
  onConfirmAlgorithm,
  onCancelAlgorithm,
}) => {
  return (
    <aside className="w-72 rounded-xl border border-slate-100 bg-slate-50/80 shadow-sm p-4 space-y-4 flex-shrink-0">
      {pendingAlgorithm ? (
        <AlgorithmSetupPanel
          pendingAlgorithm={pendingAlgorithm}
          availableNodes={availableNodes}
          onConfirm={onConfirmAlgorithm}
          onCancel={onCancelAlgorithm}
        />
      ) : (
        <AlgorithmInfo algorithmState={algorithmState} futureAlgorithm={futureAlgorithm} />
      )}
      <DataStructuresPanel algorithmState={algorithmState} />
    </aside>
  );
};

export default RightSidebar;

