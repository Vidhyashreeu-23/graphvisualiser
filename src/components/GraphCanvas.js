import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const GraphCanvas = () => {
  const cyRef = useRef(null);

  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cytoscape({
      container: cyRef.current,
      elements: [
        // nodes
        { data: { id: 'A', label: 'A' }, position: { x: 100, y: 100 } },
        { data: { id: 'B', label: 'B' }, position: { x: 250, y: 80 } },
        { data: { id: 'C', label: 'C' }, position: { x: 200, y: 200 } },
        // edges
        { data: { id: 'AB', source: 'A', target: 'B' } },
        { data: { id: 'BC', source: 'B', target: 'C' } },
        { data: { id: 'CA', source: 'C', target: 'A' } },
      ],
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
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'preset', // use the positions we defined above
      },
    });

    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div className="flex-1 h-full bg-gray-50 border-dashed border border-gray-300 rounded-xl">
      <div ref={cyRef} className="w-full h-[600px]" />
    </div>
  );
};

export default GraphCanvas;


