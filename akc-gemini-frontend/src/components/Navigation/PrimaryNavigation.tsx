import React from 'react';
import { NavLink } from 'react-router-dom';

const PrimaryNavigation = () => {
  const navigationItems = [
    { label: 'Dashboard', route: '/', icon: 'home' },
    { label: 'Customers', route: '/customers', icon: 'users' },
    { label: 'Estimates', route: '/estimates', icon: 'file-text' },
  ];

  return (
    <div className="w-64 bg-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-4">AKC Gemini</h2>
      <nav>
        {navigationItems.map((item) => (
          <NavLink
            key={item.route}
            to={item.route}
            className={({ isActive }) =>
              `block py-2 px-4 rounded hover:bg-gray-300 ${isActive ? 'bg-gray-300 font-semibold' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default PrimaryNavigation;