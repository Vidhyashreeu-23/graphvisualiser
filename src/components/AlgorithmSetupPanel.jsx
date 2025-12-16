import React, { useState } from 'react';

const AlgorithmSetupPanel = ({ pendingAlgorithm, onConfirm, onCancel, availableNodes }) => {
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  // Let the user choose what they want the algorithm to do.
  // Default is simple traversal so existing behavior stays the same.
  const [algorithmGoal, setAlgorithmGoal] = useState('TRAVERSAL');

  const handleConfirm = () => {
    if (!startNode.trim()) {
      alert('Please enter a start node.');
      return;
    }
    
    // Validate start node exists
    if (!availableNodes.includes(startNode.trim().toUpperCase())) {
      alert(`Node "${startNode.trim().toUpperCase()}" does not exist in the graph.`);
      return;
    }

    // Validate end node if provided
    if (endNode.trim() && !availableNodes.includes(endNode.trim().toUpperCase())) {
      alert(`Node "${endNode.trim().toUpperCase()}" does not exist in the graph.`);
      return;
    }

    onConfirm({
      startNode: startNode.trim().toUpperCase(),
      endNode: endNode.trim() ? endNode.trim().toUpperCase() : null,
      algorithmGoal,
    });
  };

  const handleCancel = () => {
    setStartNode('');
    setEndNode('');
    setAlgorithmGoal('TRAVERSAL');
    onCancel();
  };

  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/70 shadow-sm p-4 space-y-3">
      <h3 className="text-sm font-semibold text-blue-900">Algorithm Setup</h3>
      <p className="text-xs text-blue-900/80">
        Configure {pendingAlgorithm} algorithm parameters.
      </p>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-blue-900 mb-1">
            Start Node <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            placeholder="e.g., A"
            className="w-full text-sm rounded-lg border border-blue-200 bg-white px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            maxLength={1}
          />
          <p className="text-xs text-blue-900/60 mt-1">
            Enter the node ID to start from (A-Z)
          </p>
        </div>

        {/* Algorithm goal selection – kept simple and close to setup inputs */}
        <div>
          <p className="block text-xs font-medium text-blue-900 mb-1">
            Algorithm Goal
          </p>
          <p className="text-[11px] text-blue-900/70 mb-1">
            Choose what you want {pendingAlgorithm} to do before it runs.
          </p>
          <div className="space-y-1 text-xs text-blue-900/90">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="algorithmGoal"
                value="TRAVERSAL"
                checked={algorithmGoal === 'TRAVERSAL'}
                onChange={() => setAlgorithmGoal('TRAVERSAL')}
              />
              <span>
                Traversal only
                <span className="text-blue-900/60"> – visit nodes in order without focusing on a specific path.</span>
              </span>
            </label>

            {pendingAlgorithm === 'BFS' && (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="algorithmGoal"
                  value="SHORTEST_PATH"
                  checked={algorithmGoal === 'SHORTEST_PATH'}
                  onChange={() => setAlgorithmGoal('SHORTEST_PATH')}
                />
                <span>
                  Shortest path (unweighted)
                  <span className="text-blue-900/60"> – BFS finds the shortest path from start to end.</span>
                </span>
              </label>
            )}

            {pendingAlgorithm === 'DFS' && (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="algorithmGoal"
                  value="PATH_EXISTENCE"
                  checked={algorithmGoal === 'PATH_EXISTENCE'}
                  onChange={() => setAlgorithmGoal('PATH_EXISTENCE')}
                />
                <span>
                  Path existence
                  <span className="text-blue-900/60">
                    {' '}
                    – DFS looks for one path from start to end (not necessarily shortest).
                  </span>
                </span>
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-blue-900 mb-1">
            End Node <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={endNode}
            onChange={(e) => setEndNode(e.target.value)}
            placeholder="e.g., B (optional)"
            className="w-full text-sm rounded-lg border border-blue-200 bg-white px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            maxLength={1}
          />
          <p className="text-xs text-blue-900/60 mt-1">
            End node is optional and will be used for future features.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 text-xs rounded-lg border border-blue-200 bg-blue-500 text-white px-3 py-2 shadow-sm hover:bg-blue-600"
          >
            Confirm & Run
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 text-xs rounded-lg border border-blue-200 bg-white text-blue-800 px-3 py-2 shadow-sm hover:bg-blue-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
};

export default AlgorithmSetupPanel;

