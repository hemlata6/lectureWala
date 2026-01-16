import React from 'react';
import { Shield, Eye, Lock, Users, FileText, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PrivacyPolicyPage = () => {
  const { institute } = useAuth();
  const instituteName = institute?.institue || 'Our Institute';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Learn how we protect and handle your personal information
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 mr-2 text-blue-600" />
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At {instituteName}, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our learning platform and services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-blue-600" />
                Information We Collect
              </h2>
              
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Name, email address, and phone number</li>
                  <li>Educational background and qualifications</li>
                  <li>Profile pictures and personal preferences</li>
                  <li>Payment information for course purchases</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Course progress and quiz results</li>
                  <li>Login times and platform usage patterns</li>
                  <li>Device information and IP addresses</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                How We Use Your Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Service Provision</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Deliver educational content and services</li>
                    <li>Track learning progress and achievements</li>
                    <li>Provide customer support</li>
                    <li>Process payments and transactions</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Communication</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Send course updates and announcements</li>
                    <li>Respond to inquiries and support requests</li>
                    <li>Share important policy changes</li>
                    <li>Marketing communications (with consent)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 mr-2 text-blue-600" />
                Information Sharing and Disclosure
              </h2>
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-4">
                <p className="text-red-800 font-semibold mb-2">We do NOT sell your personal information.</p>
                <p className="text-red-700">
                  We may share your information only in the following limited circumstances:
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With trusted service providers (under strict confidentiality agreements)</li>
                <li>In case of business transfers or mergers</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-blue-600" />
                Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Encryption</h4>
                  <p className="text-sm text-gray-600">Data encryption in transit and at rest</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Access Control</h4>
                  <p className="text-sm text-gray-600">Restricted access to authorized personnel</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Monitoring</h4>
                  <p className="text-sm text-gray-600">Regular security audits and monitoring</p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-blue-900 font-semibold mb-3">You have the right to:</p>
                <ul className="list-disc list-inside text-blue-800 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and data</li>
                  <li>Withdraw consent for marketing communications</li>
                  <li>Data portability and export</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="h-6 w-6 mr-2 text-blue-600" />
                Contact Us
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@{instituteName.toLowerCase().replace(/\s+/g, '')}.com</p>
                  <p><strong>Address:</strong> {instituteName} Privacy Office</p>
                  <p><strong>Response Time:</strong> We will respond to your inquiry within 48 hours</p>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "last updated" date. You are advised to review this Privacy 
                Policy periodically for any changes.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;