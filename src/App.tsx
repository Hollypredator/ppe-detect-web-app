import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Facilities } from './pages/Facilities';
import { Cameras } from './pages/Cameras';
import { Violations } from './pages/Violations';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 bg-gray-100 min-h-screen p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/violations" element={<Violations />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;