import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Smartphone, Download, Monitor } from 'lucide-react'

const AppDownloadSection = () => {

    const { institute, instituteAppSettingsModals } = useAuth();

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                    Download {institute?.institue} App
                </h2>
                <p className="text-base sm:text-lg text-gray-600 px-4">
                    Get the best learning experience on your favorite device. Available on all platforms.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                <div className="text-center p-4 sm:p-6 hover:transform hover:scale-105 transition-all duration-200 cursor-pointer group">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-green-200 transition-colors">
                        <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Google Play Store</h3>
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-2 sm:px-0">
                        Download our Android app and learn on-the-go with offline content, push notifications, and seamless sync.
                    </p>
                    <a href={"https://play.google.com/store/apps/details?id=com.classiolabs.zeroinfy2&pcampaignid=web_share"} target="_blank" rel="noopener noreferrer">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto">
                            <Download className="w-4 h-4" />
                            Get on Android
                        </button>
                    </a>
                </div>

                <div className="text-center p-4 sm:p-6 hover:transform hover:scale-105 transition-all duration-200 cursor-pointer group">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors">
                        <Monitor className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Microsoft Store</h3>
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-2 sm:px-0">
                        Experience our Windows app with desktop optimization, multi-window support, and enhanced productivity features.
                    </p>
                    <a href={"https://apps.microsoft.com/detail/9N5HW3QGJP7D?hl=en-us&gl=IN&ocid=pdpshare"} target="_blank" rel="noopener noreferrer">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto">
                            <Download className="w-4 h-4" />
                            Get on Windows
                        </button>
                    </a>
                </div>

                <div className="text-center p-4 sm:p-6 hover:transform hover:scale-105 transition-all duration-200 cursor-pointer group">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-gray-200 transition-colors">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-sm"></div>
                        </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Apple App Store</h3>
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-2 sm:px-0">
                        Get our iOS app with premium design, Face ID security, Apple Pencil support, and iCloud sync across devices.
                    </p>
                    <a href={"https://apps.apple.com/in/app/zeroinfy/id6751030303"} target="_blank" rel="noopener noreferrer">
                        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto">
                            <Download className="w-4 h-4" />
                            Get on iOS
                        </button>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default AppDownloadSection