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
  const [algorithmState, setAlgorithmState] = useState({
    currentAlgorithm: null,
    currentStepIndex: -1,
    isPlaying: false,
    queue: [],
    stack: [],
    visited: [],
    currentNode: null,
  });
  const [futureAlgorithm, setFutureAlgorithm] = useState(null);
  const [pendingAlgorithm, setPendingAlgorithm] = useState(null);
  const [availableNodes, setAvailableNodes] = useState([]);

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

  const handleAlgorithmStateChange = (newState) => {
    setAlgorithmState(newState);
  };

  const handleRunBFS = () => {
    // Reset any running algorithm first
    if (graphCanvasRef.current) {
      graphCanvasRef.current.resetAlgorithm();
    }
    setAlgorithmState({
      currentAlgorithm: null,
      currentStepIndex: -1,
      isPlaying: false,
      queue: [],
      stack: [],
      visited: [],
      currentNode: null,
    });
    
    // Get available nodes from GraphCanvas
    if (graphCanvasRef.current) {
      const nodes = graphCanvasRef.current.getAvailableNodes();
      if (nodes.length === 0) {
        alert('Please add nodes to the graph first.');
        return;
      }
      setAvailableNodes(nodes);
      setPendingAlgorithm('BFS');
      setFutureAlgorithm(null);
    }
  };

  const handleRunDFS = () => {
    // Reset any running algorithm first
    if (graphCanvasRef.current) {
      graphCanvasRef.current.resetAlgorithm();
    }
    setAlgorithmState({
      currentAlgorithm: null,
      currentStepIndex: -1,
      isPlaying: false,
      queue: [],
      stack: [],
      visited: [],
      currentNode: null,
    });
    
    // Get available nodes from GraphCanvas
    if (graphCanvasRef.current) {
      const nodes = graphCanvasRef.current.getAvailableNodes();
      if (nodes.length === 0) {
        alert('Please add nodes to the graph first.');
        return;
      }
      setAvailableNodes(nodes);
      setPendingAlgorithm('DFS');
      setFutureAlgorithm(null);
    }
  };

  const handleConfirmAlgorithm = ({ startNode, endNode }) => {
    if (pendingAlgorithm === 'BFS') {
      if (graphCanvasRef.current) {
        graphCanvasRef.current.runBFS(startNode);
      }
    } else if (pendingAlgorithm === 'DFS') {
      if (graphCanvasRef.current) {
        graphCanvasRef.current.runDFS(startNode);
      }
    }
    setPendingAlgorithm(null);
  };

  const handleCancelAlgorithm = () => {
    setPendingAlgorithm(null);
  };

  const handlePlay = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.playAlgorithm();
    }
  };

  const handleNextStep = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.nextStep();
    }
  };

  const handleResetAlgorithm = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.resetAlgorithm();
    }
    setAlgorithmState({
      currentAlgorithm: null,
      currentStepIndex: -1,
      isPlaying: false,
      queue: [],
      stack: [],
      visited: [],
      currentNode: null,
    });
    setFutureAlgorithm(null);
    setPendingAlgorithm(null);
  };

  const handleFutureAlgorithm = (algorithmName) => {
    setFutureAlgorithm(algorithmName);
    setAlgorithmState({
      currentAlgorithm: algorithmName,
      currentStepIndex: -1,
      isPlaying: false,
      queue: [],
      stack: [],
      visited: [],
      currentNode: null,
    });
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
            onRunBFS={handleRunBFS}
            onRunDFS={handleRunDFS}
            onPlay={handlePlay}
            onNextStep={handleNextStep}
            onResetAlgorithm={handleResetAlgorithm}
            onFutureAlgorithm={handleFutureAlgorithm}
          />
          <GraphCanvas
            ref={graphCanvasRef}
            onStateChange={handleStateChange}
            onAlgorithmStateChange={handleAlgorithmStateChange}
          />
          <RightSidebar
            algorithmState={algorithmState}
            futureAlgorithm={futureAlgorithm}
            pendingAlgorithm={pendingAlgorithm}
            availableNodes={availableNodes}
            onConfirmAlgorithm={handleConfirmAlgorithm}
            onCancelAlgorithm={handleCancelAlgorithm}
          />
        </div>
      </div>
    </section>
  );
};

export default GraphEditor;
