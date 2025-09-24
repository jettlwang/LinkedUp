import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';
const Layout: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const {
    userProfile
  } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Get sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);
  // Listen for custom sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setIsCollapsed(event.detail.isCollapsed);
    };
    window.addEventListener('sidebarStateChanged', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChanged', handleSidebarStateChange as EventListener);
    };
  }, []);
  return <div className="flex h-screen bg-white">
      <Sidebar userName={userProfile?.name || 'User'} />
      <div className={`
          flex-1 overflow-auto p-16 transition-all duration-300
          ${isCollapsed ? 'sm:ml-20' : 'sm:ml-72'}
        `}>
        {children}
      </div>
    </div>;
};
export default Layout;