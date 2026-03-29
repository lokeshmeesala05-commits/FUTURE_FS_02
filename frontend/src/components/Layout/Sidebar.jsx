import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, Building, Settings, DollarSign, CheckCircle, BarChart } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Leads', icon: Users, path: '/leads' },
    { name: 'Contacts', icon: UserCheck, path: '/contacts' },
    { name: 'Accounts', icon: Building, path: '/accounts' },
    { name: 'Deals', icon: DollarSign, path: '/deals' },
    { name: 'Tasks', icon: CheckCircle, path: '/tasks' },
    { name: 'Reports', icon: BarChart, path: '/reports' },
    // { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-5 text-2xl font-bold border-b border-gray-800 text-blue-500">
        CRM Pro
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
