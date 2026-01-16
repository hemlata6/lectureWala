import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children, currentPage, onPageChange }) => {

  const { institute } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        isMobile={isMobile}
        isOpen={isMobileMenuOpen}
        onToggle={toggleMobileMenu}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        {isMobile && (
          <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className=" w-full flex items-center justify-center mr-12">
                <h1 className="text-lg font-semibold text-gray-900">{institute?.institue}</h1>
                <div></div> {/* Spacer for centering */}
              </div>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;