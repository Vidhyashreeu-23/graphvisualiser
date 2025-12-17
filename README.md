# Graph Visualizer – BFS & DFS with AI Explanations

An interactive web app for building graphs and visualizing BFS/DFS step-by-step, with **AI-generated explanations layered on top**. The **graph algorithms run entirely in deterministic frontend code**, while the AI is used **only to explain already-computed steps** and never affects traversal order or correctness.

---

## Features

- **Graph editor**
  - Add up to 26 nodes (`A`–`Z`) laid out in a circle.
  - Add/remove edges in **directed** or **undirected** mode.
  - Optional **weighted edges** (weights used for display; current algorithms treat the graph as unweighted).
  - Reset graph and algorithm state without reloading the page.

- **Algorithm visualizations**
  - **BFS**:
    - Plain traversal.
    - **Shortest path (unweighted)** between a chosen start and end node.
  - **DFS**:
    - Plain traversal.
    - **Path existence** between a chosen start and end node (not guaranteed shortest).
  - Step‑by‑step control: **Play**, **Next step**, **Reset**.
  - Visual feedback:
    - Default nodes (indigo), visited nodes (green), current node (yellow).
    - Queue / stack / visited panel on the right.

-- **AI-assisted explanations (fully decoupled from algorithm logic)** (optional)
  - For each step, sends a **read‑only snapshot** (algorithm, current node, queue/stack, visited, outcome for final step) to the backend.
   - AI receives a **read-only snapshot** of algorithm state; traversal logic is never modified by the model.
  - Backend calls **Groq LLM (llama‑3.1‑8b‑instant)** and returns a short, student‑friendly explanation.
  - Final steps focus on **outcomes** (path found / not found, shortest path reasoning), not low‑level queue/stack mechanics.
  - If the AI call fails or no API key is configured, a safe fallback explanation is used and the visualization still works.

- **Algorithm comparison panel**
  - Appears **only after an algorithm finishes** and only when the user clicks “Compare with other algorithms”.
  - Shows rule‑based guidance on when BFS vs DFS is more suitable, plus a small time/space complexity table.

---
## **AI Decoupling & Determinism Guarantee**
- BFS and DFS are implemented entirely on the frontend using deterministic logic.
- AI is called **only after each step is computed**.
- The backend acts as an explanation proxy and has **no authority** over graph traversal.
- Disabling AI does not change algorithm behavior or results.

---

## Project Structure (high level)

- `src/`
  - `App.js`, `AppRouter.jsx` – React entry + routing (`/` → Landing, `/editor` → Graph editor).
  - `pages/`
    - `LandingPage.js` – Simple landing page with a “Create Graph” call‑to‑action.
    - `GraphEditor.js` – Main editor layout (left tools, center canvas, right info).
  - `components/`
    - `GraphCanvas.js` – Cytoscape‑based graph rendering + BFS/DFS step generation.
    - `LeftSidebar.js` – Graph & algorithm controls (add node/edge, toggles, run/reset algorithms).
    - `RightSidebar.js` – Wraps `AlgorithmInfo`, `AlgorithmSetupPanel`, `DataStructuresPanel`.
    - `AlgorithmInfo.jsx` – Shows current algorithm, step count, and AI explanation.
    - `AlgorithmSetupPanel.jsx` – Lets the user pick start/end nodes and algorithm goal.
    - `DataStructuresPanel.jsx` – Displays queue/stack/visited arrays.
    - `AlgorithmComparisonPanel.jsx` – Optional slide‑over comparing BFS vs DFS (post‑run).
  - `services/`
    - `aiExplanationService.js` – Sends step snapshots to the backend (`/explain-step`).
  - `index.js`, `index.css` – React bootstrap and Tailwind styles.

- `server/`
  - `index.js` – Express server exposing `POST /explain-step`, calls Groq API, wraps responses.
  - `package.json` – Backend dependencies (`express`, `cors`, `node-fetch`, `dotenv`).

---

## Prerequisites

- **Node.js** `>= 18`
- A **Groq API key** (for AI explanations) – optional but recommended  
  You can get one from their developer portal.

---

## Setup & Installation

Clone the repo and install dependencies for both frontend and backend:

```bash
git clone <your-repo-url> graphvisualiser
cd graphvisualiser

# Install frontend deps
npm install

# Install backend deps
cd server
npm install
cd ..
```

---

## Configuration (AI explanations)

The app will run without an API key, but AI explanations will fall back to a generic message.

1. Create a `.env` file in the `server` folder:

```bash
cd server
cp .env.example .env  # if provided, otherwise create manually
```

2. Add your Groq key:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

3. Ensure the frontend proxy URL in `src/services/aiExplanationService.js` matches:

```js
const PROXY_URL = 'http://localhost:5000/explain-step';
```

---

## Running the App (Dev)

In one terminal, start the backend:

```bash
cd server
npm run start
```

In another terminal, start the React dev server:

```bash
cd graphvisualiser   # project root
npm start
```

- Frontend: `http://localhost:3000`
- Backend (AI explanations): `http://localhost:5000/explain-step`

> If the backend is not running or `GROQ_API_KEY` is missing/invalid, the app will still work; the AI panel will just show a fallback message.

---

## How the AI explanation layer works

1. When you run BFS/DFS and step through the algorithm, `GraphCanvas.js` builds a **step list**.
2. Each visual step is sent to `AlgorithmInfo.jsx` via `onAlgorithmStateChange`.
3. `AlgorithmInfo.jsx` calls `getAIExplanation(...)` with:
   - `algorithm`, `algorithmGoal`, `currentNode`, `queue`, `stack`, `visited`, `stepIndex`
   - For final steps (shortest‑path / path‑existence):
     - `isFinalStep`, `outcome` (`TARGET_FOUND` / `TARGET_NOT_FOUND`), `finalPath`, `startNode`, `endNode`
4. `aiExplanationService.js` forwards this to the backend.
5. `server/index.js`:
   - If `isFinalStep` is true → builds an **outcome‑focused prompt** (no queue/stack talk).
   - Otherwise → builds a **mechanics‑focused prompt** using queue/stack/visited.
6. Groq responds; the server returns a short explanation string back to the frontend.

Traversal order and logic are **never** influenced by AI; only the explanation text is.

---

## Key Design Constraints (for contributors)

- **Do not change BFS/DFS correctness** from the frontend; all AI logic must be read‑only.
- **Final step explanations** should describe:
  - Whether a path exists (DFS path existence / BFS shortest path).
  - Why the path is valid (and, for BFS in unweighted graphs, why it is shortest).
- **Middle steps** should explain:
  - Why the current node is being processed now.
  - How the queue/stack/visited structure leads to that choice.
- Comparison panel and AI are **optional helpers** – the core visualization must remain usable without them.

---

## Scripts

From the project root:

- `npm start` – Start React dev server (`localhost:3000`).
- `npm run build` – Create a production build of the frontend.

From the `server/` directory:

- `npm run start` – Start the explanation proxy server (`localhost:5000`).

---

## License

This project is built for learning and portfolio demonstration purposes.



