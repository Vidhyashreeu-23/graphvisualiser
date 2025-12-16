import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// NOTE: AI explanation is intentionally kept as a thin proxy layer.
// The BFS / DFS algorithms run entirely in the frontend and remain
// deterministic. This server only explains why a given step occurred
// and never controls traversal, node order, or logic.

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.use(cors());
app.use(express.json());

/**
 * Build a compact, step-focused prompt for the LLM.
 * The prompt describes exactly one snapshot and does not ask about the future.
 */
function buildPrompt(stepSnapshot) {
  const {
    algorithm,
    algorithmGoal,
    stepIndex,
    currentNode,
    previousNode,
    queue = [],
    previousQueue = [],
    stack = [],
    previousStack = [],
    visited = [],
    previousVisited = [],
    isFinalStep,
    finalPath,
    startNode,
    endNode,
  } = stepSnapshot || {};

  const lines = [];
  const algo = algorithm || 'UNKNOWN';
  const goal = algorithmGoal || 'TRAVERSAL';
  const stepNumber = typeof stepIndex === 'number' ? stepIndex + 1 : undefined;
  const isFirstStep = !previousNode && (!previousVisited || previousVisited.length === 0);
  const finalPathList = Array.isArray(finalPath) ? finalPath : [];

  lines.push(`Algorithm: ${algo}`);
  lines.push(`Goal: ${goal}`);
  if (typeof stepNumber === 'number') {
    lines.push(`Step number: ${stepNumber}`);
  }
  if (startNode) {
    lines.push(`Start node: ${startNode}`);
  }
  if (endNode) {
    lines.push(`End node: ${endNode}`);
  }
  if (currentNode) {
    lines.push(`Current node: ${currentNode}`);
  }
  if (previousNode) {
    lines.push(`Previous node: ${previousNode}`);
  }

  // Current data structures for natural explanation.
  lines.push('');
  lines.push('Current data structures:');
  lines.push(`- Queue (front → back): [${queue.join(', ')}]`);
  lines.push(`- Stack (top is last): [${stack.join(', ')}]`);
  lines.push(`- Visited: [${visited.join(', ')}]`);

  if (finalPathList.length > 0) {
    lines.push('');
    lines.push(`Shortest path found: ${finalPathList.join(' → ')}`);
  }

  lines.push('');
  lines.push('Explanation instructions:');

  if (isFirstStep) {
    lines.push(
      '- This is the first step. Briefly explain what BFS or DFS does and why the start node is chosen.'
    );
  } else if (isFinalStep) {
    lines.push('- This is the final step of the run.');
    if (algo === 'BFS' && goal === 'SHORTEST_PATH' && finalPathList.length > 0 && startNode && endNode) {
      lines.push(
        `- The algorithm found the shortest path from ${startNode} to ${endNode}: ${finalPathList.join(' → ')}.`
      );
      lines.push(
        '- Explain WHY this path is guaranteed to be shortest: BFS explores nodes level by level (by distance from start), so when it first reaches the end node, that path must be shortest in an unweighted graph.'
      );
      lines.push(
        '- Mention that BFS processes nodes in order of increasing distance, so the first path found to the end node is always shortest.'
      );
    } else if (algo === 'DFS' && goal === 'PATH_EXISTENCE' && finalPathList.length > 0 && startNode && endNode) {
      lines.push(
        `- The algorithm found a path from ${startNode} to ${endNode}: ${finalPathList.join(' → ')}.`
      );
      lines.push(
        '- Explain that this path is valid and connects start to end, but it is NOT guaranteed to be shortest because DFS explores deeply before backtracking, so it may find a longer path first.'
      );
    } else {
      lines.push('- Explain why the search stops at this step based on the data structures.');
    }
  } else {
    lines.push(
      '- This is a middle step. Explain why this node is processed now and what the queue or stack represents at this moment.'
    );
    lines.push(
      "- Do not repeat generic definitions like 'BFS uses a queue'; instead, explain naturally what is happening right now."
    );
  }

  lines.push(
    '- Do not predict or mention future steps.',
    '- Do not invent nodes or edges that are not in the lists above.',
    '- Keep the tone simple and student-friendly.',
    '- Explain in 2–3 short, clear sentences.'
  );

  lines.push('');
  lines.push(
    'Explain naturally why the algorithm is processing the current node at this moment, based on the queue or stack.'
  );

  return lines.join('\n');
}

/**
 * Very small, deterministic fallback explanations driven by reasonCode.
 * This keeps explanations available even if the Groq API fails.
 */
function getFallbackExplanation(stepSnapshot) {
  const { algorithm, currentNode } = stepSnapshot || {};
  const algo = algorithm || 'the algorithm';
  const node = currentNode || 'the current node';
  return `The algorithm ${algo} processes node ${node} according to its traversal rules.`;
}

// AI explanation endpoint – completely decoupled from traversal logic.
app.post('/explain-step', async (req, res) => {
  console.log('✅ Received explain-step request:', req.body);
  const stepSnapshot = req.body || {};

  // If the Groq API key is missing, fall back immediately.
  if (!GROQ_API_KEY) {
    const explanation = getFallbackExplanation(stepSnapshot);
    return res.json({ explanation });
  }

  const systemPrompt = `
You are an algorithm tutor explaining what is happening at each step.

Explain WHY the current step is happening using:
- the current node
- the current queue or stack
- the visited nodes

Rules:
- Do NOT say phrases like "difference between steps" or "previous state".
- Do NOT use meta language (no "in this step we see", no "the difference is").
- Speak naturally, as if teaching a student watching the algorithm run.
- Do NOT repeat algorithm definitions in every step.

Special cases:
- First step: briefly explain what BFS or DFS does and why the start node is chosen.
- Middle steps: explain why this node is processed now and what the queue/stack represents at this moment.
- Final step:
  • If BFS + shortest path → explain why this path is shortest in an unweighted graph.
  • If DFS → explain why the path is valid but not guaranteed shortest.

Keep explanations to 2–3 short sentences.
Do NOT predict future steps.
Do NOT invent nodes or edges.
`;

  const userPrompt = buildPrompt(stepSnapshot);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 120,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq explain-step error status:', response.status, errorText);
      const explanation = getFallbackExplanation(stepSnapshot);
      return res.json({ explanation });
    }

    const data = await response.json();
    console.log('Groq raw response:', JSON.stringify(data, null, 2));

    let explanation = data?.choices?.[0]?.message?.content?.trim();
    if (!explanation) {
      console.warn('Groq returned empty explanation, using fallback');
      explanation = getFallbackExplanation(stepSnapshot);
    }

    return res.json({ explanation });
  } catch (err) {
    console.error('Groq explain-step fetch error:', err);
    const explanation = getFallbackExplanation(stepSnapshot);
    return res.json({ explanation });
  }
});

app.listen(PORT, () => {
  console.log(`Explanation proxy running on http://localhost:${PORT}`);
  console.log('🔑 Groq key present:', !!process.env.GROQ_API_KEY);
});

/**
 * Example request body (JSON):
 *
 * {
 *   "algorithm": "BFS",
 *   "stepNumber": 3,
 *   "currentNode": "C",
 *   "action": "DEQUEUE",
 *   "dataStructure": {
 *     "queue": ["D", "E"],
 *     "visited": ["A", "B", "C"]
 *   },
 *   "reasonCode": "FIFO_QUEUE"
 * }
 *
 * Example JSON response:
 * {
 *   "explanation": "C is removed from the front of the queue because BFS always processes the oldest queued node first, moving level by level through the graph."
 * }
 */

