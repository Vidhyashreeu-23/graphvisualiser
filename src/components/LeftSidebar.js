import React from 'react';

const LeftSidebar = () => {
  return (
    <aside className="w-64 bg-white rounded-lg border border-gray-200 p-4 space-y-4 shadow flex-shrink-0">
      <div className="w-full h-24 rounded-md bg-gray-50 flex items-center justify-center border border-gray-200">
        <span className="text-2xl" aria-hidden="true">
          🧩
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Tools</h3>
        </div>
        <div className="h-px bg-gray-200" />
        <p className="text-sm text-gray-600">Add nodes, edges, or weights.</p>
      </div>
      <div className="space-y-2">
        {['Add Node', 'Add Edge', 'Assign Weight', 'Reset Canvas'].map((label) => (
          <button
            key={label}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md px-4 py-2"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default LeftSidebar;


