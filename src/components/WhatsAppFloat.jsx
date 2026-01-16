import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppFloat = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Replace with your WhatsApp business phone number (with country code, no +)
  const whatsappNumber = '919876543210'; // Example: 91 is India country code
  const whatsappMessage = 'Hello! I am interested in your courses. Can you help me?';
  
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* WhatsApp Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 p-4 transform hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* Tooltip/Label - appears on hover */}
        {isHovered && (
          <span className="text-sm font-semibold whitespace-nowrap pr-2 animate-in fade-in duration-200">
            Chat with us
          </span>
        )}
      </a>

      {/* Pulse Animation Background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-20 animate-pulse -z-10"></div>
    </div>
  );
};

export default WhatsAppFloat;
