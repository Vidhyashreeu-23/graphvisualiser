import React from 'react';

const AlgorithmInfo = () => {
  return (
    <section className="rounded-xl border border-purple-100 bg-purple-50/70 shadow-sm p-4 space-y-2">
      <h3 className="text-sm font-semibold text-purple-900">Algorithm Info</h3>
      <p className="text-xs text-purple-900/80">
        This panel will show the current algorithm, step-by-step explanation, and key ideas in
        simple language.
      </p>
      <div className="rounded-lg border border-purple-100 bg-white/80 p-3 text-xs text-purple-900/80">
        <p className="font-medium">Nothing running yet</p>
        <p>Choose an algorithm later to see how it explores the graph.</p>
      </div>
    </section>
  );
};

export default AlgorithmInfo;



