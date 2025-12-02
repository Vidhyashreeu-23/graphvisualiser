import React from 'react';
import { Link } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import GraphCanvas from './GraphCanvas';
import RightSidebar from './RightSidebar';

const GraphEditor = () => {
  return (
    <section className="min-h-screen bg-indigo-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-4 md:py-5 min-h-screen flex flex-col">
        <nav className="flex items-center justify-between rounded-md bg-indigo-100 border border-indigo-100 px-4 py-2">
          <p className="text-sm font-semibold text-gray-800">Graph Visualizer – Editor</p>
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Home
          </Link>
        </nav>

        <div className="mt-4 flex-1">
          <div className="h-full rounded-lg border border-gray-200 bg-indigo-50/60 px-4 py-4 flex gap-5 min-h-[520px]">
            <LeftSidebar />
            <GraphCanvas />
            <RightSidebar />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GraphEditor;
