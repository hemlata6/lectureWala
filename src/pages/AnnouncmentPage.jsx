import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  X,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Bell,
  RefreshCw
} from 'lucide-react';
import Network from '../context/Network';
import AnnouncementDialog from '../components/Dialogs/AnnounementDialog';
import EnquiryForm from '../components/auth/EnquiryForm';
import { useAuth } from '../context/AuthContext';
import instId from '../context/instituteId';

const AnnouncementPage = () => {
  const { authToken } = useAuth();
  const [announcementList, setAnnouncementList] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Network.getAnnouncementList(instId);

      if (response?.announcement) {
        // Filter active announcements
        let activeAnnouncements = response?.announcement;
        setAnnouncementList(activeAnnouncements);
      } else {
        setAnnouncementList([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    fetchAnnouncements();
  }, []);

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
                📢 Announcements
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Stay updated with the latest news, updates, and important information
            </p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center sm:justify-end mb-4 sm:mb-6">
            <button
              onClick={fetchAnnouncements}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto max-w-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Latest Announcements
                </h2>
                <span className="bg-white/20 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {announcementList.length} {announcementList.length === 1 ? 'announcement' : 'announcements'}
                </span>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col sm:flex-row justify-center items-center py-12 sm:py-16 px-4">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                <span className="mt-2 sm:mt-0 sm:ml-3 text-gray-600 text-sm sm:text-base text-center">Loading announcements...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 sm:p-6 text-center">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Error Loading Announcements</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">{error}</p>
                <button
                  onClick={fetchAnnouncements}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Announcements List */}
            {!loading && !error && (
              <div className="p-4 sm:p-6">
                {announcementList.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {announcementList.map((announcement, index) => (
                      <div
                        key={announcement.id || index}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100 cursor-pointer"
                        onClick={() => handleAnnouncementClick(announcement)}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-2 line-clamp-2">
                              {announcement.title || 'Important Announcement'}
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
                              {announcement.description || announcement.message || 'Stay updated with our latest news and updates.'}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-medium">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : 'Recent'}
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-1 hidden sm:flex">
                                <span>Click to view details</span>
                                <span className="text-blue-500">→</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Announcements Available</h3>
                    <p className="text-sm sm:text-base text-gray-500">Check back later for updates and important news.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Announcement Dialog */}
      {isDialogOpen && selectedAnnouncement && (
        <AnnouncementDialog
          announcement={selectedAnnouncement}
          onClose={closeDialog}
        />
      )}
    </>
  );
};

export default AnnouncementPage;