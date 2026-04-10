import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building,
  DollarSign,
  CheckCircle,
  BarChart,
  X,
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app' },
    { name: 'Leads', icon: Users, path: '/app/leads' },
    { name: 'Contacts', icon: UserCheck, path: '/app/contacts' },
    { name: 'Accounts', icon: Building, path: '/app/accounts' },
    { name: 'Deals', icon: DollarSign, path: '/app/deals' },
    { name: 'Tasks', icon: CheckCircle, path: '/app/tasks' },
    { name: 'Reports', icon: BarChart, path: '/app/reports' },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/*
        On large screens: always visible, static.
        On mobile: fixed drawer that slides in/out from the left.
      */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          h-screen w-64 bg-gray-900 text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo / Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-800">
          <span className="text-2xl font-bold text-blue-500">CRM Pro</span>
          {/* Close button — mobile only */}
          <button
            className="lg:hidden text-gray-400 hover:text-white transition"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              location.pathname === link.path ||
              (link.path !== '/app' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          CRM Pro &copy; {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
