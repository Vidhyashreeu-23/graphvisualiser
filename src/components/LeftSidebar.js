import React from 'react';

const LeftSidebar = ({
  onAddNode,
  onAddEdge,
  onToggleDirected,
  onToggleWeighted,
  onReset,
  isDirected = false,
  isWeighted = false,
  isEdgeMode = false,
}) => {
  const handleAddNode = () => {
    if (onAddNode) {
      onAddNode();
    }
  };

  const handleAddEdge = () => {
    if (onAddEdge) {
      onAddEdge();
    }
  };

  const handleToggleDirected = () => {
    if (onToggleDirected) {
      onToggleDirected();
    }
  };

  const handleToggleWeighted = () => {
    if (onToggleWeighted) {
      onToggleWeighted();
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <aside className="w-64 rounded-xl border border-indigo-100 bg-indigo-50/70 shadow-sm p-4 space-y-4 flex-shrink-0">
      <div className="rounded-xl bg-white/80 border border-indigo-100 h-20 flex items-center justify-center">
        <p className="text-sm font-medium text-indigo-700">Graph Tools</p>
      </div>
      <p className="text-xs text-indigo-800/80">
        Use these buttons to imagine how you will build and adjust your graph.
      </p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleAddNode}
          className="w-full text-sm rounded-lg border border-indigo-200 bg-white/90 text-indigo-800 py-2 shadow-sm hover:bg-indigo-100"
        >
          Add Node
        </button>
        <button
          type="button"
          onClick={handleAddEdge}
          className={`w-full text-sm rounded-lg border border-indigo-200 py-2 shadow-sm ${
            isEdgeMode
              ? 'bg-indigo-500 text-white'
              : 'bg-white/90 text-indigo-800 hover:bg-indigo-100'
          }`}
        >
          Add Edge
        </button>
        <button
          type="button"
          onClick={handleToggleDirected}
          className={`w-full text-sm rounded-lg border border-indigo-200 py-2 shadow-sm ${
            isDirected
              ? 'bg-indigo-500 text-white'
              : 'bg-white/90 text-indigo-800 hover:bg-indigo-100'
          }`}
        >
          Directed Mode
        </button>
        <button
          type="button"
          onClick={handleToggleWeighted}
          className={`w-full text-sm rounded-lg border border-indigo-200 py-2 shadow-sm ${
            isWeighted
              ? 'bg-indigo-500 text-white'
              : 'bg-white/90 text-indigo-800 hover:bg-indigo-100'
          }`}
        >
          Weighted Mode
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-full text-sm rounded-lg border border-indigo-200 bg-white/90 text-indigo-800 py-2 shadow-sm hover:bg-indigo-100"
        >
          Reset
        </button>
      </div>
    </aside>
  );
};

export default LeftSidebar;
