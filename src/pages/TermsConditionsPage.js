import React from 'react';
import { FileText, Scale, AlertTriangle, Users, Shield, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TermsConditionsPage = () => {
  const { institute } = useAuth();
  const instituteName = institute?.institue || 'Our Institute';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using our services
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
                <FileText className="h-6 w-6 mr-2 text-blue-600" />
                Agreement to Terms
              </h2>
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <p className="text-blue-900 font-semibold mb-2">Important Notice</p>
                <p className="text-blue-800 leading-relaxed">
                  By accessing and using {instituteName}'s learning platform and services, you accept and agree to be bound by these Terms and Conditions. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </div>
            </section>

            {/* Definitions */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Definitions</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">"Platform"</h3>
                  <p className="text-gray-700">Refers to {instituteName}'s online learning management system, mobile applications, and all related services.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">"User" or "You"</h3>
                  <p className="text-gray-700">Refers to any individual who accesses or uses our platform and services.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">"Content"</h3>
                  <p className="text-gray-700">Includes all educational materials, videos, quizzes, documents, and other resources available on our platform.</p>
                </div>
              </div>
            </section>

            {/* User Obligations */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                User Obligations
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Account Responsibilities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Notify us of any unauthorized access</li>
                    <li>Use the platform only for educational purposes</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Prohibited Activities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Sharing account credentials with others</li>
                    <li>Downloading or redistributing content</li>
                    <li>Using automated systems or bots</li>
                    <li>Engaging in fraudulent activities</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-6 rounded-lg mt-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-1" />
                  <div>
                    <h4 className="text-red-900 font-semibold mb-2">Violation Consequences</h4>
                    <p className="text-red-800">
                      Violation of these terms may result in account suspension, termination, and legal action where applicable.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Platform Usage */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Usage</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Course Access</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Access is granted upon successful enrollment and payment</li>
                    <li>Course materials are for personal use only</li>
                    <li>Access duration varies by course type and payment plan</li>
                    <li>We reserve the right to modify course content and structure</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Requirements</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Stable internet connection required</li>
                    <li>Compatible device with updated browser</li>
                    <li>Users responsible for their own technical setup</li>
                    <li>Platform availability subject to maintenance schedules</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-blue-600" />
                Intellectual Property
              </h2>
              
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg mb-4">
                <h3 className="text-amber-900 font-semibold mb-2">Our Content</h3>
                <p className="text-amber-800">
                  All content, including but not limited to text, graphics, videos, audio, software, and course materials, 
                  is the exclusive property of {instituteName} and is protected by copyright and other intellectual property laws.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">You May:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Access and view content for personal educational use</li>
                  <li>Take notes for your own learning purposes</li>
                  <li>Participate in discussions and forums</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900">You May NOT:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Copy, reproduce, or distribute our content</li>
                  <li>Modify or create derivative works</li>
                  <li>Use content for commercial purposes</li>
                  <li>Remove copyright or proprietary notices</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Terms</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pricing & Billing</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>All prices are in Indian Rupees (₹)</li>
                    <li>Prices may change with 30-day notice</li>
                    <li>Taxes and fees may apply</li>
                    <li>Payment is due at time of enrollment</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Refund Policy</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Refunds subject to our Refund Policy</li>
                    <li>Request within specified timeframe</li>
                    <li>Partial refunds may apply</li>
                    <li>Processing time: 7-14 business days</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <p className="text-yellow-900 font-semibold mb-2">Disclaimer</p>
                <p className="text-yellow-800 leading-relaxed mb-4">
                  While we strive to provide high-quality educational content, we make no guarantees about specific learning outcomes, 
                  job placements, or career advancement results.
                </p>
                <p className="text-yellow-800 leading-relaxed">
                  Our total liability for any claims related to our services shall not exceed the amount paid by you for the specific course or service.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">By You</h3>
                  <p className="text-gray-700">You may terminate your account at any time by contacting our support team. Refunds will be processed according to our Refund Policy.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">By Us</h3>
                  <p className="text-gray-700">We may terminate or suspend your account immediately for violations of these terms or for any other reason at our sole discretion.</p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="h-6 w-6 mr-2 text-blue-600" />
                Contact Information
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  If you have questions about these Terms and Conditions, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> legal@{instituteName.toLowerCase().replace(/\s+/g, '')}.com</p>
                  <p><strong>Support:</strong> support@{instituteName.toLowerCase().replace(/\s+/g, '')}.com</p>
                  <p><strong>Address:</strong> {instituteName} Legal Department</p>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. We will notify users of significant changes 
                via email or platform notifications. Continued use of our services constitutes acceptance of the updated terms.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;