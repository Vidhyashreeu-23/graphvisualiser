import React from 'react';

const RightSidebar = () => {
  return (
    <aside className="w-64 bg-white rounded-lg border border-gray-200 p-4 space-y-4 shadow flex-shrink-0">
      <div className="w-full h-24 rounded-md bg-gray-50 flex items-center justify-center border border-gray-200">
        <span className="text-2xl" aria-hidden="true">
          🔍
        </span>
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">Details</h3>
        <p className="text-sm text-gray-600">Selected element information.</p>
      </div>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="border border-gray-200 rounded-md p-2">
          <p className="font-semibold">Node A</p>
          <p className="text-xs text-gray-500">Connections: 3</p>
        </div>
        <div className="border border-gray-200 rounded-md p-2">
          <p className="font-semibold">Edge A → B</p>
          <p className="text-xs text-gray-500">Weight: 4</p>
        </div>
        <div className="border border-gray-200 rounded-md p-2">
          <p className="font-semibold">Notes</p>
          <p className="text-xs text-gray-500">No active algorithm.</p>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;


