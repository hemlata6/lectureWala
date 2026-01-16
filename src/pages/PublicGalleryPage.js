import React, { useState, useEffect, useContext } from 'react';
import { Camera, X, ZoomIn, Grid, Play, Pause } from 'lucide-react';
import Endpoints from '../context/endpoints';
import instId from '../context/instituteId';
import { useAuth } from '../context/AuthContext';
import Network from '../context/Network';

const PublicGalleryPage = ({ onAuthAction }) => {

    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState('scroll'); // 'scroll' or 'grid'
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        fetchInstitute();
    }, []);

    const fetchInstitute = async () => {
        setLoading(true);
        try {
            const response = await Network.getInstitute();

            if (response.status && response.institute) {
                setGalleryItems(response.institute.gallery);
            } else {
                console.log("No institute data found or invalid response");
                return null;
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    // Duplicate the array for seamless loop
    const duplicatedGallery = [...galleryItems, ...galleryItems];

    // Handle image click to open dialog
    const handleImageClick = (image) => {
        setSelectedImage(image);
        setIsDialogOpen(true);
    };

    // Handle dialog close
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedImage(null);
    };

    // Handle escape key to close dialog
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isDialogOpen) {
                handleCloseDialog();
            }
        };

        if (isDialogOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isDialogOpen]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Loading result...</p>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Camera className="w-10 h-10 text-blue-500" />
                        <h1 className="text-4xl font-bold text-gray-900">
                            📸 Our Moments
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Explore our comprehensive collection of educational moments, achievements, and memories
                    </p>

                    {/* View Mode Controls */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <button
                            onClick={() => setViewMode('scroll')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${viewMode === 'scroll'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-blue-50'
                                }`}
                        >
                            <Play className="w-4 h-4" />
                            Auto Scroll View
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${viewMode === 'grid'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-blue-50'
                                }`}
                        >
                            <Grid className="w-4 h-4" />
                            Grid View
                        </button>
                    </div>
                </div>

                {galleryItems.length > 0 ? (
                    <>
                        {/* Auto Scroll Gallery */}
                        {viewMode === 'scroll' && (
                            <div className="max-w-5xl mx-auto mb-12">
                                <div className="relative h-[600px] bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-2xl">
                                    {/* Gradient Overlays */}
                                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/90 to-transparent z-10 pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 to-transparent z-10 pointer-events-none"></div>

                                    {/* Auto Play Control */}
                                    <div className="absolute top-4 right-4 z-20">
                                        <button
                                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all duration-300"
                                        >
                                            {isAutoPlay ? (
                                                <Pause className="w-5 h-5 text-gray-700" />
                                            ) : (
                                                <Play className="w-5 h-5 text-gray-700" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Scrolling Images Container */}
                                    <div className="absolute inset-0 p-4">
                                        <div
                                            className="grid grid-cols-3 gap-4"
                                            style={{
                                                animation: `scrollUp ${galleryItems.length * 2.5}s linear infinite`,
                                                animationPlayState: (isHovered || !isAutoPlay) ? 'paused' : 'running'
                                            }}
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                        >
                                            {duplicatedGallery.map((image, index) => (
                                                <div
                                                    key={`${image.id || index}-${index}`}
                                                    className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-shrink-0 cursor-pointer"
                                                    onClick={() => handleImageClick(image)}
                                                >
                                                    <img
                                                        src={image ? Endpoints.mediaBaseUrl + image : '/api/placeholder/400/300'}
                                                        alt={image.title || `Gallery image ${index + 1}`}
                                                        className="w-full h-32 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                    />

                                                    {/* Zoom Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <ZoomIn className="w-6 h-6 text-white transform scale-75 group-hover:scale-100 transition-transform duration-300" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grid Gallery */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {galleryItems.map((image, index) => (
                                    <div
                                        key={image.id || index}
                                        className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                        onClick={() => handleImageClick(image)}
                                    >
                                        <img
                                            src={image ? Endpoints.mediaBaseUrl + image : '/api/placeholder/400/300'}
                                            alt={image.title || `Gallery image ${index + 1}`}
                                            className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* Image Info Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                                <h3 className="font-semibold text-sm mb-1">{image.title}</h3>
                                                <p className="text-xs opacity-90">{image.description}</p>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <ZoomIn className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📸</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Result Items</h3>
                        <p className="text-gray-600 mb-8">
                            No result items available at the moment. Check back later for updates!
                        </p>
                    </div>
                )}

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-center text-white mt-12">
                    <h2 className="text-3xl font-bold mb-4">
                        Want to See More?
                    </h2>
                    <p className="text-xl text-blue-100 mb-6">
                        Join our community to access exclusive content and stay updated with all our latest activities!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onAuthAction('signup')}
                            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                            Join Now
                        </button>
                        <button
                            onClick={() => onAuthAction('login')}
                            className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>

            {/* Full Screen Image Dialog */}
            {isDialogOpen && selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={handleCloseDialog}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseDialog}
                            className="absolute -top-12 right-0 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-3 rounded-full transition-all duration-300 hover:scale-110 z-10 text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Image Container */}
                        <div
                            className="relative bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage ? Endpoints.mediaBaseUrl + selectedImage : '/api/placeholder/400/300'}
                                alt={selectedImage.title || 'Result image'}
                                className="w-full h-auto max-h-[75vh] object-contain"
                            />

                            {/* Image Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h3 className="text-white text-2xl font-semibold mb-2">
                                    {selectedImage.title || 'Result Image'}
                                </h3>
                                <p className="text-white/80">
                                    {selectedImage.description || 'Beautiful moment captured'}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Hint */}
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
                            Press ESC or click outside to close
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS for Animation */}
            <style jsx>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>
        </div>
    );
};

export default PublicGalleryPage;