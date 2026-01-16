import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Code,
  Calculator,
  Globe,
  Palette,
  Music,
  Camera,
  TrendingUp,
  X,
  Calendar,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import Network from '../../context/Network';
import { useAuth } from '../../context/AuthContext';
import EnquiryForm from '../auth/EnquiryForm';
import AnnouncementDialog from '../Dialogs/AnnounementDialog';
import instId from '../../context/instituteId';

const CategoryCards = ({ onViewAll }) => {

  const { authToken } = useAuth();
  const [announcementList, setAnnouncementList] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  console.log('announcementList', announcementList);
  

  // const fetchAnnouncements = async () => {
  //   try {
  //     let body = {
  //       page: 0,
  //       pageSize: 20
  //     }
  //     const response = await Network.getAnnouncementList(authToken, body);
  //     let activeAnnouncement = response?.announcement?.length > 0 ? response?.announcement?.filter(announcement => announcement?.status === true) : [];
  //     setAnnouncementList(activeAnnouncement?.length > 0 ? activeAnnouncement : []);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const fetchAnnouncements = async () => {
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
    }
  };

  useEffect(() => {
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

  const handleViewAll = () => {
    setShowAll(true);
  };

  // const displayedAnnouncements = showAll ? announcementList : announcementList.slice(0, 3);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Announcements Section - Left 6 columns */}
        <div className="lg:col-span-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
            <div className="flex items-center mb-6">
              <BookOpen className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Latest Announcements
              </h2>
            </div>

            <div className="space-y-4">
              {announcementList?.length > 0 ? (
                <>
                  {announcementList.slice(0, 2).map((announcement, index) => (
                    <div
                      key={announcement.id || index}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                      onClick={() => handleAnnouncementClick(announcement)}
                    >
                      <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-indigo-700 transition-colors">
                        {announcement.title || 'Important Announcement'}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {announcement.description || announcement.message || 'Stay updated with our latest news and updates.'}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-indigo-600 font-medium">
                          {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                        <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to view details
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* View All Button */}
                  {announcementList.length > 1 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={onViewAll}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        View All Announcements
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No announcements available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enquiry Form Section - Right 6 columns */}
        <div className="lg:col-span-6">
          <EnquiryForm />
        </div>
      </div>

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

export default CategoryCards;