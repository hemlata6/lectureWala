import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Users,
  Award,
  Heart,
  Youtube,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EnquiryForm from '../auth/EnquiryForm';

const Footer = ({ onPageChange }) => {
  const navigate = useNavigate();
  const { institute, instituteAppSettingsModals } = useAuth();
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (linkName) => {
    switch (linkName) {
      case 'Home':
        navigate('/');
        break;
      case 'My Purchases':
        navigate('/purchases');
        break;
      case 'store':
        navigate('/store');
        break;
      case 'content':
        navigate('/content');
        break;
      case 'Announcements':
        navigate('/announcement');
        break;
      case 'Contact':
        setShowEnquiryForm(true);
        break;
      default:
        break;
    }
  };

  const footerLinks = {
    'Quick Links': [
      { name: 'Home', action: () => handleLinkClick('Home') },
      // { name: 'My Purchases', action: () => handleLinkClick('My Purchases') },
      { name: 'Announcements', action: () => handleLinkClick('Announcements') },
      { name: 'Store', action: () => handleLinkClick('store') },
      { name: 'Free Resources', action: () => handleLinkClick('content') },
      { name: 'Contact', action: () => handleLinkClick('Contact') },
    ],
    // 'Learning': [
    //   { name: 'Browse Courses', href: '#' },
    //   { name: 'Practice Tests', href: '#' },
    //   { name: 'Certificates', href: '#' },
    //   { name: 'Study Materials', href: '#' }
    // ],
    // 'Support': [
    //   { name: 'Help Center', href: '#' },
    //   { name: 'FAQs', href: '#' },
    //   { name: 'Community', href: '#' },
    //   { name: 'Feedback', href: '#' }
    // ]
  };

  // const stats = [
  //   { icon: Users, value: '10,000+', label: 'Students' },
  //   { icon: BookOpen, value: '500+', label: 'Courses' },
  //   { icon: Award, value: '95%', label: 'Success Rate' },
  //   { icon: Heart, value: '4.9/5', label: 'Rating' }
  // ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Stats Section */}
      {/* <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              {
                institute?.institue ?
                  <h3 className="text-xl font-bold">{institute?.institue}</h3>
                  :
                  <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <img
                      src="logo (2).png"
                      alt="Scheduled"
                      style={{ width: "100%" }}
                    />
                  </div>
              }

            </div>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">

              {
                instituteAppSettingsModals?.appBio === '' ?
                  ` Empowering learners worldwide with quality education and interactive learning experiences.
              Join thousands of students who have transformed their careers with our comprehensive courses.`
                  :
                  instituteAppSettingsModals?.appBio
              }
            </p>


          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-lg font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={link.action}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200 cursor-pointer hover:underline bg-transparent border-none p-0 text-left"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Contact Info */}
          <div className="space-y-5">
            {
              institute?.email && (
                <div className="flex items-center text-gray-400 text-sm">
                  <Mail className="h-4 w-4 mr-3 text-blue-500" />
                  {institute?.email || 'N/A'}
                </div>
              )
            }
            {
              institute?.contact && (
                <div className="flex items-center text-gray-400 text-sm">
                  <Phone className="h-4 w-4 mr-3 text-blue-500" />
                  +91 {institute?.contact || 'N/A'}
                </div>
              )
            }
            {
              institute?.address && (
                <div className="flex items-center text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 mr-3 text-blue-500" />
                  {institute?.address || 'N/A'}
                </div>
              )
            }

            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: instituteAppSettingsModals?.facebookLink || '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: instituteAppSettingsModals?.instagramLink || '#', label: 'Instagram' },
                { icon: Youtube, href: instituteAppSettingsModals?.youtubeLink || '#', label: 'Youtube' }
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
          {/* Social Media Links */}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} {institute?.institue}. All rights reserved.
            </div>
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              Tech partner <a href='https://www.classiolabs.com/'>
                Classio Labs
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Form Modal */}
      {showEnquiryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowEnquiryForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 z-20"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-y-auto max-h-[95vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <EnquiryForm />
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;