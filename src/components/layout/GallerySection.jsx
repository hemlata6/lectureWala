import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext';
import { Camera, Heart, Star, X, ZoomIn } from 'lucide-react';
import Endpoints from '../../context/endpoints';
import Network from '../../context/Network';

const GallerySection = ({ onViewAll }) => {

    const [galleryList, setGalleryList] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchInstitute();
    }, [])

    const fetchInstitute = async () => {
        try {
            const response = await Network.getInstitute();
            if (response.status && response.institute) {
                setGalleryList(response.institute.gallery);
            } else {
                console.log("No institute data found or invalid response");
                return null;
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Show only first 6 images for loop, or all if showAll is true
    const displayImages = showAll ? galleryList : galleryList.slice(0, 6);
    // Duplicate the array for seamless loop
    const duplicatedGallery = [...displayImages, ...displayImages];

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

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Camera className="w-8 h-8 text-blue-500" />
                    <h2 className="text-3xl font-bold text-gray-900">
                        📸 Our Gallery
                    </h2>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Discover beautiful moments and memories captured in our educational journey
                </p>
            </div>

            {/* Gallery Container */}
            <div className="relative h-[500px] bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-2xl">
                {/* Gradient Overlays for Smooth Fade Effect */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/90 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 to-transparent z-10 pointer-events-none"></div>

                {/* Scrolling Images Container */}
                <div className="absolute inset-0 p-4">
                    <div
                        className="grid grid-cols-2 gap-4"
                        style={{
                            animation: `scrollUp ${displayImages.length * 3}s linear infinite`,
                            animationPlayState: isHovered ? 'paused' : 'running'
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {duplicatedGallery.map((image, index) => (
                            <div
                                key={`${image.id}-${index}`}
                                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-shrink-0 cursor-pointer"
                                onClick={() => handleImageClick(image)}
                            >
                                <img
                                    src={Endpoints.mediaBaseUrl + image}
                                    alt={`Gallery image ${index + 1}`}
                                    className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* Zoom Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <ZoomIn className="w-8 h-8 text-white transform scale-75 group-hover:scale-100 transition-transform duration-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* View All Button */}
            {!showAll && galleryList.length > 6 && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={onViewAll}
                        className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-2xl font-semibold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-3 transform hover:scale-105"
                    >
                        <Camera className="w-5 h-5" />
                        <span>View All Gallery ({galleryList.length} Photos)</span>
                    </button>
                </div>
            )}

            {/* Show Less Button */}
            {showAll && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => setShowAll(false)}
                        className="group bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
                    >
                        <span>Show Less</span>
                    </button>
                </div>
            )}

            {/* Full Screen Image Dialog */}
            {isDialogOpen && selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={handleCloseDialog}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseDialog}
                            className="absolute -top-12 right-0 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-3 rounded-full transition-all duration-300 hover:scale-110 z-10 text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Image Container */}
                        <div
                            className="relative bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 scale-95 hover:scale-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={Endpoints.mediaBaseUrl + selectedImage}
                                alt={selectedImage.title || 'Gallery image'}
                                className="w-full h-auto max-h-[80vh] object-contain"
                            />

                            {/* Image Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h3 className="text-white text-xl font-semibold mb-2">
                                    {selectedImage.title || 'Gallery Image'}
                                </h3>
                                <p className="text-white/80 text-sm">
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
                
                .animate-scroll-up {
                    animation: scrollUp linear infinite;
                }
            `}</style>
        </div>
    );
};

export default GallerySection