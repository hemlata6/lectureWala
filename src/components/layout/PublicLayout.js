import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, X, LogIn, UserPlus, Phone, MessageCircle, 
  Home, Image, Video, Bell, Shield, FileText, 
  CreditCard, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Endpoints from '../../context/endpoints';

const PublicLayout = ({ children, currentPage, onPageChange, onAuthAction }) => {
  const { institute, instituteAppSettingsModals } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const publicMenuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'shorts', label: 'Shorts', icon: Video },
    { id: 'announcement', label: 'Announcements', icon: Bell },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'refund', label: 'Refund Policy', icon: CreditCard },
    { id: 'login', label: 'Login', icon: LogIn },
    { id: 'signup', label: 'Sign Up', icon: UserPlus },
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCallNow = () => {
    if (instituteAppSettingsModals?.phoneNumber) {
      window.open(`tel:${instituteAppSettingsModals.phoneNumber}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (instituteAppSettingsModals?.whatsappNumber) {
      window.open(`https://wa.me/${instituteAppSettingsModals.whatsappNumber}`, '_blank');
    }
  };

  const handleSocialMedia = (platform) => {
    const socialLinks = {
      facebook: instituteAppSettingsModals?.facebookLink,
      instagram: instituteAppSettingsModals?.instagramLink,
      twitter: instituteAppSettingsModals?.twitterLink,
      youtube: instituteAppSettingsModals?.youtubeLink,
      linkedin: instituteAppSettingsModals?.linkedinLink,
    };

    if (socialLinks[platform]) {
      window.open(socialLinks[platform], '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } bg-white shadow-lg transition-all duration-300 ease-in-out fixed left-0 top-0 h-full z-40 ${
          isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center">
                {instituteAppSettingsModals?.logo ? (
                  <img
                    src={Endpoints.mediaBaseUrl + instituteAppSettingsModals.logo}
                    alt={institute?.institue || 'Logo'}
                    className="h-8 w-auto"
                  />
                ) : (
                  <div className="text-lg font-bold text-blue-600">
                    {institute?.institue || 'Quiz Panel'}
                  </div>
                )}
              </div>
            )}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4">
          {/* Main Menu Items */}
          <ul className="space-y-2">
            {publicMenuItems.slice(0, -2).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id);
                      if (isMobile) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Authentication Section */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            {!isSidebarCollapsed && (
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Account
              </p>
            )}
            <ul className="space-y-2">
              {publicMenuItems.slice(-2).map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onAuthAction(item.id);
                        if (isMobile) setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                        currentPage === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                      title={isSidebarCollapsed ? item.label : ''}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isSidebarCollapsed && (
                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}

              {/* Page Title */}
              <div className="flex items-center flex-1">
                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                  {publicMenuItems.find(item => item.id === currentPage)?.label || 'Home'}
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        {/* WhatsApp Button */}
        {instituteAppSettingsModals?.whatsappNumber && (
          <button
            onClick={handleWhatsApp}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors duration-200"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}

        {/* Call Now Button */}
        {instituteAppSettingsModals?.phoneNumber && (
          <button
            onClick={handleCallNow}
            className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors duration-200"
            title="Call Now"
          >
            <Phone className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Social Media Links */}
      <div className="fixed bottom-6 left-6 flex space-x-2 z-40">
        {instituteAppSettingsModals?.facebookLink && (
          <button
            onClick={() => handleSocialMedia('facebook')}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors duration-200"
            title="Facebook"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        )}

        {instituteAppSettingsModals?.instagramLink && (
          <button
            onClick={() => handleSocialMedia('instagram')}
            className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-pink-700 transition-colors duration-200"
            title="Instagram"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.33-1.297C4.198 14.553 3.708 13.402 3.708 12.105s.49-2.448 1.411-3.33c.882-.882 2.033-1.297 3.33-1.297s2.448.415 3.33 1.297c.882.882 1.297 2.033 1.297 3.33s-.415 2.448-1.297 3.33c-.882.807-2.033 1.297-3.33 1.297zm7.718-6.695c-.49 0-.882-.392-.882-.882s.392-.882.882-.882.882.392.882.882-.392.882-.882.882zm-4.167 2.695c0-.882-.49-1.797-1.297-2.604-.807-.807-1.722-1.297-2.604-1.297s-1.797.49-2.604 1.297c-.807.807-1.297 1.722-1.297 2.604s.49 1.797 1.297 2.604c.807.807 1.722 1.297 2.604 1.297s1.797-.49 2.604-1.297c.807-.807 1.297-1.722 1.297-2.604z"/>
            </svg>
          </button>
        )}

        {instituteAppSettingsModals?.youtubeLink && (
          <button
            onClick={() => handleSocialMedia('youtube')}
            className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors duration-200"
            title="YouTube"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default PublicLayout;