import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import cytoscape from 'cytoscape';

const GraphCanvas = forwardRef(({ onStateChange }, ref) => {
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);
  
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeCounter, setNodeCounter] = useState(0);
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const [edgeCreationMode, setEdgeCreationMode] = useState(false);
  const [firstNodeForEdge, setFirstNodeForEdge] = useState(null);

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
  }));

  return (
    <div className="flex-1 h-full bg-gray-50 border-dashed border border-gray-300 rounded-xl">
      <div ref={cyRef} className="w-full h-[600px]" />
    </div>
  );
});

GraphCanvas.displayName = 'GraphCanvas';

export default GraphCanvas;
