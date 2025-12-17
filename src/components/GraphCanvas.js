import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import cytoscape from 'cytoscape';

const GraphCanvas = forwardRef(({ onStateChange, onAlgorithmStateChange }, ref) => {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeCounter, setNodeCounter] = useState(0);
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const [edgeCreationMode, setEdgeCreationMode] = useState(false);
  const [firstNodeForEdge, setFirstNodeForEdge] = useState(null);

  // Algorithm state
  const [bfsSteps, setBfsSteps] = useState([]);
  const [dfsSteps, setDfsSteps] = useState([]);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  // Use refs to track current state for event handlers
  const edgeCreationModeRef = useRef(edgeCreationMode);
  const firstNodeForEdgeRef = useRef(firstNodeForEdge);
  const edgesRef = useRef(edges);
  const isDirectedRef = useRef(isDirected);
  const isWeightedRef = useRef(isWeighted);

  // Keep refs in sync with state
  useEffect(() => {
    edgeCreationModeRef.current = edgeCreationMode;
  }, [edgeCreationMode]);

  useEffect(() => {
    firstNodeForEdgeRef.current = firstNodeForEdge;
  }, [firstNodeForEdge]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    isDirectedRef.current = isDirected;
  }, [isDirected]);

  useEffect(() => {
    isWeightedRef.current = isWeighted;
  }, [isWeighted]);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        isDirected,
        isWeighted,
        edgeCreationMode,
      });
    }
  }, [isDirected, isWeighted, edgeCreationMode, onStateChange]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cytoscape({
      container: cyRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4f46e5',
            'label': 'data(label)',
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': 12,
            'width': 40,
            'height': 40,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#9ca3af',
            'target-arrow-color': '#9ca3af',
            'target-arrow-shape': 'none',
            'curve-style': 'bezier',
            'label': 'data(weight)',
            'font-size': 11,
            'text-margin-y': -10,
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.8,
            'text-background-padding': '3px',
            'text-border-width': 1,
            'text-border-color': '#9ca3af',
            'text-border-opacity': 0.5,
          },
        },
      ],
    });

    cyInstanceRef.current = cy;

    // Handle node clicks for edge creation
    cy.on('tap', 'node', (evt) => {
      if (edgeCreationModeRef.current) {
        const clickedNode = evt.target.id();
        handleNodeClickForEdge(clickedNode);
      }
    });

    return () => {
      cy.destroy();
    };
  }, []);

  // Update Cytoscape when nodes or edges change
  useEffect(() => {
    if (!cyInstanceRef.current) return;

    const cy = cyInstanceRef.current;
    
    // Remove all elements
    cy.elements().remove();
    
    // Add nodes
    nodes.forEach((node) => {
      cy.add({
        data: { id: node.id, label: node.label },
        position: node.position,
      });
    });

    // Add edges
    edges.forEach((edge) => {
      const edgeData = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
      };
      // Always include weight if it exists
      if (edge.weight !== undefined) {
        edgeData.weight = edge.weight;
      }
      const edgeElement = cy.add({
        data: edgeData,
      });
      
      // Set label immediately if weighted mode is ON and weight exists
      if (isWeighted && edge.weight !== undefined) {
        edgeElement.style('label', String(edge.weight));
      }
    });
  }, [nodes, edges]);

  // Update edge styles when directed mode changes
  useEffect(() => {
    if (!cyInstanceRef.current) return;

    const cy = cyInstanceRef.current;
    if (isDirected) {
      cy.style()
        .selector('edge')
        .style('target-arrow-shape', 'triangle')
        .update();
    } else {
      cy.style()
        .selector('edge')
        .style('target-arrow-shape', 'none')
        .update();
    }
  }, [isDirected]);

  // Update edge labels when weighted mode changes
  useEffect(() => {
    if (!cyInstanceRef.current) return;

    const cy = cyInstanceRef.current;
    if (isWeighted) {
      // Show weights for all edges
      cy.edges().forEach((edge) => {
        const weight = edge.data('weight');
        if (weight !== undefined) {
          edge.style('label', String(weight));
        } else {
          edge.style('label', '');
        }
      });
    } else {
      // Hide all weight labels
      cy.edges().forEach((edge) => {
        edge.style('label', '');
      });
    }
  }, [isWeighted, edges]);

  // Get adjacency list from Cytoscape graph
  const getAdjacencyList = () => {
    if (!cyInstanceRef.current) return {};
    
    const cy = cyInstanceRef.current;
    const adjacencyList = {};
    
    // Initialize all nodes
    cy.nodes().forEach((node) => {
      adjacencyList[node.id()] = [];
    });
    
    // Add edges
    cy.edges().forEach((edge) => {
      const source = edge.source().id();
      const target = edge.target().id();
      
      if (!adjacencyList[source]) {
        adjacencyList[source] = [];
      }
      adjacencyList[source].push(target);
      
      // If undirected, add reverse edge
      if (!isDirected) {
        if (!adjacencyList[target]) {
          adjacencyList[target] = [];
        }
        adjacencyList[target].push(source);
      }
    });
    
    return adjacencyList;
  };

  // Generate BFS steps
  // Optionally supports shortest path in unweighted graphs when an end node is provided
  // and the user explicitly chooses that goal.
  const generateBFSSteps = (startNodeId, endNodeId, algorithmGoal) => {
    if (!cyInstanceRef.current || nodes.length === 0) return [];
    
    const adjacencyList = getAdjacencyList();
    const steps = [];
    const queue = [];
    const visited = [];
    const startNode = startNodeId || nodes[0].id;
    // Only enable shortest path mode when the user selected it,
    // the graph is unweighted, and we have an end node.
    const useShortestPath =
      algorithmGoal === 'SHORTEST_PATH' && !!endNodeId && !isWeighted;
    const parent = {};
    const distance = {};
    let shortestPath = null;
    let foundEnd = false;
    
    queue.push(startNode);
    visited.push(startNode);
    if (useShortestPath) {
      parent[startNode] = null;
      distance[startNode] = 0;
    }
    
    const firstStep = {
      currentNode: startNode,
      visited: [...visited],
      queue: [...queue],
    };
    if (useShortestPath) {
      firstStep.parent = { ...parent };
      firstStep.distance = { ...distance };
      firstStep.startNode = startNode;
      firstStep.endNode = endNodeId;
    }
    steps.push(firstStep);
    
    while (queue.length > 0 && !foundEnd) {
      const current = queue.shift();
      const neighbors = adjacencyList[current] || [];
      
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!visited.includes(neighbor)) {
          visited.push(neighbor);
          queue.push(neighbor);
          if (useShortestPath) {
            parent[neighbor] = current;
            distance[neighbor] = distance[current] + 1;
          }

          const step = {
            currentNode: neighbor,
            visited: [...visited],
            queue: [...queue],
          };

          if (useShortestPath) {
            step.parent = { ...parent };
            step.distance = { ...distance };
            step.startNode = startNode;
            step.endNode = endNodeId;
          }

          // If we are looking for a shortest path in an unweighted graph, stop when we reach endNode
          if (useShortestPath && neighbor === endNodeId) {
            // Reconstruct shortest path from parent pointers
            const path = [];
            let currentNode = neighbor;
            while (currentNode !== null && currentNode !== undefined) {
              path.unshift(currentNode);
              currentNode = parent[currentNode];
            }
            shortestPath = path;
            step.shortestPath = [...shortestPath];
            foundEnd = true;
          }

          steps.push(step);

          if (foundEnd) {
            break;
          }
        }
      }
    }

    // Final summary step with path information (if requested and computed).
    // This step is used only for explanation/visualization and does not affect traversal.
    if (useShortestPath) {
      const hasPath = Array.isArray(shortestPath) && shortestPath.length > 0;
      const finalPath = hasPath ? [...shortestPath] : [];
      const outcome = hasPath ? 'TARGET_FOUND' : 'TARGET_NOT_FOUND';

      steps.push({
        currentNode: null,
        visited: [...visited],
        queue: [],
        parent: { ...parent },
        distance: { ...distance },
        shortestPath: finalPath,
        pathFound: hasPath,
        startNode: startNode,
        endNode: endNodeId,
        // Extra metadata for AI explanations (read-only).
        isFinalStep: true,
        outcome,
        finalPath,
        algorithm: 'BFS',
        algorithmGoal: 'SHORTEST_PATH',
      });
    }

    return steps;
  };

  // Generate DFS steps using recursion
  // Optionally supports finding one path between start and end nodes (not necessarily shortest)
  // when the user chooses the PATH_EXISTENCE goal.
  const generateDFSSteps = (startNodeId, endNodeId, algorithmGoal) => {
    if (!cyInstanceRef.current || nodes.length === 0) return [];
    
    const adjacencyList = getAdjacencyList();
    const steps = [];
    const visited = [];
    const stack = [];
    const startNode = startNodeId || nodes[0].id;
    const usePathExistence = algorithmGoal === 'PATH_EXISTENCE' && !!endNodeId;
    const path = [];
    let foundEnd = false;
    let foundPath = null;
    
    // Recursive DFS helper
    const dfs = (node) => {
      if (foundEnd) {
        return;
      }

      visited.push(node);
      stack.push(node);
      path.push(node);
      
      const step = {
        currentNode: node,
        visited: [...visited],
        stack: [...stack],
        // Track the current recursion path so we can show one concrete path if needed.
        path: [...path],
        startNode: startNode,
        endNode: endNodeId || null,
      };

      steps.push(step);

      if (usePathExistence && node === endNodeId) {
        foundEnd = true;
        foundPath = [...path];
        return;
      }
      
      const neighbors = adjacencyList[node] || [];
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!visited.includes(neighbor)) {
          dfs(neighbor);
          if (foundEnd) {
            break;
          }
        }
      }
      
      stack.pop();
      path.pop();
    };
    
    dfs(startNode);

    // Final summary step with path information (only when path existence was requested).
    // This step is used only for explanation/visualization and does not affect traversal.
    if (usePathExistence) {
      const hasPath = Array.isArray(foundPath) && foundPath.length > 0;
      const finalPath = hasPath ? [...foundPath] : [];
      const outcome = hasPath ? 'TARGET_FOUND' : 'TARGET_NOT_FOUND';

      steps.push({
        currentNode: null,
        visited: [...visited],
        stack: [],
        path: finalPath,
        foundPath: hasPath,
        startNode: startNode,
        endNode: endNodeId,
        // Extra metadata for AI explanations (read-only).
        isFinalStep: true,
        outcome,
        finalPath,
        algorithm: 'DFS',
        algorithmGoal: 'PATH_EXISTENCE',
      });
    }

    return steps;
  };

  // Apply algorithm visualization
  const applyAlgorithmVisualization = (currentNode, visited) => {
    if (!cyInstanceRef.current) return;
    
    const cy = cyInstanceRef.current;
    
    // Reset all nodes to default color
    cy.nodes().style('background-color', '#4f46e5');
    
    // Color visited nodes green
    visited.forEach((nodeId) => {
      cy.getElementById(nodeId).style('background-color', '#10b981');
    });
    
    // Color current node yellow
    if (currentNode) {
      cy.getElementById(currentNode).style('background-color', '#eab308');
    }
  };

  // Handle node click for edge creation
  const handleNodeClickForEdge = (nodeId) => {
    const currentFirstNode = firstNodeForEdgeRef.current;
    const currentEdges = edgesRef.current;
    const currentIsDirected = isDirectedRef.current;
    const currentIsWeighted = isWeightedRef.current;

    if (!currentFirstNode) {
      // First node selected
      setFirstNodeForEdge(nodeId);
      if (cyInstanceRef.current) {
        cyInstanceRef.current.getElementById(nodeId).style('background-color', '#eab308');
      }
    } else {
      // Second node selected
      if (currentFirstNode === nodeId) {
        // Same node clicked, cancel
        if (cyInstanceRef.current) {
          cyInstanceRef.current.getElementById(currentFirstNode).style('background-color', '#4f46e5');
        }
        setFirstNodeForEdge(null);
        setEdgeCreationMode(false);
      } else {
        // Create edge
        let weight = undefined;
        if (currentIsWeighted) {
          // Prompt for weight for this specific edge
          const weightInput = prompt('Enter weight for this edge:');
          if (weightInput === null) {
            // User cancelled
            if (cyInstanceRef.current) {
              cyInstanceRef.current.getElementById(currentFirstNode).style('background-color', '#4f46e5');
            }
            setFirstNodeForEdge(null);
            setEdgeCreationMode(false);
            return;
          }
          const parsedWeight = parseFloat(weightInput);
          if (!isNaN(parsedWeight) && parsedWeight > 0) {
            weight = parsedWeight;
          } else {
            // Invalid input, ask again or use default
            alert('Please enter a valid positive number for the weight.');
            return;
          }
        }

        const edgeId = `${currentFirstNode}${nodeId}`;
        
        // Check if edge already exists
        let edgeExists = false;
        if (currentIsDirected) {
          // For directed: only check exact direction
          edgeExists = currentEdges.some(
            (e) => e.id === edgeId || (e.source === currentFirstNode && e.target === nodeId)
          );
        } else {
          // For undirected: check both directions
          const reverseEdgeId = `${nodeId}${currentFirstNode}`;
          edgeExists = currentEdges.some(
            (e) => e.id === edgeId || e.id === reverseEdgeId || 
                  (e.source === currentFirstNode && e.target === nodeId) || 
                  (e.source === nodeId && e.target === currentFirstNode)
          );
        }

        if (!edgeExists) {
          const newEdge = {
            id: edgeId,
            source: currentFirstNode,
            target: nodeId,
          };
          // Store weight if weighted mode is ON
          if (currentIsWeighted && weight !== undefined) {
            newEdge.weight = weight;
          }
          setEdges([...currentEdges, newEdge]);
        }

        // Reset highlighting
        if (cyInstanceRef.current) {
          cyInstanceRef.current.getElementById(currentFirstNode).style('background-color', '#4f46e5');
        }
        setFirstNodeForEdge(null);
        setEdgeCreationMode(false);
      }
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    addNode: () => {
      if (nodeCounter >= 26) {
        alert('Maximum 26 nodes allowed (A-Z)');
        return;
      }

      const nodeId = String.fromCharCode(65 + nodeCounter);
      const nodeCount = nodes.length;
      const radius = 150;
      const centerX = 300;
      const centerY = 300;
      const angle = (2 * Math.PI * nodeCount) / (nodeCount + 1);
      
      const newNode = {
        id: nodeId,
        label: nodeId,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      };

      setNodes([...nodes, newNode]);
      setNodeCounter(nodeCounter + 1);
    },
    toggleEdgeMode: () => {
      if (edgeCreationMode) {
        // Cancel edge mode
        if (firstNodeForEdge && cyInstanceRef.current) {
          cyInstanceRef.current.getElementById(firstNodeForEdge).style('background-color', '#4f46e5');
        }
        setFirstNodeForEdge(null);
        setEdgeCreationMode(false);
      } else {
        setEdgeCreationMode(true);
      }
    },
    toggleDirected: () => {
      setIsDirected((prev) => !prev);
    },
    toggleWeighted: () => {
      setIsWeighted((prev) => !prev);
    },
    resetGraph: () => {
      setNodes([]);
      setEdges([]);
      setNodeCounter(0);
      setEdgeCreationMode(false);
      setFirstNodeForEdge(null);
    },
    getAvailableNodes: () => {
      return nodes.map((node) => node.id);
    },
    runBFS: (startNode, endNode, algorithmGoal) => {
      const steps = generateBFSSteps(startNode, endNode, algorithmGoal);
      if (steps.length === 0) {
        alert('Please add nodes to the graph first.');
        return;
      }
      setBfsSteps(steps);
      setDfsSteps([]);
      setCurrentAlgorithm('BFS');
      setCurrentStepIndex(0);
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    },
    runDFS: (startNode, endNode, algorithmGoal) => {
      const steps = generateDFSSteps(startNode, endNode, algorithmGoal);
      if (steps.length === 0) {
        alert('Please add nodes to the graph first.');
        return;
      }
      setDfsSteps(steps);
      setBfsSteps([]);
      setCurrentAlgorithm('DFS');
      setCurrentStepIndex(0);
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    },
    playAlgorithm: () => {
      if (currentAlgorithm && currentStepIndex >= 0) {
        setIsPlaying(true);
      }
    },
    nextStep: () => {
      if (currentAlgorithm === 'BFS' && currentStepIndex < bfsSteps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setIsPlaying(false);
      } else if (currentAlgorithm === 'DFS' && currentStepIndex < dfsSteps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setIsPlaying(false);
      }
    },
    resetAlgorithm: () => {
      setCurrentAlgorithm(null);
      setCurrentStepIndex(-1);
      setBfsSteps([]);
      setDfsSteps([]);
      setIsPlaying(false);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      // Reset node colors
      if (cyInstanceRef.current) {
        cyInstanceRef.current.nodes().style('background-color', '#4f46e5');
      }
      if (onAlgorithmStateChange) {
        onAlgorithmStateChange({
          currentAlgorithm: null,
          currentStepIndex: -1,
          isPlaying: false,
          queue: [],
          stack: [],
          visited: [],
          currentNode: null,
        });
      }
    },
  }));

  // Handle step visualization
  useEffect(() => {
    if (currentStepIndex < 0 || !currentAlgorithm) {
      return;
    }

    let currentStep = null;
    if (currentAlgorithm === 'BFS' && bfsSteps[currentStepIndex]) {
      currentStep = bfsSteps[currentStepIndex];
    } else if (currentAlgorithm === 'DFS' && dfsSteps[currentStepIndex]) {
      currentStep = dfsSteps[currentStepIndex];
    }

    if (currentStep) {
      applyAlgorithmVisualization(currentStep.currentNode, currentStep.visited);
      
      if (onAlgorithmStateChange) {
        const steps = currentAlgorithm === 'BFS' ? bfsSteps : dfsSteps;
        const previousStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
        const statePayload = {
          currentAlgorithm,
          currentStepIndex,
          isPlaying,
          totalSteps: steps.length,
          queue: currentStep.queue || [],
          stack: currentStep.stack || [],
          visited: currentStep.visited || [],
          currentNode: currentStep.currentNode,
          currentStep: currentStep,
          previousStep: previousStep,
        };

        // Propagate optional path-related metadata for BFS/DFS
        if (currentStep.startNode) {
          statePayload.startNode = currentStep.startNode;
        }
        if (currentStep.endNode) {
          statePayload.endNode = currentStep.endNode;
        }
        if (currentStep.shortestPath) {
          statePayload.shortestPath = currentStep.shortestPath;
        }
        if (currentStep.distance) {
          statePayload.distance = currentStep.distance;
        }
        if (currentStep.parent) {
          statePayload.parent = currentStep.parent;
        }
        if (currentStep.path) {
          statePayload.path = currentStep.path;
        }
        if (typeof currentStep.foundPath === 'boolean') {
          statePayload.foundPath = currentStep.foundPath;
        }
        if (typeof currentStep.pathFound === 'boolean') {
          statePayload.pathFound = currentStep.pathFound;
        }

        // Propagate final-outcome metadata for the last step (read-only, for AI explanations).
        if (typeof currentStep.isFinalStep === 'boolean') {
          statePayload.isFinalStep = currentStep.isFinalStep;
        }
        if (currentStep.finalPath) {
          statePayload.finalPath = currentStep.finalPath;
        }
        if (currentStep.outcome) {
          statePayload.outcome = currentStep.outcome;
        }
        if (currentStep.algorithmGoal) {
          statePayload.algorithmGoal = currentStep.algorithmGoal;
        }

        onAlgorithmStateChange(statePayload);
      }
    }
  }, [currentStepIndex, currentAlgorithm, bfsSteps, dfsSteps, isPlaying, onAlgorithmStateChange]);

  // Handle Play animation
  useEffect(() => {
    if (!isPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      return;
    }

    const steps = currentAlgorithm === 'BFS' ? bfsSteps : dfsSteps;
    if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    playIntervalRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const currentSteps = currentAlgorithm === 'BFS' ? bfsSteps : dfsSteps;
        if (prev >= currentSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, currentStepIndex, currentAlgorithm, bfsSteps, dfsSteps]);

  return (
    <div className="flex-1 h-full bg-gray-50 border-dashed border border-gray-300 rounded-xl">
      <div ref={cyRef} className="w-full h-[600px]" />
    </div>
  );
});

GraphCanvas.displayName = 'GraphCanvas';

export default GraphCanvas;
