import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
          onClick={onToggleSidebar}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-base md:text-xl font-semibold text-gray-800 flex items-center gap-1 overflow-hidden">
          <span className="hidden sm:inline">Welcome, </span>
          <span className="text-blue-600 truncate max-w-[120px] sm:max-w-none">{user?.name}</span>
        </h2>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4 shrink-0">
        <div className="hidden sm:flex items-center space-x-2 text-gray-600">
          <User size={18} />
          <span className="text-sm font-medium">{user?.role}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-red-500 hover:text-red-700 transition text-sm font-medium"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
