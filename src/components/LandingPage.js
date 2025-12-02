import React from 'react';
import { Link } from 'react-router-dom';

const cardData = [
  {
    key: 'create',
    title: 'Create Graph',
    description: 'Start building a graph from scratch using simple tools.',
    action: 'Start Creating',
    icon: (
      <svg
        className="w-8 h-8 text-indigo-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="12" cy="18" r="2" />
        <path d="M7.5 7.5 11 16" />
        <path d="M16.5 7.5 13 16" />
        <path d="M8 6h8" />
      </svg>
    ),
  },
  {
    key: 'import',
    title: 'Import Graph',
    description: 'Upload adjacency lists or matrices from your files.',
    action: 'Import File',
    icon: (
      <svg
        className="w-8 h-8 text-indigo-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 20h16" />
        <path d="M12 4v12" />
        <path d="m8 10 4-4 4 4" />
      </svg>
    ),
  },
  {
    key: 'demo',
    title: 'Try Demo Graph',
    description: 'Open a ready-made graph to preview the editor layout.',
    action: 'Try Demo',
    icon: (
      <svg
        className="w-8 h-8 text-indigo-700"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M10 9h.01" />
        <path d="M14 9h.01" />
        <path d="M9 15c1 .8 2.3 1.2 3 1.2s2-.4 3-1.2" />
      </svg>
    ),
  },
];

const LandingPage = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-500 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <header className="flex items-center justify-center">
          <div className="text-lg font-semibold tracking-wide">Graph Visualizer</div>
        </header>

        <div className="text-center mt-16 space-y-4">
          <p className="uppercase tracking-[0.3em] text-white/80 text-sm">AI Assisted</p>
          <h1 className="text-5xl md:text-6xl font-bold">Graph Visualizer</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Make understanding complex graph algorithms intuitive. Experiment with your own graphs
            and see how algorithms work in real-time.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-16">
          {cardData.map((card) => (
            <div
              key={card.key}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur"
            >
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-5">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="text-sm text-white/80 mt-3 mb-6">{card.description}</p>
              {card.key === 'create' ? (
                <Link
                  to="/editor"
                  className="bg-white text-indigo-700 font-medium px-4 py-2 rounded w-full text-center"
                >
                  {card.action}
                </Link>
              ) : (
                <button className="bg-white text-indigo-700 font-medium px-4 py-2 rounded w-full">
                  {card.action}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
