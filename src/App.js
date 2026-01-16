import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProvider, useStudent } from './context/StudentContext';
import instId from './context/instituteId';
import WhatsAppFloat from './components/WhatsAppFloat';
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';
import UnifiedLayout from './components/layout/UnifiedLayout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import PublicLogin from './components/auth/PublicLogin';
import PublicSignup from './components/auth/PublicSignup';
import Home from './pages/Home';
import Store from './pages/Store';
import MyPurchases from './pages/MyPurchases';
import Content from './pages/Content';
import MCQTest from './pages/MCQTest';
import Result from './pages/Result';
import FreeResourcesPage from './pages/FreeResourcesPage';
import GalleryPage from './pages/GalleryPage';
import ShortsPage from './pages/ShortsPage';
import FeedsPage from './pages/FeedsPage';
import AnnouncementPage from './pages/AnnouncmentPage';
import PublicHome from './pages/PublicHome';
import PublicGalleryPage from './pages/PublicGalleryPage';
import PublicShortsPage from './pages/PublicShortsPage';
import PublicAnnouncementPage from './pages/PublicAnnouncementPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import BlogPage from './pages/BlogPage';
import CourseExplore from './pages/CourseExplore';
import EmployeePage from './pages/EmployeePage';
import VideoLecturePage from './pages/VideoLecturePage';
import BooksPage from './pages/BooksPage';
import { QuizProvider } from './context/QuizContext';
import MultipleCourseCart from './pages/AddedCourseCart';
import DripCourses from './pages/DripCourses';
import CartPage from './pages/CartPage';

