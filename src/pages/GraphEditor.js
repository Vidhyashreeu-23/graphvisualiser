import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import GraphCanvas from '../components/GraphCanvas';
import RightSidebar from '../components/RightSidebar';

const GraphEditor = () => {
  const graphCanvasRef = useRef(null);
  const [graphState, setGraphState] = useState({
    isDirected: false,
    isWeighted: false,
    edgeCreationMode: false,
  });

  const handleAddNode = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.addNode();
    }
  };

  const handleAddEdge = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.toggleEdgeMode();
    }
  };

  const handleToggleDirected = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.toggleDirected();
    }
  };

  const handleToggleWeighted = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.toggleWeighted();
    }
  };

  const handleReset = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.resetGraph();
    }
    setGraphState({
      isDirected: false,
      isWeighted: false,
      edgeCreationMode: false,
    });
  };

  const handleStateChange = (newState) => {
    setGraphState(newState);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-sky-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 min-h-screen flex flex-col gap-4">
        <nav className="flex items-center justify-between rounded-xl bg-white/80 border border-indigo-100 px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Graph Visualizer · Editor</p>
          <Link
            to="/"
            className="text-xs md:text-sm rounded-lg border border-indigo-200 bg-indigo-500 text-white px-3 py-1.5 shadow-sm"
          >
            Back to home
          </Link>
        </nav>

        <div className="flex gap-4 h-[90%] rounded-2xl border border-indigo-100 bg-white/60 p-4 shadow-sm min-h-[520px]">
          <LeftSidebar
            onAddNode={handleAddNode}
            onAddEdge={handleAddEdge}
            onToggleDirected={handleToggleDirected}
            onToggleWeighted={handleToggleWeighted}
            onReset={handleReset}
            isDirected={graphState.isDirected}
            isWeighted={graphState.isWeighted}
            isEdgeMode={graphState.edgeCreationMode}
          />
          <GraphCanvas ref={graphCanvasRef} onStateChange={handleStateChange} />
          <RightSidebar />
        </div>
      </div>
    </section>
  );
};

export default GraphEditor;
