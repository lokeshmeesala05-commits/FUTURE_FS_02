import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-gray-800">Welcome, {user?.name}</h2>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-600">
           <User size={18} />
           <span className="text-sm font-medium">{user?.role}</span>
        </div>
        <button 
          onClick={logout}
          className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
