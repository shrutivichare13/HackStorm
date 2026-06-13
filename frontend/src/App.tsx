/**
 * App Root Component
 * Routes configuration and layout wrapper.
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ReturnPage from './pages/ReturnPage';
import MarketplacePage from './pages/MarketplacePage';
import PeerToPeerPage from './pages/PeerToePeerPage';
import GreenCreditsPage from './pages/GreenCreditsPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/return" element={<ReturnPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/peer-to-peer" element={<PeerToPeerPage />} />
            <Route path="/green-credits" element={<GreenCreditsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
        {/* Footer */}
        <footer className="bg-amazon-navy text-gray-400 text-center py-6 mt-12">
          <p className="text-sm">
            © 2026 Amazon Second Life Commerce · AI-Powered Circular Economy Platform
          </p>
        </footer>
      </div>
    </Router>
  );
}
