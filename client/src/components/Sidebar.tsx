import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, UsersIcon, CalendarIcon, UserIcon, PlusIcon, MessageSquareIcon, ChevronLeftIcon, ChevronRightIcon, MenuIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
interface SidebarProps {
  userName: string;
}
const Sidebar: React.FC<SidebarProps> = ({
  userName
}) => {
  const location = useLocation();
  const {
    openChat
  } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Check if screen is mobile on initial render and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    // Check on initial render
    checkScreenSize();
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  // Save collapsed state to localStorage when it changes and dispatch custom event
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    // Dispatch custom event to notify Layout component
    window.dispatchEvent(new CustomEvent('sidebarStateChanged', {
      detail: {
        isCollapsed
      }
    }));
  }, [isCollapsed]);
  // Toggle collapsed state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const navItems = [{
    path: '/',
    label: 'Dashboard',
    icon: <HomeIcon size={22} />
  }, {
    path: '/contacts',
    label: 'Connections',
    icon: <UsersIcon size={22} />
  }, {
    path: '/events',
    label: 'Interactions',
    icon: <CalendarIcon size={22} />
  }, {
    path: '/profile',
    label: 'Me',
    icon: <UserIcon size={22} />
  }];
  return <>
      {/* Mobile menu button - only visible on small screens */}
      <button onClick={toggleMobileMenu} className="fixed top-4 left-4 z-30 sm:hidden bg-white p-2 rounded-full shadow-md">
        <MenuIcon size={24} className="text-gray-700" />
      </button>
      {/* Sidebar - visible based on state */}
      <div className={`
          fixed inset-y-0 left-0 z-20 flex flex-col
          bg-gradient-to-br from-primary-50 to-secondary-50 bg-gray-50 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `}>
        {/* Sidebar toggle button */}
        <button onClick={toggleSidebar} className="absolute -right-3 top-20 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm hidden sm:block">
          {isCollapsed ? <ChevronRightIcon size={16} className="text-gray-600" /> : <ChevronLeftIcon size={16} className="text-gray-600" />}
        </button>
        {/* Mobile close button */}
        <button onClick={toggleMobileMenu} className="absolute top-4 right-4 sm:hidden text-gray-500 hover:text-gray-700">
          <ChevronLeftIcon size={24} />
        </button>
        <div className={`p-6 space-y-3 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {isCollapsed ? <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
              L
            </div> : <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                LinkedUp
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Stay connected, grow together.
              </p>
            </>}
        </div>
        <div className="flex-1 overflow-auto py-6">
          <nav className={`px-4 space-y-3 ${isCollapsed ? 'items-center' : ''}`}>
            {navItems.map(item => <Link key={item.path} to={item.path} className={`
                  flex items-center px-5 py-4 text-sm rounded-2xl transition-soft
                  ${isCollapsed ? 'flex flex-col items-center' : ''}
                  ${isActive(item.path) ? 'rounded-full bg-gray-700/5 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}
                `} title={isCollapsed ? item.label : ''}>
                <span className={`${isCollapsed ? '' : 'mr-4'} opacity-80`}>
                  {item.icon}
                </span>
                {!isCollapsed && item.label}
              </Link>)}
          </nav>
        </div>
        <div className={`p-6 space-y-3 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <button onClick={() => openChat()} className={`
              flex items-center justify-center text-sm font-medium text-white rounded-2xl btn-gradient-primary transition-soft
              ${isCollapsed ? 'w-12 h-12 rounded-full' : 'w-full px-5 py-3'}
            `} title={isCollapsed ? 'Ask LinkedAI' : ''}>
            <MessageSquareIcon size={18} className={isCollapsed ? '' : 'mr-2'} />
            {!isCollapsed && 'Ask LinkedAI'}
          </button>
          {!isCollapsed && <>
              <Link to="/add-contact" className="flex items-center justify-center w-full px-5 py-3 text-sm font-medium text-primary-600 bg-white border border-primary-200 rounded-2xl hover:bg-primary-50 transition-soft">
                <PlusIcon size={18} className="mr-2" />
                Add Contact
              </Link>
              <Link to="/add-event" className="flex items-center justify-center w-full px-5 py-3 text-sm font-medium text-primary-600 bg-white border border-primary-200 rounded-2xl hover:bg-primary-50 transition-soft">
                <PlusIcon size={18} className="mr-2" />
                Log Interaction
              </Link>
            </>}
        </div>
        <div className={`p-6 flex items-center border-t border-gray-200 ${isCollapsed ? 'flex flex-col items-center justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">{userName}</p>
            </div>}
        </div>
      </div>
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-10 sm:hidden" onClick={toggleMobileMenu} />}
    </>;
};
export default Sidebar;