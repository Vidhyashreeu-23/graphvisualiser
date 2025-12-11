import React from 'react';

const LeftSidebar = () => {
  return (
    <aside className="w-64 rounded-xl border border-indigo-100 bg-indigo-50/70 shadow-sm p-4 space-y-4 flex-shrink-0">
      <div className="rounded-xl bg-white/80 border border-indigo-100 h-20 flex items-center justify-center">
        <p className="text-sm font-medium text-indigo-700">Graph Tools</p>
      </div>
      <p className="text-xs text-indigo-800/80">
        Use these buttons to imagine how you will build and adjust your graph.
      </p>
      <div className="space-y-2">
        {['Add Node', 'Add Edge', 'Directed Mode', 'Weighted Mode', 'Reset'].map((label) => (
          <button
            key={label}
            type="button"
            className="w-full text-sm rounded-lg border border-indigo-200 bg-white/90 text-indigo-800 py-2 shadow-sm"
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default LeftSidebar;

