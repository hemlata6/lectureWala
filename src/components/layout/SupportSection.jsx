import React from 'react';
import { MessageCircle, Headphones, Sparkles } from 'lucide-react';

const SupportSection = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919876543210?text=Hello%20I%20have%20a%20question%20about%20your%20courses', '_blank');
  };

  return (
    <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 sm:w-60 sm:h-60 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 sm:w-60 sm:h-60 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="relative group">
          {/* Gradient Border Animation */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition duration-500 animate-pulse"></div>
          
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 p-6 sm:p-8 md:p-10 relative z-10">
              {/* Left Content */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left flex-1">
                {/* Animated Icon */}
                <div className="flex-shrink-0 relative">
                  {/* Pulsing background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur-md opacity-50 animate-pulse"></div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Headphones className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                    {/* Sparkle effect */}
                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-ping" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-2 sm:space-y-3">
               
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                    We're Here to Help!
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl">
                    Have questions or need guidance? Our expert support team is ready to assist you anytime. Get instant help via WhatsApp!
                  </p>
                  
                  {/* Feature badges */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start pt-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-green-700">Quick Response</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <span className="text-xs font-semibold text-blue-700">Expert Guidance</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <span className="text-xs font-semibold text-purple-700">Free Consultation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Button */}
              <div className="flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleWhatsAppClick}
                  className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 overflow-hidden"
                >
                  {/* Button gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                  
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse relative z-10" />
                  <span className="relative z-10">Chat on WhatsApp</span>
                  
                  {/* Arrow icon */}
                  <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                
                {/* Small helper text */}
                {/* <p className="text-center text-xs text-gray-500 mt-2 sm:mt-3">
                  ⚡ Average response time: &lt; 2 minutes
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
