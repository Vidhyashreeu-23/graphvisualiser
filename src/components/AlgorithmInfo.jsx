import React, { useState, useEffect, useRef } from 'react';
import { getAIExplanation } from '../services/aiExplanationService';

const AlgorithmInfo = ({ algorithmState, futureAlgorithm = null }) => {
  const {
    currentAlgorithm,
    currentStepIndex,
    totalSteps,
    currentNode,
    queue,
    stack,
    visited,
    startNode,
    endNode,
    shortestPath,
    path,
    foundPath,
    pathFound,
    algorithmGoal,
    outcome,
    finalPath: stateFinalPath,
    isFinalStep: stateIsFinalStep,
    previousStep,
  } = algorithmState || {};

  const isFutureAlgorithm = futureAlgorithm !== null;
  const [explanation, setExplanation] = useState('Run an algorithm to see step-by-step explanation.');
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef(null);

  // Fetch AI explanation when algorithm state changes
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const prev = previousStep || {};
    const effectiveCurrentNode = currentNode || prev.currentNode || null;

    if (!currentAlgorithm || !effectiveCurrentNode) {
      setExplanation('Run an algorithm to see step-by-step explanation.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Create a timeout to prevent hanging
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setExplanation('AI explanation is taking longer than expected. Please check your API key and connection.');
    }, 10000); // 10 second timeout
    
    const isFinalStep = stateIsFinalStep === true || (totalSteps > 0 && currentStepIndex === totalSteps - 1);

    // finalPath is used only when a goal actually asks for a path.
    // Prefer any explicit finalPath from the step, then fall back to existing fields.
    let finalPath = Array.isArray(stateFinalPath) && stateFinalPath.length > 0 ? stateFinalPath : null;
    if (!finalPath) {
      if (algorithmGoal === 'SHORTEST_PATH' && Array.isArray(shortestPath) && shortestPath.length > 0) {
        finalPath = shortestPath;
      } else if (
        algorithmGoal === 'PATH_EXISTENCE' &&
        (foundPath || pathFound) &&
        Array.isArray(path) &&
        path.length > 0
      ) {
        finalPath = path;
      }
    }

    // Derive a simple outcome label for the final step when not provided.
    let derivedOutcome = outcome || null;
    if (!derivedOutcome && isFinalStep) {
      const hasPath = Array.isArray(finalPath) && finalPath.length > 0;
      if (algorithmGoal === 'SHORTEST_PATH' || algorithmGoal === 'PATH_EXISTENCE') {
        derivedOutcome = hasPath ? 'TARGET_FOUND' : 'TARGET_NOT_FOUND';
      }
    }

    getAIExplanation({
      algorithm: currentAlgorithm,
      algorithmGoal: algorithmGoal || 'TRAVERSAL',
      currentNode: effectiveCurrentNode,
      previousNode: prev.currentNode || null,
      queue: queue || [],
      previousQueue: prev.queue || [],
      stack: stack || [],
      previousStack: prev.stack || [],
      visited: visited || [],
      previousVisited: prev.visited || [],
      stepIndex: currentStepIndex || 0,
      isFinalStep,
      finalPath: finalPath || null,
      outcome: derivedOutcome || null,
      startNode: startNode || null,
      endNode: endNode || null,
    })
      .then((result) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setExplanation(result);
        setIsLoading(false);
      })
      .catch((error) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        console.error('Failed to get AI explanation:', error);
        setExplanation('AI explanation unavailable. Please check your connection and API key.');
        setIsLoading(false);
      });

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [currentAlgorithm, currentNode, currentStepIndex, queue?.join(','), stack?.join(','), visited?.join(',')]);

  return (
    <section className="rounded-xl border border-purple-100 bg-purple-50/70 shadow-sm p-4 space-y-2">
      <h3 className="text-sm font-semibold text-purple-900">Algorithm Info</h3>
      <p className="text-xs text-purple-900/80">
        This panel will show the current algorithm, step-by-step explanation, and key ideas in
        simple language.
      </p>
      <div className="rounded-lg border border-purple-100 bg-white/80 p-3 text-xs text-purple-900/80 space-y-1">
        {!currentAlgorithm && (
          <>
            <p className="font-medium">Select an algorithm to begin</p>
            <p>Choose an algorithm to see how it explores the graph.</p>
          </>
        )}
        {isFutureAlgorithm && (
          <>
            <p className="font-medium">{futureAlgorithm}</p>
            <p className="mt-2">This algorithm will be supported in a future stage.</p>
          </>
        )}
        {currentAlgorithm && !isFutureAlgorithm && (
          <>
            <p className="font-medium">{currentAlgorithm}</p>
            {currentStepIndex >= 0 && totalSteps > 0 && (
              <p className="mt-2">
                Step {currentStepIndex + 1} of {totalSteps}
              </p>
            )}
            {/* Simple textual summary based on the chosen goal */}
            {currentAlgorithm === 'BFS' && startNode && (!algorithmGoal || algorithmGoal === 'TRAVERSAL') && (
              <p className="mt-1">
                {`BFS traversal from node ${startNode}.`}
              </p>
            )}
            {currentAlgorithm === 'BFS' &&
              algorithmGoal === 'SHORTEST_PATH' &&
              startNode &&
              endNode &&
              totalSteps > 0 && (
                <p className="mt-1">
                  {Array.isArray(shortestPath) && shortestPath.length > 0
                    ? `Shortest path from ${startNode} to ${endNode}: ${shortestPath.join(' \u2192 ')}`
                    : currentStepIndex === totalSteps - 1
                    ? `No path exists between ${startNode} and ${endNode} (unweighted BFS).`
                    : 'BFS is exploring level by level to find the shortest path in this unweighted graph.'}
                </p>
              )}

            {currentAlgorithm === 'DFS' && startNode && (!algorithmGoal || algorithmGoal === 'TRAVERSAL') && (
              <p className="mt-1">
                {`DFS traversal from node ${startNode}.`}
              </p>
            )}
            {currentAlgorithm === 'DFS' &&
              algorithmGoal === 'PATH_EXISTENCE' &&
              startNode &&
              endNode &&
              totalSteps > 0 && (
                <p className="mt-1">
                  {foundPath && Array.isArray(path) && path.length > 0
                    ? `A path exists from ${startNode} to ${endNode}: ${path.join(' \u2192 ')}`
                    : currentStepIndex === totalSteps - 1
                    ? `No path exists between ${startNode} and ${endNode} for this DFS run.`
                    : 'DFS is searching for any path between the selected nodes (not necessarily the shortest).'}
                </p>
              )}
          </>
        )}
      </div>

      {/* AI-Assisted Explanation Section */}
      <div className="mt-4 pt-4 border-t border-purple-200">
        <h4 className="text-xs font-semibold text-purple-900 mb-2">AI-Assisted Explanation</h4>
        <div className="rounded-lg border border-purple-100 bg-white/80 p-3 text-xs text-purple-900/80">
          {isLoading ? (
            <p className="leading-relaxed opacity-60">Loading explanation...</p>
          ) : (
            <p className="leading-relaxed">{explanation}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AlgorithmInfo;



