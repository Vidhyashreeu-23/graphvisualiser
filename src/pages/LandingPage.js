import React from 'react';
import { Link } from 'react-router-dom';

const cardData = [
  {
    key: 'create',
    title: 'Create Graph',
    description: 'Start building a graph from scratch using simple tools.',
    action: 'Start Creating',
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

        <div className="grid gap-6 md:grid-cols-1 mt-16 place-items-center">
          {cardData.map((card) => (
            <div
              key={card.key}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur max-w-sm w-full"
            >
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-5">
                <span className="text-2xl text-indigo-700" aria-hidden="true">
                  ●
                </span>
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
                <button className="bg-white/90 text-indigo-700 font-medium px-4 py-2 rounded w-full">
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



