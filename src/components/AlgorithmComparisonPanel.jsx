import React from 'react';

const AlgorithmComparisonPanel = ({
  algorithm,
  algorithmGoal,
  isWeighted,
  isDirected,
  startNode,
  endNode,
  onClose,
}) => {
  const normalizedGoal = algorithmGoal || 'TRAVERSAL';
  const normalizedAlgorithm = algorithm || 'BFS';

  let verdictTitle = 'No clear recommendation';
  let verdictReasons = [];

  if (normalizedGoal === 'SHORTEST_PATH') {
    if (isWeighted) {
      verdictTitle = 'Neither BFS nor DFS is suitable.';
      verdictReasons = [
        'The graph contains weighted edges.',
        'BFS cannot guarantee shortest paths when weights are involved.',
        'DFS does not prioritize path length.',
        'Algorithms like Dijkstra are required for weighted shortest paths.',
      ];
    } else {
      verdictTitle = 'BFS is recommended.';
      verdictReasons = [
        'BFS explores the graph level by level from the start node.',
        'In an unweighted graph, the first time the target is reached, that path is guaranteed to be shortest.',
        'DFS may reach the target along a longer path because it explores deeply before backtracking.',
      ];
    }
  } else if (normalizedGoal === 'PATH_EXISTENCE') {
    verdictTitle = 'DFS is often preferred, but BFS also works.';
    verdictReasons = [
      'Both BFS and DFS can determine whether a path exists between two nodes.',
      'DFS naturally follows one path deeply, which can feel intuitive when just checking for any connection.',
      'BFS can also be used, and may discover shorter paths, but path length is not required for this goal.',
    ];
  } else {
    // Default traversal-style goal
    if (normalizedAlgorithm === 'BFS') {
      verdictTitle = 'BFS is well-suited for broad exploration.';
      verdictReasons = [
        'BFS reveals the graph layer by layer, which is useful for understanding distance from the start node.',
        'It is a good choice when you care about how far nodes are from the start.',
        'DFS can still traverse the whole graph, but its deep-first order may feel less structured for overview.',
      ];
    } else if (normalizedAlgorithm === 'DFS') {
      verdictTitle = 'DFS is well-suited for deep exploration.';
      verdictReasons = [
        'DFS follows paths as far as possible before backtracking, which is helpful for exploring long chains.',
        'It is a good choice when you care about discovering deep structures or confirming reachability.',
        'BFS can give better intuition about distance levels, but DFS keeps the focus on one path at a time.',
      ];
    } else {
      verdictTitle = 'Both BFS and DFS can traverse the graph.';
      verdictReasons = [
        'BFS explores level by level, while DFS goes as deep as possible before backtracking.',
        'For simple traversal, either algorithm can visit all reachable nodes.',
      ];
    }
  }

  const graphTypeParts = [];
  graphTypeParts.push(isDirected ? 'Directed' : 'Undirected');
  graphTypeParts.push(isWeighted ? 'Weighted' : 'Unweighted');
  const graphType = graphTypeParts.join(' · ');

  return (
    <aside className="fixed inset-y-0 right-0 w-96 max-w-full bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Algorithm Comparison
          </p>
          <p className="text-sm font-medium text-slate-900">
            BFS vs DFS
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 text-sm px-2 py-1"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 text-sm text-slate-800">
        {/* Section B: Dynamic suitability verdict */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Suitability for This Run
          </h3>
          <div className="border border-indigo-100 bg-indigo-50 rounded-lg px-3 py-3 space-y-2">
            <p className="text-sm font-semibold text-indigo-900">
              {verdictTitle}
            </p>
            <ul className="list-disc list-inside text-xs text-indigo-900/90 space-y-1">
              {verdictReasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Complexity overview table */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Complexity Overview
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 font-semibold">
              <div className="px-3 py-2">Algorithm</div>
              <div className="px-3 py-2">Time Complexity</div>
              <div className="px-3 py-2">Space Complexity</div>
            </div>
            <div className="grid grid-cols-3 border-b border-slate-200">
              <div className="px-3 py-2 bg-slate-50">BFS</div>
              <div className="px-3 py-2">O(V + E)</div>
              <div className="px-3 py-2">O(V)</div>
            </div>
            <div className="grid grid-cols-3">
              <div className="px-3 py-2 bg-slate-50">DFS</div>
              <div className="px-3 py-2">O(V + E)</div>
              <div className="px-3 py-2">O(V)</div>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            V = number of vertices, E = number of edges
          </p>
        </section>

        {/* Section C: Context summary */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Context for This Comparison
          </h3>
          <div className="border border-slate-200 rounded-lg px-3 py-3 text-xs space-y-1 bg-slate-50">
            <p>
              <span className="font-semibold">Algorithm chosen:</span>{' '}
              {normalizedAlgorithm || '—'}
            </p>
            <p>
              <span className="font-semibold">Goal:</span>{' '}
              {normalizedGoal || 'TRAVERSAL'}
            </p>
            <p>
              <span className="font-semibold">Graph type:</span>{' '}
              {graphType}
            </p>
            <p>
              <span className="font-semibold">Start node:</span>{' '}
              {startNode || 'Not specified'}
            </p>
            <p>
              <span className="font-semibold">End node:</span>{' '}
              {endNode || 'Not specified'}
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
};

export default AlgorithmComparisonPanel;


