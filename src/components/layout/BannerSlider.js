import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Network from '../../context/Network';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import Endpoints from '../../context/endpoints';
import instId from '../../context/instituteId';

const BannerSlider = () => {
  const { authToken, institute } = useAuth();
  const { isAuthenticated } = useStudent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerSlide, setBannerSlide] = useState([]); // State to hold fetched banner slides
  const [loading, setLoading] = useState(true);
  const [imageColors, setImageColors] = useState({}); // State to hold dominant colors for each banner

  // console.log('imageColors', imageColors);

  // Function to extract dominant color from image
  const getImageDominantColor = (imgElement, slideId) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to match image
      canvas.width = imgElement.naturalWidth || imgElement.width;
      canvas.height = imgElement.naturalHeight || imgElement.height;

      // Draw image on canvas
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

      // Sample pixels from the image
      const imageData = ctx?.getImageData(0, 0, canvas?.width, canvas?.height);
      const data = imageData.data;

      let r = 0, g = 0, b = 0;
      let count = 0;

      // Sample every 10th pixel for performance
      for (let i = 0; i < data.length; i += 40) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      // Calculate average color
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      const color = `rgb(${r}, ${g}, ${b})`

      // Store the color for this slide
      setImageColors(prev => ({
        ...prev,
        [slideId]: color
      }));
    } catch (error) {
      console.error('Error extracting color for slide', slideId, ':', error);
      // Fallback to default color
      setImageColors(prev => ({
        ...prev,
        [slideId]: 'rgb(100, 100, 100)'
      }));
    }
  };

  const fetchBannerSlides = async () => {
    try {

      setLoading(true);
      const response = await fetch(`${Endpoints.baseURL}/admin/banner/fetch-public-banner/${instId}`);

      if (response.ok) {
        const bannerData = await response.json();
        setBannerSlide(bannerData.banners || []);
        // console.log('Banner slides fetched successfully:', activeBanners.length);
      } else {
        console.log('No banners found in response');
        setBannerSlide([]);
      }
    } catch (error) {
      console.error("Error fetching banner slides:", error);
      setBannerSlide([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerSlides();

    // Listen for authentication state changes
    const handleAuthStateChange = (event) => {
      // console.log('Auth state changed in BannerSlider, fetching banners...');
      if (event.detail.isAuthenticated) {
        // Small delay to ensure all localStorage operations are complete
        setTimeout(() => {
          fetchBannerSlides();
        }, 200);
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);

    // Cleanup
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, [isAuthenticated]);

  const nextSlide = () => {
    if (bannerSlide.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % bannerSlide.length);
    }
  };

  const prevSlide = () => {
    if (bannerSlide.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + bannerSlide.length) % bannerSlide.length);
    }
  };

  useEffect(() => {
    if (bannerSlide.length > 0) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [bannerSlide.length]);

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full aspect-[5/2] sm:aspect-video overflow-hidden rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500 flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
          <span className="text-xs sm:text-sm">Loading banners...</span>
        </div>
      </div>
    );
  }

  // Show empty state if no banners
  if (bannerSlide.length === 0) {
    return (
      <div className="relative w-full aspect-[5/2] sm:aspect-video md:aspect-[3/1] overflow-hidden rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center px-4">
          <h2 className="text-lg sm:text-2xl font-bold mb-2">Welcome to {institute?.institue}</h2>
          <p className="text-sm sm:text-lg opacity-90">Your learning journey starts here</p>
        </div>
      </div>
    );
  }


  return (
    <div className="relative w-full aspect-[5/2] sm:aspect-video md:aspect-[3/1] overflow-hidden rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl">
      {bannerSlide.map((slide, index) => {
        return (
          <div
            key={slide?.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${index === currentSlide ? 'translate-x-0' :
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
              }`}
          >
            <div className={`h-full relative`}>
              <div
                className="absolute inset-0 blur-sm transition-colors duration-500"
                style={{
                  background: imageColors[slide?.id] || 'black',
                  opacity: 0.1
                }}
              ></div>
              <div className="h-full relative">
                <img
                  alt='Banner'
                  src={Endpoints.mediaBaseUrl + slide?.banner}
                  className="w-full object-contain bg-gray"
                  onLoad={(e) => {
                    getImageDominantColor(e.target, slide?.id);
                  }}
                // onError={(e) => {
                //   console.error('Image failed to load for slide:', slide?.id);
                // }}
                // onError={(e) => {
                //   e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                //   e.target.style.display = 'none';
                //   const fallbackDiv = document.createElement('div');
                //   fallbackDiv.className = 'absolute inset-0 flex items-center justify-center text-white text-center p-6';
                //   fallbackDiv.innerHTML = `
                //   <div>
                //     <h2 class="text-3xl font-bold mb-2">Welcome to ${institute?.institue}</h2>
                //     <p class="text-lg opacity-90">Your learning journey starts here</p>
                //   </div>
                // `;
                //   e.target.parentElement.appendChild(fallbackDiv);
                // }}
                />
                {/* <div className="relative h-full flex items-center justify-center text-center px-6">
                <div className="max-w-4xl text-white">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl md:text-2xl font-semibold mb-6">
                    {slide.subtitle}
                  </h2>
                  <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                </div>
              </div> */}
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation arrows */}
      {/* <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm border border-white border-opacity-20"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm border border-white border-opacity-20"
      >
        <ChevronRight className="h-6 w-6" />
      </button> */}

      {/* Dots indicator */}
      <div className="absolute bottom-0.5 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
        {bannerSlide.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;