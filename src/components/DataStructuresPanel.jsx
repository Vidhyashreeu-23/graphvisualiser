import React from 'react';

const DataStructuresPanel = ({ algorithmState }) => {
  const { currentAlgorithm, queue = [], stack = [], visited = [] } = algorithmState || {};

  const formatArray = (arr) => {
    if (!arr || arr.length === 0) return '[ ]';
    return `[ ${arr.join(', ')} ]`;
  };

  return (
    <section className="rounded-xl border border-teal-100 bg-teal-50/70 shadow-sm p-4 space-y-3">
      <h3 className="text-sm font-semibold text-teal-900">Data Structures</h3>
      <p className="text-xs text-teal-900/80">
        Here you will be able to see queues, stacks, or priority queues used by the algorithm.
      </p>
      <div className="grid grid-cols-1 gap-2 text-xs text-teal-900/80">
        {currentAlgorithm === 'BFS' && (
          <div className="rounded-lg border border-teal-100 bg-white/80 p-2">
            <p className="font-medium">Queue</p>
            <p className="mt-1 opacity-80">{formatArray(queue)}</p>
          </div>
        )}
        {currentAlgorithm === 'DFS' && (
          <div className="rounded-lg border border-teal-100 bg-white/80 p-2">
            <p className="font-medium">Stack</p>
            <p className="mt-1 opacity-80">{formatArray(stack)}</p>
          </div>
        )}
        {(currentAlgorithm === 'BFS' || currentAlgorithm === 'DFS') && (
          <div className="rounded-lg border border-teal-100 bg-white/80 p-2">
            <p className="font-medium">Visited</p>
            <p className="mt-1 opacity-80">{formatArray(visited)}</p>
          </div>
        )}
        {!currentAlgorithm && (
          <>
            <div className="rounded-lg border border-teal-100 bg-white/80 p-2">
              <p className="font-medium">Queue</p>
              <p className="mt-1 opacity-80">[ ] – waiting for nodes…</p>
            </div>
            <div className="rounded-lg border border-teal-100 bg-white/80 p-2">
              <p className="font-medium">Visited</p>
              <p className="mt-1 opacity-80">{'{ '}nodes will appear here {'}'}</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default DataStructuresPanel;



