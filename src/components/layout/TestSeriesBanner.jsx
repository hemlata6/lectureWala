import React, { useEffect, useState } from 'react';
import Endpoints from '../../context/endpoints';
import instId from '../../context/instituteId';

const TestSeriesBanner = () => {
  const [bannerImages, setBannerImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${Endpoints.baseURL}/admin/banner/fetch-public-banner/${instId}`);


        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }

        const data = await response.json();
        // Filter banners with group name "test series"
        if (data && data.banners) {
          const testSeriesBanners = data.banners.filter(
            banner => banner.group && banner.group.toLowerCase() === 'test series'
          );
          setBannerImages(testSeriesBanners);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError(err.message);
        setBannerImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Don't render if no banners found
  if (!bannerImages || bannerImages.length === 0 || loading) {
    return null;
  }

  return (
    <>
      {/* Section Header */}
      <section className="w-full py-4 sm:py-5 md:py-6 px-2 sm:px-3 md:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 px-2">
              Authentic Test Series with Expert Evaluation
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              Experience authentic, exam-level test series with detailed evaluation and insights from subject experts.
            </p>
          </div>
        </div>
      </section>

      {bannerImages.map((banner, index) => (
        <section key={banner.id || index} className="w-full py-3 sm:py-5 md:py-6 bg-gray-50">
          {/* Banner Container with padding */}
          <div className="px-2 sm:px-3 md:px-6 lg:px-8 max-w-full">
            <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 group">
              {/* Image */}
              <img
                src={`${Endpoints.mediaBaseUrl}${banner.banner}`}
                alt={banner.name || 'Test Series Banner'}
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1920x400?text=Test+Series';
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10"></div>

              {/* Optional: Add subtle text overlay if needed */}
              {banner.name && (
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                    {banner.name}
                  </h3>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

    </>
  );
};

export default TestSeriesBanner;
