import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, MessageCircle, Search, Filter } from 'lucide-react';
import Endpoints from '../context/endpoints';
import instId from '../context/instituteId';

const PublicAnnouncementPage = ({ onAuthAction }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAnnouncementsData();
  }, []);

  const fetchAnnouncementsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${Endpoints.baseURL}/admin/announcement/fetch-active-announcement/${instId}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'academic', 'admission', 'exam', 'event', 'general'];

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Announcements</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with our latest news, events, and important information
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[150px]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length > 0 ? (
          <div className="space-y-6 mb-12">
            {filteredAnnouncements.map((announcement, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="md:flex">
                  {/* Image */}
                  {announcement.image && (
                    <div className="md:w-1/3">
                      <img
                        src={Endpoints.mediaBaseUrl + announcement.image}
                        alt={announcement.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className={`${announcement.image ? 'md:w-2/3' : 'w-full'} p-6`}>
                    {/* Category Badge */}
                    {announcement.category && (
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-3">
                        {announcement.category.toUpperCase()}
                      </span>
                    )}

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {announcement.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {announcement.description?.length > 300 
                        ? `${announcement.description.substring(0, 300)}...`
                        : announcement.description
                      }
                    </p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(announcement.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {getTimeAgo(announcement.createdAt)}
                      </div>
                      {announcement.views && (
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {announcement.views} views
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onAuthAction('login')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Read More
                      <MessageCircle className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No Results Found' : 'No Announcements'}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search criteria or filters'
                : 'No announcements available at the moment. Check back later for updates!'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated!
          </h2>
          <p className="text-xl text-green-100 mb-6">
            Join our community to get instant notifications about important announcements and never miss any updates!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onAuthAction('signup')}
              className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Join Now
            </button>
            <button
              onClick={() => onAuthAction('login')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-colors duration-200"
            >
              Login
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800">
            <strong>Note:</strong> To read full announcements and get notifications, please log in to your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicAnnouncementPage;