import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import GraphEditor from './components/GraphEditor';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor" element={<GraphEditor />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
