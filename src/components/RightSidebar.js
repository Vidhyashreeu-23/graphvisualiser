import React from 'react';
import AlgorithmInfo from './AlgorithmInfo';
import DataStructuresPanel from './DataStructuresPanel';

const RightSidebar = () => {
  return (
    <aside className="w-72 rounded-xl border border-slate-100 bg-slate-50/80 shadow-sm p-4 space-y-4 flex-shrink-0">
      <AlgorithmInfo />
      <DataStructuresPanel />
    </aside>
  );
};

export default RightSidebar;

