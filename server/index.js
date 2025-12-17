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
    outcome,
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

  // If this is the final step, focus on the outcome instead of queue/stack mechanics.
  if (isFinalStep) {
    lines.push('');
    lines.push('Final outcome:');
    if (typeof outcome === 'string') {
      lines.push(`- Outcome: ${outcome}`);
    }
    if (finalPathList.length > 0) {
      lines.push(`- Final path: ${finalPathList.join(' → ')}`);
    }
    lines.push('');
    lines.push('Explanation instructions:');

    if (outcome === 'TARGET_NOT_FOUND') {
      lines.push(
        'This is the final step of the algorithm.',
        'The target node was not found.',
        'Explain clearly why no path exists between the start and end nodes.',
        'Do NOT mention queues, stacks, or traversal mechanics.'
      );
    } else if (outcome === 'TARGET_FOUND') {
      lines.push(
        'This is the final step of the algorithm.',
        'The target node was found.',
        'Explain why the shown path is valid.'
      );

      if (algo === 'BFS' && goal === 'SHORTEST_PATH') {
        lines.push(
          'Explain why this path is guaranteed to be one of the shortest paths in an unweighted graph.'
        );
      }

      if (algo === 'DFS') {
        lines.push('Mention that the path is valid but not guaranteed to be shortest.');
      }
    } else {
      // Fallback wording if outcome is missing but isFinalStep is true.
      lines.push(
        'This is the final step of the algorithm.',
        'Explain the overall result of the search between the start and end nodes.',
        'Do NOT mention queues, stacks, or traversal mechanics.'
      );
    }

    lines.push(
      'Do not explain queue or stack operations.',
      'Do not mention previous steps.',
      'Answer in 2–3 clear, student-friendly sentences.'
    );

    return lines.join('\n');
  }

  // Current data structures for natural explanation (non-final steps only).
  lines.push('');
  lines.push('Current data structures:');
  lines.push(`- Queue (front → back): [${queue.join(', ')}]`);
  lines.push(`- Stack (top is last): [${stack.join(', ')}]`);
  lines.push(`- Visited: [${visited.join(', ')}]`);

  lines.push('');
  lines.push('Explanation instructions:');

  if (isFirstStep) {
    lines.push(
      '- This is the first step. Briefly explain what BFS or DFS does and why the start node is chosen.'
    );
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
If this is the final step, do NOT explain queue or stack behavior. Only explain the final outcome of the algorithm.
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