const AppWrapper = () => {
  const { loading: authLoading } = useAuth();
  const { isAuthenticated, loading: studentLoading } = useStudent();

  const loading = authLoading || studentLoading;

  // Set the page title based on instId
  useEffect(() => {
    window.appInstId = instId;
    if (window.updateDocumentTitle) {
      window.updateDocumentTitle(instId);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading...</p>
      </div>
    );
  }

  return <UnifiedDashboard isAuthenticated={isAuthenticated} />;
};

const UnifiedDashboard = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testResults, setTestResults] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [purchaseDripCourse, setPurchaseDripCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    const checkAuthToken = () => {
      const authToken = localStorage.getItem('authToken');
      const studentData = localStorage.getItem('studentData');

      const protectedRoutes = ['/result', '/mcq-test', '/purchases', '/feed', '/my-purchase', '/test-series'];
      const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

      if (isProtectedRoute && (!authToken || !studentData)) {
        navigate('/login', { replace: true });
      }
    };

    checkAuthToken();
  }, [location.pathname, navigate]);

  useEffect(() => {
    const pathsWithCollapsedSidebar = ['/course-explore', '/store'];
    const shouldCollapse = pathsWithCollapsedSidebar.some(path => location.pathname.startsWith(path));

    setSidebarCollapsed(shouldCollapse);
  }, [location.pathname]);

  useEffect(() => {
    const handleTokenExpired = () => {
      setTestResults(null);
      setQuizData(null);
      setUserAnswers(null);

      navigate('/login', { replace: true });
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, [navigate]);

  const handleSidebarToggle = (shouldCollapse) => {
    setSidebarCollapsed(shouldCollapse);
  };

  const handlePageChange = (pageId, data = null) => {
    if (pageId === 'blog' && data) {
      setBlogData(data);
    }
    navigate(`/${pageId}`, { state: data });
  };

  const handleAuthAction = (mode) => {
    navigate(`/${mode}`);
  };

  const handleQuizNavigation = (pageId, data = null, routeData = null) => {
    if (pageId === 'mcq-test' && data) {
      setQuizData(data);
    }
    if (pageId === 'test-series' && data) {
      setPurchaseDripCourse(data);
    }
    if (pageId === 'result' && data) {
      setQuizData(data);
    }

    // Pass routeData as state instead of query parameter for better SPA compatibility
    const navigationState = routeData ? { isMobile: routeData } : null;
    navigate(`/${pageId}`, { state: navigationState });
  };

  const handleCourseExplore = (course, courses = []) => {
    setSelectedCourse(course);
    setAllCourses(courses);
    navigate('/course-explore');
  };

  const handleTestComplete = (results, quiz, answers) => {
    setTestResults(results);
    setQuizData(quiz);
    setUserAnswers(answers);
    navigate('/result');
  };

  const handleRetakeTest = () => {
    setTestResults(null);
    navigate('/mcq-test');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const currentPage = location.pathname.substring(1) || 'home';

  return (
    <UnifiedLayout
      currentPage={currentPage}
      onPageChange={handlePageChange}
      onAuthAction={handleAuthAction}
      isAuthenticated={isAuthenticated}
      onSidebarToggle={handleSidebarToggle}
      sidebarCollapsed={sidebarCollapsed}
    >
      <Routes>
        <Route path="/" element={<Home onPageChange={handlePageChange} onQuizNavigation={handleQuizNavigation} onAuthAction={handleAuthAction} onCourseExplore={handleCourseExplore} />} />
        <Route path="/home" element={<Home onPageChange={handlePageChange} onQuizNavigation={handleQuizNavigation} onAuthAction={handleAuthAction} onCourseExplore={handleCourseExplore} />} />
        <Route path="/gallery" element={<PublicGalleryPage onAuthAction={handleAuthAction} />} />
        <Route path="/shorts" element={<ShortsPage onPageChange={handlePageChange} />} />
        <Route path="/announcement" element={<AnnouncementPage onPageChange={handlePageChange} />} />
        <Route path="/video_lecture" element={<VideoLecturePage onPageChange={handlePageChange} />} />
        <Route path="/books" element={<BooksPage onPageChange={handlePageChange} />} />
        <Route path="/faculties" element={<EmployeePage onPageChange={handlePageChange} />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsConditionsPage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        <Route path="/blog" element={<BlogPage blogData={blogData} onPageChange={handlePageChange} />} />

        <Route path="/login" element={
          !isAuthenticated ? (
            <div className="p-6">
              <PublicLogin
                onSwitchToSignup={() => navigate('/signup')}
                onClose={() => {
                  // Check if there's a flag to skip redirect
                  const skipRedirect = sessionStorage.getItem('skipHomeRedirect');
                  const justLoggedIn = sessionStorage.getItem('justLoggedIn');
                  
                  // Clean up flags
                  sessionStorage.removeItem('skipHomeRedirect');
                  sessionStorage.removeItem('justLoggedIn');
                  
                  // Only navigate to home if not skipping and not just logged in
                  if (!skipRedirect && !justLoggedIn) {
                    navigate('/');
                  }
                }}
              />
            </div>
          ) : <Navigate to="/" replace />
        } />
        <Route path="/signup" element={
          !isAuthenticated ? (
            <div className="p-6">
              <PublicSignup
                onSwitchToLogin={() => navigate('/login')}
                onClose={() => navigate('/')}
              />
            </div>
          ) : <Navigate to="/" replace />
        } />

        <Route path="/store" element={<Store onPageChange={handlePageChange} onQuizNavigation={handleQuizNavigation} onCourseExplore={handleCourseExplore} onSidebarToggle={handleSidebarToggle} />} />
        <Route path="/course-explore" element={<CourseExplore course={selectedCourse} allCourses={allCourses} onBack={() => navigate('/store')} onSidebarToggle={handleSidebarToggle} />} />
        <Route path="/cart" element={<CartPage onQuizNavigation={handleQuizNavigation} />} />
        <Route path="/purchases" element={
          isAuthenticated ? <MyPurchases onPageChange={handlePageChange} /> : <Navigate to="/login" replace />
        } />
        <Route path="/content" element={<FreeResourcesPage onPageChange={handlePageChange} onQuizNavigation={handleQuizNavigation} onAuthAction={handleAuthAction} />} />
        <Route path="/feed" element={
          isAuthenticated ? <FeedsPage onPageChange={handlePageChange} /> : <Navigate to="/login" replace />
        } />
        <Route path="/mcq-test" element={
          isAuthenticated ? <MCQTest onTestComplete={handleTestComplete} quizData={quizData} onSidebarToggle={handleSidebarToggle} /> : <Navigate to="/login" replace />
        } />
        <Route path="/my-purchase" element={<MultipleCourseCart onTestComplete={handleTestComplete} onQuizNavigation={handleQuizNavigation} quizData={quizData} />} />
        <Route path="/test-series" element={<DripCourses onTestComplete={handleTestComplete} onQuizNavigation={handleQuizNavigation} purchaseDripCourse={purchaseDripCourse} />} />
        <Route path="/result" element={
          isAuthenticated ? (
            <Result
              results={testResults}
              onRetakeTest={handleRetakeTest}
              onGoHome={handleGoHome}
              quizData={quizData}
              userAnswers={userAnswers}
            />
          ) : <Navigate to="/login" replace />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UnifiedLayout>
  );
};

function App() {
  const [shouldHideLayoutControls, setShouldHideLayoutControls] = useState(false);

  useEffect(() => {
    const checkHideLayoutControls = () => {
      const hideFlag = sessionStorage.getItem('hideLayoutControls');
      setShouldHideLayoutControls(hideFlag === 'true');
    };

    checkHideLayoutControls();

    // Listen for storage changes
    window.addEventListener('storage', checkHideLayoutControls);

    // Check periodically since sessionStorage changes in same tab don't trigger storage event
    const interval = setInterval(checkHideLayoutControls, 500);

    return () => {
      window.removeEventListener('storage', checkHideLayoutControls);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <StudentProvider>
        <AuthProvider>
          <QuizProvider>
            <div className="App">
              <AppWrapper />
              {!shouldHideLayoutControls && <WhatsAppFloat />}
            </div>
          </QuizProvider>
        </AuthProvider>
      </StudentProvider>
    </Router>
  );
}

export default App;
