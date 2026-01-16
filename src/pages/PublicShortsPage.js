import React, { useState, useEffect } from 'react';
import { Play, Eye, Heart, MessageCircle, Clock } from 'lucide-react';
import Endpoints from '../context/endpoints';
import instId from '../context/instituteId';

const PublicShortsPage = ({ onAuthAction }) => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchShortsData();
  }, []);

  const fetchShortsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${Endpoints.baseURL}/student/shortVideo/fetch-public/${instId}`);
      if (response.ok) {
        const data = await response.json();
        setShorts(data.shorts || []);
      }
    } catch (error) {
      console.error('Error fetching shorts data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'educational', 'news', 'tips', 'announcements'];

  const filteredShorts = selectedCategory === 'all' 
    ? shorts 
    : shorts.filter(short => short.category === selectedCategory);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading shorts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shorts</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Quick educational content and updates to keep you informed and engaged
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Shorts Grid */}
        {filteredShorts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredShorts.map((short, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
                onClick={() => onAuthAction('login')} // Redirect to login to watch
              >
                <div className="relative">
                  {/* Video Thumbnail */}
                  <div className="relative h-64 bg-gray-900 flex items-center justify-center">
                    {short.thumbnail ? (
                      <img
                        src={Endpoints.mediaBaseUrl + short.thumbnail}
                        alt={short.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                        <Play className="h-16 w-16 text-white" />
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    {short.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(short.duration)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {short.title || 'Educational Short'}
                    </h3>
                    
                    {short.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {short.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {short.views || 0}
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {short.likes || 0}
                        </div>
                      </div>
                      {short.createdAt && (
                        <span>{new Date(short.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Shorts Available</h3>
            <p className="text-gray-600 mb-8">
              No short videos available at the moment. Check back later for exciting content!
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Watch?
          </h2>
          <p className="text-xl text-purple-100 mb-6">
            Join our community to watch all our educational shorts and get access to exclusive content!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onAuthAction('signup')}
              className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Sign Up to Watch
            </button>
            <button
              onClick={() => onAuthAction('login')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-colors duration-200"
            >
              Login
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800">
            <strong>Note:</strong> To watch our educational shorts and access all features, please log in to your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicShortsPage;