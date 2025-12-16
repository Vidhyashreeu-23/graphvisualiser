// NOTE: AI explanation is an optional, decoupled layer.
// The BFS / DFS algorithms run entirely in the frontend and remain deterministic.
// This service only explains why a given step happened and never controls traversal.

const PROXY_URL = 'http://localhost:5000/explain-step';

const FALLBACK_MESSAGE =
  'AI explanation unavailable. Showing algorithm visualization only.';

// Generate a short, student-friendly explanation for the current step.
// If the backend or AI fails, the graph visualization still works normally.
async function getAIExplanation(state) {
  const {
    algorithm,
    algorithmGoal = 'TRAVERSAL',
    currentNode,
    previousNode = null,
    queue = [],
    previousQueue = [],
    stack = [],
    previousStack = [],
    visited = [],
    previousVisited = [],
    stepIndex = 0,
    isFinalStep = false,
    finalPath = null,
    startNode = null,
    endNode = null,
  } = state || {};

  if (!algorithm || !currentNode) {
    return 'Run an algorithm to see step-by-step explanation.';
  }

  // Build a richer step snapshot that includes current and previous state
  // so the backend can explain what changed and why it matters.
  const stepSnapshot = {
    algorithm,
    algorithmGoal,
    stepIndex: typeof stepIndex === 'number' ? stepIndex : 0,
    currentNode,
    previousNode,
    queue,
    previousQueue,
    stack,
    previousStack,
    visited,
    previousVisited,
    isFinalStep: !!isFinalStep,
    finalPath: Array.isArray(finalPath) ? finalPath : null,
    startNode: startNode || null,
    endNode: endNode || null,
  };

  try {
    console.log('🚀 Sending step snapshot to backend:', stepSnapshot);
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stepSnapshot),
    });

    if (!response.ok) {
      console.error('AI explain-step proxy error:', response.status, await response.text());
      return FALLBACK_MESSAGE;
    }

    const data = await response.json();
    const explanation =
      typeof data?.explanation === 'string' ? data.explanation.trim() : '';

    if (!explanation) {
      console.warn('AI explain-step missing explanation payload', data);
      return FALLBACK_MESSAGE;
    }

    return explanation;
  } catch (error) {
    console.error('AI explain-step fetch error:', error);
    return FALLBACK_MESSAGE;
  }
}

export { getAIExplanation };

