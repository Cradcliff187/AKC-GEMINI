import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import EstimatesPage from './pages/EstimatesPage';
import PrimaryNavigation from './components/Navigation/PrimaryNavigation';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <PrimaryNavigation />
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/estimates" element={<EstimatesPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;