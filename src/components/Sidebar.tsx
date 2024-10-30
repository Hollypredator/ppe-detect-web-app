import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, Camera, AlertTriangle, LayoutDashboard } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">PPE İzleme Sistemi</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <nav className="space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${
                  isActive ? 'bg-gray-800' : ''
                }`
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/facilities"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${
                  isActive ? 'bg-gray-800' : ''
                }`
              }
            >
              <Building2 size={20} />
              <span>Tesisler</span>
            </NavLink>

            <NavLink
              to="/cameras"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${
                  isActive ? 'bg-gray-800' : ''
                }`
              }
            >
              <Camera size={20} />
              <span>Kameralar</span>
            </NavLink>

            <NavLink
              to="/violations"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${
                  isActive ? 'bg-gray-800' : ''
                }`
              }
            >
              <AlertTriangle size={20} />
              <span>İhlaller</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </div>
  );
};