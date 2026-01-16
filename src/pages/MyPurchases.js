import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Star, Play, Download, BookOpen, Folder, FolderOpen, FileText, PlayCircle, X, ChevronDown } from 'lucide-react';
import Network from '../context/Network';
import Endpoints from '../context/endpoints';
import instId from '../context/instituteId';
import YouTubePlayer from '../components/layout/YouTubePlayer';
import { Box, Dialog, IconButton } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useStudent } from '../context/StudentContext';

const MyPurchases = ({ onQuizNavigation, onPageChange }) => {

  const { user, authToken } = useAuth();
  const { isAuthenticated } = useStudent();
  const purchases = user?.purchases || [];
  const [mycourseList, setMyCourseList] = useState([]);
  const [selectedSceduleList, setSelectedSceduleList] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState('courses'); // 'courses' or 'content'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [selectCourse, setSelectCourse] = useState('');
  const [activeCoursesList, setActiveCoursesList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAppDownloadDialog, setShowAppDownloadDialog] = useState(false);
  const [openDialog, setopenDialog] = useState(false);

  const handleCloseVideo = () => {
    setopenDialog(false)
  }

  const fetcMyCourse = async () => {
    try {
      let response = await Network.getMyCourses(authToken);
      if (response && (response.courses || response.data)) {
        setMyCourseList(response.courses || response.data || response);
        setActiveCoursesList(response.courses || response.data || response);
      };
    } catch (error) {
      console.log("Error fetching my courses:", error);
    };
  };

  // Recursive function to traverse folders and find content
  const traverseFoldersRecursively = async (courseId, folderId = 0, visitedFolders = new Set(), depth = 0) => {
    const folderKey = `${courseId}_${folderId}`;
    if (visitedFolders.has(folderKey)) {
      return [];
    }
    visitedFolders.add(folderKey);

    const indent = "  ".repeat(depth);

    try {
      const response = await Network.fetchScheduleApi(authToken, courseId, folderId);
      if (!response?.contentList) {
        return [];
      }

      let foundContent = [];

      for (const item of response.contentList) {
        const itemType = item?.entityType?.toLowerCase();

        if (itemType === "folder" && item?.id) {
          const folderContent = await traverseFoldersRecursively(courseId, item.id, visitedFolders, depth + 1);
          foundContent = [...foundContent, ...folderContent];
        } else {
          foundContent.push(item);
        }
      }

      return foundContent;
    } catch (error) {
      console.error(`${indent}Error fetching content for course ${courseId}, folder ${folderId}:`, error);
      return [];
    }
  };

  const getMergedSchedules = async (courseId, folderId = 0) => {
    try {

      let response = await Network.fetchScheduleApi(authToken, courseId, folderId);

      if (response?.contentList) {
        setSelectedSceduleList(response.contentList);
      } else {
        setSelectedSceduleList([]);
      }
    } catch (error) {
      setSelectedSceduleList([]);
    }
  };

  const handleCardClick = (item) => {

    if (currentView === 'courses') {
      setSelectedCourse(item);
      setCourseId(item?.id);
      setCurrentView('content');
      getMergedSchedules(item?.id, 0);
      return;
    }

    if (item?.entityType?.toLowerCase() === "folder") {
      setParentId(item?.id);
      getMergedSchedules(courseId, item?.id);
      return;
    }

    if (item?.entityType === "quiz") {
      onQuizNavigation && onQuizNavigation('mcq-test', item);
      return;
    }
    if (item?.entityType === "note") {
      if (item?.note?.note) {
        window.open(Endpoints.mediaBaseUrl + item?.note?.note, "_blank");
      }
      return;
    }
    if (item?.entityType === "video" && authToken) {
      if (item?.video?.youtubeUrl) {
        setSelectedItem(item);
        setopenDialog(true)
      }
      return;
    }

    // Check if content type is supported on web platform
    const contentType = item?.entityType?.toLowerCase();
    const webSupportedTypes = ['video', 'audio', 'quiz', 'folder'];

    if (webSupportedTypes.includes(contentType)) {
      // Content supported on web - open form modal
      setSelectedItem(item);
      setFormModalOpen(true);
    } else {
      // Content not supported on web - show app download dialog
      setShowAppDownloadDialog(true);
    }
  };

  const handleClose = () => {
    setFormModalOpen(false);
    setSelectedItem({});
    setName('');
    setNumber('');
    setSelectCourse('');
  };

  const handleChangeCourse = (course) => {
    setSelectCourse(course);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const body = {
        instId: instId,
        firstName: name,
        lastName: name,
        contact: number,
        campaignId: null,
        contentId: selectCourse?.id,
        enquiryType: "course"
      }
      let response = await Network.createLeadFormAPI(body, instId);
      if (response?.errorCode !== 0) {
      } else if (response?.errorCode === 0) {
        handleClose();

        setTimeout(() => {
          if (selectedItem?.entityType === "video" && selectedItem?.video?.video) {
            window.open(Endpoints.mediaBaseUrl + selectedItem?.video?.video, "_blank");
          } else if (selectedItem?.entityType === "note" && selectedItem?.note?.note) {
            window.open(Endpoints.mediaBaseUrl + selectedItem?.note?.note, "_blank");
          } else if (selectedItem?.entityType === "blog" && selectedItem?.blog?.blog) {
            window.open(Endpoints.mediaBaseUrl + selectedItem?.blog?.blog, "_blank");
          } else if (selectedItem?.entityType === "pdf" && selectedItem?.pdf?.pdf) {
            window.open(Endpoints.mediaBaseUrl + selectedItem?.pdf?.pdf, "_blank");
          } else if (selectedItem?.entityType === "document" && selectedItem?.document?.document) {
            window.open(Endpoints.mediaBaseUrl + selectedItem?.document?.document, "_blank");
          }
        }, 300);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const goBackToCourses = () => {
    setCurrentView('courses');
    setSelectedCourse(null);
    setCourseId(null);
    setParentId(null);
    setSelectedSceduleList([]);
  };

  useEffect(() => {
    fetcMyCourse();
    setIsVisible(true);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    // Mock progress - in a real app, this would come from user progress data
    return Math.floor(Math.random() * 100);
  };

  if (mycourseList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Courses Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't purchased any courses yet. Browse our store to find courses that match your interests and start your learning journey!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-2">
            {currentView === 'courses' ? '📚 My Courses' : `📖 ${selectedCourse?.title || 'Course Content'}`}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            {currentView === 'courses'
              ? 'Access your purchased courses and track your learning progress'
              : 'Navigate through your course content and continue learning'
            }
          </p>
        </div>

        {/* Navigation Breadcrumb */}
        {currentView === 'content' && (
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={goBackToCourses}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors duration-300 flex items-center justify-center"
            >
              ← Back to My Courses
            </button>
            {parentId && (
              <button
                onClick={() => {
                  setParentId(null);
                  getMergedSchedules(courseId, 0);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors duration-300 flex items-center justify-center"
              >
                ← Back to Course Root
              </button>
            )}
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Show courses or course content based on currentView */}
          {currentView === 'courses' ? (
            // Show courses
            mycourseList.map((course, i) => (
              <div
                key={course.id || i}
                className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${100 + (i * 100)}ms` }}
              >
                <div
                  onClick={() => handleCardClick(course)}
                  className="group bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden h-full cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-black/10 flex flex-col relative"
                >
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 transform group-hover:scale-110 transition-transform duration-300 ${course.active
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}>
                    {course.active ? 'ACTIVE' : 'INACTIVE'}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {course.logo ? (
                      <img
                        src={`${Endpoints.mediaBaseUrl}${course.logo}`}
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
                        <BookOpen className="w-16 h-16 text-blue-500 opacity-70" />
                      </div>
                    )}

                    {/* Course Type Icon */}
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-xl p-2">
                      <BookOpen className="w-5 h-5 text-white transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-5 lg:p-6 flex-grow flex flex-col justify-between">
                    {/* Title */}
                    <h3 className="text-gray-800 font-bold text-sm sm:text-base lg:text-lg mb-2 line-clamp-2 leading-tight">
                      {course.title || 'Course Title'}
                    </h3>

                    {/* Short Description */}
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {course.shortDescription || 'Course description not available'}
                    </p>

                    {/* Continue Learning Button */}
                    <div className="mt-auto">
                      <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Continue Learning</span>
                        <span className="xs:hidden">Continue</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Show course content (same as FreeResourcesPage)
            selectedSceduleList.map((item, i) => (
              <div
                key={i}
                className={`transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${100 + (i * 100)}ms` }}
              >
                <div
                  onClick={() => handleCardClick(item)}
                  className="group bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden h-full cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-black/10 flex flex-col relative"
                >
                  {/* Content Type Badge */}
                  <div className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 transform group-hover:scale-110 transition-transform duration-300 ${item?.entityType?.toLowerCase() === "folder"
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    : item?.entityType === "quiz"
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                    {item?.entityType?.toUpperCase() || 'CONTENT'}
                  </div>

                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {item?.thumb ? (
                      <img
                        src={Endpoints.mediaBaseUrl + item?.thumb}
                        alt={item?.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-yellow-50">
                        {item?.entityType?.toLowerCase() === "folder" ?
                          <div className="flex flex-col items-center">
                            <FolderOpen className="w-16 h-16 text-yellow-500 opacity-70" />
                            <span className="text-yellow-600 font-semibold text-sm mt-1">FOLDER</span>
                          </div> :
                          item?.entityType === "video" || item?.entityType === "blog" ?
                            <PlayCircle className="w-16 h-16 text-blue-500 opacity-70" /> :
                            item?.entityType === "quiz" ?
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
                                  <span className="text-white font-bold text-2xl">?</span>
                                </div>
                                <span className="text-purple-600 font-semibold text-sm">QUIZ</span>
                              </div> :
                              <FileText className="w-16 h-16 text-red-500 opacity-70" />
                        }
                      </div>
                    )}

                    {/* Content Type Icon */}
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-xl p-2">
                      {item?.entityType?.toLowerCase() === "folder" ?
                        <Folder className="w-5 h-5 text-yellow-300 transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" /> :
                        item?.entityType === "video" || item?.entityType === "blog" ?
                          <PlayCircle className="w-5 h-5 text-white transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" /> :
                          item?.entityType === "quiz" ?
                            <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300">
                              ?
                            </div> :
                            <FileText className="w-5 h-5 text-white transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-300" />
                      }
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-5 lg:p-6 flex-grow flex flex-col justify-between">
                    {/* Title */}
                    <h3 className="text-gray-800 font-bold text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2 leading-tight">
                      {item?.title || 'Content Title'}
                    </h3>

                    {/* Footer */}
                    <div className="mt-auto">
                      {/* Date */}
                      <div className="flex items-center mb-3 sm:mb-4">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-2" />
                        <span className="text-gray-500 text-xs">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : "Recently Added"}
                        </span>
                      </div>

                      {/* Action Button */}
                      <button className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 ${item?.entityType?.toLowerCase() === "folder"
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 hover:shadow-yellow-500/30"
                        : item?.entityType === "quiz"
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/30"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30"
                        } text-white`}>
                        {item?.entityType?.toLowerCase() === "folder" ? (
                          <>
                            <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Open Folder</span>
                            <span className="xs:hidden">Open</span>
                          </>
                        ) : item?.entityType === "quiz" ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">?</div>
                            <span className="hidden xs:inline">Start Quiz</span>
                            <span className="xs:hidden">Quiz</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Access Now</span>
                            <span className="xs:hidden">Access</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* No Content Found */}
        {((currentView === 'courses' && mycourseList.length === 0) ||
          (currentView === 'content' && selectedSceduleList.length === 0)) && (
            <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                {currentView === 'courses' ? 'No Courses Available' : 'No Content Available'}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                {currentView === 'courses'
                  ? 'Purchase courses to start your learning journey.'
                  : 'This course folder is empty or content is being loaded.'
                }
              </p>
            </div>
          )}

        {/* App Download Dialog */}
        {formModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setFormModalOpen(false)}
          >
            <div className="bg-gradient-to-br from-white/98 to-gray-50/98 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 text-gray-800 relative overflow-hidden border-b border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent"></div>

                <button
                  onClick={() => setFormModalOpen(false)}
                  className="absolute right-4 top-4 bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200/80 text-gray-600 hover:text-gray-800 p-3 rounded-full transition-all duration-300 hover:scale-110 z-50 cursor-pointer"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    📱 Download Our App
                  </h2>
                  <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                    For accessing this content, please install our mobile application
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* App Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-white text-sm">Access all video content</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-white text-sm">Read PDFs and documents</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-white text-sm">Enhanced learning experience</span>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="space-y-3">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.classio.quiz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-4 rounded-xl font-semibold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    Download from Play Store
                  </a>

                  <button
                    onClick={() => setShowAppDownloadDialog(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Note */}
                <p className="text-center text-white text-xs">
                  📱 Get the best learning experience with our mobile app
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Dialog
        open={openDialog}
        onClose={handleCloseVideo}
        maxWidth={false}
        fullScreen={true}
        sx={{
          '& .MuiDialog-container': {
            '& .MuiPaper-root': {
              width: '100vw',
              height: '100vh',
              maxWidth: '100vw',
              maxHeight: '100vh',
              margin: 0,
              borderRadius: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              border: 'none',
              overflow: 'hidden',
            },
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0, // Remove all padding
            m: 0, // Remove all margin
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleCloseVideo}
            sx={{
              position: 'fixed',
              top: { xs: 10, md: 20 },
              right: { xs: 10, md: 20 },
              zIndex: 1300,
              background: 'rgba(255, 215, 0, 0.9)',
              color: '#000',
              border: '2px solid #FFD700',
              width: { xs: 40, md: 50 },
              height: { xs: 40, md: 50 },
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
              '&:hover': {
                background: 'rgba(255, 215, 0, 1)',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 25px rgba(255, 215, 0, 0.5)',
              }
            }}
          >
            <CancelRoundedIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
          </IconButton>

          <Box
            sx={{
              width: '100%',
              height: 'auto',
              maxWidth: { xs: 'none', md: '1200px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pt: { xs: 6, md: 8 },
              px: { xs: 3, md: 2 }, // Equal padding on mobile
              boxSizing: 'border-box',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: '100%' },
                aspectRatio: '16/9',
                '& iframe': {
                  width: '100% !important',
                  height: '100% !important',
                  borderRadius: { xs: '10px', md: '15px' }, // Small border radius on mobile
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                }
              }}
            >
              <YouTubePlayer videoUrl={selectedItem?.video?.youtubeUrl} />
            </Box>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
};

export default MyPurchases;