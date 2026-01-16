import React, { useState, useEffect } from 'react';
import BannerSlider from '../components/layout/BannerSlider';
// import CategoryCards from '../components/layout/CategoryCards';
import { useAuth } from '../context/AuthContext';
import Announcements from '../components/layout/CategoryCards';
import AppDownloadSection from '../components/layout/AppDownloadSection';
import FreeResources from '../components/layout/FreeResources';
import GallerySection from '../components/layout/GallerySection';
import EmployeeList from '../components/layout/EmployeeList';
import TestSeriesBanner from '../components/layout/TestSeriesBanner';
import CoursesByTag from '../components/layout/CoursesByTag';
import CourseLevels from '../components/layout/CourseLevels';
import ScholarshipSection from '../components/layout/ScholarshipSection';
import Store from './Store';
import EnquiryForm from '../components/auth/EnquiryForm';
import { X } from 'lucide-react';
import MobileEmployeeList from '../components/layout/MobileEmployeeList';
import AppShowcaseSection from '../components/layout/NewAppDownLoadSection';
import MobileFreeResources from '../components/layout/MobileFreeResourses';
import SupportSection from '../components/layout/SupportSection';

const Home = ({ onPageChange, onQuizNavigation, onAuthAction, onCourseExplore }) => {

  const { instituteAppSettingsModals, institute } = useAuth();
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  // Check if user has already seen the enquiry modal
  useEffect(() => {
    const hasSeenEnquiryModal = localStorage.getItem('hasSeenEnquiryModal');

    // Show modal only if user hasn't seen it before
    if (!hasSeenEnquiryModal) {
      // Small delay to allow page to render first
      const timer = setTimeout(() => {
        setShowEnquiryModal(true);
        // Mark as seen in localStorage
        localStorage.setItem('hasSeenEnquiryModal', 'true');
      }, 1500); // Show after 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseEnquiryModal = () => {
    setShowEnquiryModal(false);
  };

  const handleFacultyClick = (employee) => {
    // Navigate to store page with faculty filter
    onPageChange('store', { facultyFilter: employee });
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {/* Hero Section with Banner Slider */}
      <section className="px-2 sm:px-3 md:px-6 lg:px-8 py-3 sm:py-3 md:py-4 lg:py-5 w-full">
        <BannerSlider />
      </section>
      <section className="px-2 sm:px-3 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-2 md:gap-3">
            {/* Announcement Tab */}
            <button
              onClick={() => onPageChange('announcement')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-md sm:rounded-lg md:rounded-xl p-3 sm:p-3 md:p-4 py-5 sm:py-3 text-white shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-0.5 sm:mb-1 md:mb-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm md:text-md font-bold text-center leading-tight">Announcements</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-blue-100 text-center mt-0.5 leading-tight">Latest updates</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>

            {/* Store Tab */}
            <button
              onClick={() => onPageChange('store')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-md sm:rounded-lg md:rounded-xl p-3 sm:p-3 md:p-4 py-5 sm:py-3 text-white shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-0.5 sm:mb-1 md:mb-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm md:text-md font-bold text-center leading-tight">Lectures</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-purple-100 text-center mt-0.5 leading-tight">Browse courses</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>

            {/* Test Series Tab */}
            <button
              className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-md sm:rounded-lg md:rounded-xl p-3 sm:p-3 md:p-4 py-5 sm:py-3 text-white shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-not-allowed opacity-75"
              disabled
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-0.5 sm:mb-1 md:mb-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm md:text-md font-bold text-center leading-tight">Test Series</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-pink-100 text-center mt-0.5 leading-tight">Coming soon</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>

            {/* Free Resources Tab */}
            <button
              onClick={() => onPageChange('content')}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-md sm:rounded-lg md:rounded-xl p-3 sm:p-3 md:p-4 py-5 sm:py-3 text-white shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-0.5 sm:mb-1 md:mb-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm md:text-md font-bold text-center leading-tight">Free Resources</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-green-100 text-center mt-0.5 leading-tight">Learn for free</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      {/* <section className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to {institute?.institue}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            {
              instituteAppSettingsModals?.appBio === '' ?
                `Discover a world of knowledge with our comprehensive learning platform.
            Whether you're looking to advance your career, learn a new skill, or test your knowledge,
            we have everything you need to succeed.`
                :
                instituteAppSettingsModals?.appBio
            }

          </p>
        </div>
      </section> */}

      {/* Categories Section */}
      {/* <section className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <Announcements
            onCategoryClick={handleCategoryClick}
            onViewAll={() => onPageChange('announcement')}
          />
        </div>
      </section> */}
      {/* <section className="bg-white">
        <Store onQuizNavigation={onQuizNavigation} />
      </section> */}

      {/* Courses by Tag Section */}
      <section className="py-2 sm:py-4 md:py-2 w-full">
        <CoursesByTag
          onCourseClick={(course) => {
            if (course) {
              // Navigate to course explore page with the selected course
              if (onCourseExplore) {
                onCourseExplore(course, []);
              } else {
                console.error('onCourseExplore is not defined');
              }
            } else {
              // View all courses - go to store with fromCoursesTag flag
              onPageChange('store', { fromCoursesTag: true });
            }
          }}
        />
      </section>
      <section className="hidden md:block bg-white w-full">
        <EmployeeList
          onViewAll={() => onPageChange('faculties')}
          onFacultyClick={handleFacultyClick}
        />
      </section>

      <section className="block md:hidden bg-white w-full">
        <MobileEmployeeList
          onViewAll={() => onPageChange('faculties')}
          onFacultyClick={handleFacultyClick}
        />
      </section>
      {/* Test Series Banner Section */}
      <div data-section="test-series">
        <TestSeriesBanner />
      </div>

      {/* Free Resources Section */}
      <section className="hidden md:block px-2 sm:px-3 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 bg-white w-full">
        <FreeResources
          onAuthAction={onAuthAction}
          // showAll={false}
          onViewAll={() => onPageChange('content')}
          onQuizNavigation={onQuizNavigation}
        />
      </section>
      <section className="block md:hidden px-2 sm:px-3 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 bg-white w-full">
        <MobileFreeResources
          onAuthAction={onAuthAction}
          // showAll={false}
          onViewAll={() => onPageChange('content')}
          onQuizNavigation={onQuizNavigation}
        />
      </section>

      {/* Support Section */}
      <SupportSection />


      {/* Course Categories Section */}
      <CourseLevels onPageChange={onPageChange} />

      {/* Scholarship Section */}
      {/* <ScholarshipSection onPageChange={onPageChange} /> */}


      {/* <section className="px-4 sm:px-6 lg:px-8 py-5 bg-white">
        <GallerySection
          showAll={false}
          onViewAll={() => onPageChange('gallery')}
        />
      </section> */}


      {/* Features Section */}
      <section id="app-download-section" className=" bg-white w-full">
        {/* <AppDownloadSection /> */}
        <AppShowcaseSection />
      </section>

      {/* Enquiry Form Modal - Only show once */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="transform transition-all duration-500 ease-out scale-100 opacity-100 w-full max-w-md">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={handleCloseEnquiryModal}
                className="absolute -top-10 right-0 z-50 p-2 text-white hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Enquiry Form */}
              <EnquiryForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;