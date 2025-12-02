import React from 'react';

const GraphCanvas = () => {
  return (
    <main className="flex-1 flex flex-col rounded-xl bg-white border border-gray-200 shadow min-h-[520px]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            🕸️
          </span>
          <h2 className="text-base font-semibold text-gray-900">Canvas</h2>
        </div>
        <span className="text-xs uppercase tracking-wide text-gray-500">Placeholder</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full h-full border border-dashed border-gray-300 rounded-md bg-gray-50 flex items-center justify-center text-xs text-gray-500">
          Graph area (to be rendered with Cytoscape.js)
        </div>
      </div>
    </main>
  );
};

export default GraphCanvas;


