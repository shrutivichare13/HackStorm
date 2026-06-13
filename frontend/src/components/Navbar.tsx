/**
 * Navigation Bar Component
 * Amazon-inspired navigation with responsive design.
 */

import { Link, useLocation } from 'react-router-dom';
import { Recycle, Home, RotateCcw, Store, Users, Leaf, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/return', label: 'Return Item', icon: RotateCcw },
  { path: '/marketplace', label: 'Marketplace', icon: Store },
  { path: '/peer-to-peer', label: 'Peer-to-Peer', icon: Users },
  { path: '/green-credits', label: 'Green Credits', icon: Leaf },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-amazon-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Recycle className="h-8 w-8 text-amazon-orange" />
            <span className="text-white font-bold text-lg hidden sm:block">
              Second Life
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-amazon-orange text-white'
                    : 'text-gray-300 hover:text-white hover:bg-amazon-navy-light'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-amazon-orange text-white'
                    : 'text-gray-300 hover:text-white hover:bg-amazon-navy-light'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
