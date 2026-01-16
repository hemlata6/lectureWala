import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import {
  Home,
  Store,
  ShoppingBag,
  BookOpen,
  FileText,
  TrendingUp,
  Menu,
  X,
  LogOut,
  User,
  GalleryHorizontal,
  SeparatorHorizontal,
  Megaphone,
  Film,
  Newspaper,
  BetweenHorizonalEnd
} from 'lucide-react';
import Endpoints from '../../context/endpoints';
import StudentEditDetailsDialog from './StudentEditDetailsDialog';

const Sidebar = ({ currentPage, onPageChange, isMobile, isOpen, onToggle }) => {

  const { user, logout, instituteAppSettingsModals } = useAuth();
  const { clearStudentAuth } = useStudent();
  const [openDialog, setOpenDialog] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    // { id: 'store', label: 'Store', icon: Store },
    { id: 'purchases', label: 'My Purchases', icon: ShoppingBag },
    // { id: 'mcq-test', label: 'MCQ Test', icon: FileText },
    // { id: 'result', label: 'Result', icon: TrendingUp },
    { id: 'gallery', label: 'Gallery', icon: GalleryHorizontal },
    { id: 'content', label: 'Free Resources', icon: BookOpen },
    { id: 'shorts', label: 'Shorts', icon: Film },
    { id: 'announcement', label: 'Announcements', icon: Megaphone },
    { id: 'feed', label: 'Feed', icon: BetweenHorizonalEnd },
  ];

  const handleMenuClick = (pageId) => {
    onPageChange(pageId);
    if (isMobile) {
      onToggle(); // Close sidebar on mobile after selection
    }
  };

  const handleLogout = async () => {
    try {

      // Clear StudentContext first
      clearStudentAuth();

      // Then call AuthContext logout (which calls the API)
      await logout();


      // Force page reload to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      clearStudentAuth();
      localStorage.clear();
      window.location.reload();
    }
  };

  const sidebarClasses = `
    ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} 
    ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
    w-64 bg-white shadow-xl border-r border-gray-200 transition-transform duration-300 ease-in-out
    ${isMobile ? 'h-full overflow-y-auto' : 'h-screen'}
    flex flex-col
  `;

  const [student, setStudent] = useState([]);
  // console.log("Student data in sidebar:", student);
  useEffect(() => {
    setStudent(JSON.parse(localStorage.getItem('studentData')))
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      <div className={sidebarClasses}>
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200">
          <a href=''>
            <img
              alt=''
              src={Endpoints.mediaBaseUrl + instituteAppSettingsModals?.logo}
              className='w-32 h-32 rounded-md cursor-pointer'
            />
          </a>
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
              {
                student?.profile === null ?
                  <User className="h-5 w-5 text-white" />
                  :
                  <img
                    alt=''
                    src={Endpoints.mediaBaseUrl + student?.profile}
                    className='w-10 h-10 rounded-full cursor-pointer'
                  />
              }
            </div>
            <div className="cursor-pointer" onClick={() => setOpenDialog(true)}>
              <p className="text-sm font-medium text-gray-900">{student?.firstName + " " + student?.lastName}</p>
              <p className="text-xs text-gray-500">{student?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout and YouTube */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => window.open(`${instituteAppSettingsModals?.youtubeLink}`, '_blank')}
            className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-150"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-150"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
      <dialog open={openDialog} onClose={() => setOpenDialog(false)} className="">
        <StudentEditDetailsDialog studentId={student?.id} isOpen={openDialog} onClose={() => setOpenDialog(false)} onSave={(updatedData) => {
          // Handle the updated data
          console.log('Updated student data:', updatedData);
        }} />
      </dialog>
    </>
  );
};

export default Sidebar;