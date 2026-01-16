import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext';
import { Camera, X, ZoomIn, Grid, Images, Play, Pause } from 'lucide-react';
import Endpoints from '../context/endpoints';

const GalleryPage = () => {
    const { gallery } = useAuth();
    const [galleryList, setGalleryList] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState('scroll'); // 'scroll' or 'grid'
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    // Extended mock data for gallery page
    const mockGalleryData = [
        {
            id: 1,
            src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Students Learning",
            description: "Interactive classroom session"
        },
        {
            id: 2,
            src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Modern Classroom",
            description: "State-of-the-art facilities"
        },
        {
            id: 3,
            src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Study Group",
            description: "Collaborative learning"
        },
        {
            id: 4,
            src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Library Sessions",
            description: "Quiet study environment"
        },
        {
            id: 5,
            src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Graduation Day",
            description: "Achievement celebration"
        },
        {
            id: 6,
            src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Campus Life",
            description: "Beautiful campus grounds"
        },
        {
            id: 7,
            src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Science Lab",
            description: "Hands-on experiments"
        },
        {
            id: 8,
            src: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Workshop Session",
            description: "Practical skills development"
        },
        {
            id: 9,
            src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Library Study",
            description: "Focused learning environment"
        },
        {
            id: 10,
            src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Academic Success",
            description: "Achievement and growth"
        },
        {
            id: 11,
            src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Discussion Forum",
            description: "Student interaction"
        },
        {
            id: 12,
            src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            title: "Digital Learning",
            description: "Technology integration"
        }
    ];

    useEffect(() => {
        if (gallery && gallery.length > 0) {
            setGalleryList(gallery);
        } else {
            // Use mock data when API data is not available
            setGalleryList(mockGalleryData);
        }
    }, [gallery]);

    // Duplicate the array for seamless loop
    const duplicatedGallery = [...galleryList, ...galleryList];

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Camera className="w-10 h-10 text-blue-500" />
                        <h1 className="text-4xl font-bold text-gray-900">
                            📸 Complete Gallery
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
                                        animation: `scrollUp ${galleryList.length * 2.5}s linear infinite`,
                                        animationPlayState: (isHovered || !isAutoPlay) ? 'paused' : 'running'
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
                        {galleryList.map((image, index) => (
                            <div
                                key={image.id}
                                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                onClick={() => handleImageClick(image)}
                            >
                                <img
                                    src={Endpoints.mediaBaseUrl + image}
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

                {/* Gallery Stats */}
                {/* <div className="flex justify-center items-center gap-8 mt-12">
                    <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                        <div className="text-3xl font-bold text-blue-600">{galleryList.length}</div>
                        <div className="text-sm text-gray-600">Total Images</div>
                    </div>
                    <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                        <div className="text-3xl font-bold text-green-600">HD</div>
                        <div className="text-sm text-gray-600">Quality</div>
                    </div>
                    <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                        <div className="text-3xl font-bold text-purple-600">∞</div>
                        <div className="text-sm text-gray-600">Memories</div>
                    </div>
                </div> */}
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
                                src={Endpoints.mediaBaseUrl + selectedImage}
                                alt={selectedImage.title || 'Gallery image'}
                                className="w-full h-auto max-h-[75vh] object-contain"
                            />

                            {/* Image Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h3 className="text-white text-2xl font-semibold mb-2">
                                    {selectedImage.title || 'Gallery Image'}
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

export default GalleryPage