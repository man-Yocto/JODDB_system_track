import React, { useState } from 'react';
import { User, Lock, Menu } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <User className="w-8 h-8 text-gray-700 border border-gray-300 rounded-full p-1" />
        <div className="text-2xl font-extrabold text-blue-600">
            aselsan<span className="text-gray-500 font-light text-base ml-1">Middle East</span>
        </div>
      </div>
      
      {/* Dropdown Menu */}
      <div className="relative">
        <Menu 
          className="w-6 h-6 text-gray-700 cursor-pointer hover:text-gray-900 transition duration-200" 
          onClick={() => setShowDropdown(!showDropdown)}
        />
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
            <div className="py-1">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
              >
                <Lock className="inline w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};