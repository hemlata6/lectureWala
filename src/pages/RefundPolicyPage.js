import React from 'react';
import { RotateCcw, Clock, CreditCard, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RefundPolicyPage = () => {
  const { institute } = useAuth();
  const instituteName = institute?.institue || 'Our Institute';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-xl text-gray-600">
            Understanding our refund process and eligibility criteria
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Overview */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Overview</h2>
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <p className="text-green-900 font-semibold mb-2">Our Commitment</p>
                <p className="text-green-800 leading-relaxed">
                  At {instituteName}, we are committed to your satisfaction. If you are not completely satisfied with your purchase, 
                  we offer refunds under the conditions outlined in this policy. We aim to process all valid refund requests fairly and promptly.
                </p>
              </div>
            </section>

            {/* Eligibility Criteria */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                Refund Eligibility
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">Eligible Scenarios</h3>
                  <ul className="list-disc list-inside text-blue-800 space-y-2">
                    <li>Technical issues preventing course access</li>
                    <li>Course content not matching description</li>
                    <li>Duplicate payments or billing errors</li>
                    <li>Course cancellation by the institute</li>
                    <li>Dissatisfaction within trial period</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">Non-Eligible Scenarios</h3>
                  <ul className="list-disc list-inside text-red-800 space-y-2">
                    <li>Course completion over 50%</li>
                    <li>Violation of terms of service</li>
                    <li>Change of mind after trial period</li>
                    <li>Technical issues on user's end</li>
                    <li>Subscription services after 30 days</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Refund Timeline */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-blue-600" />
                Refund Timeline
              </h2>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
                    <div>
                      <h3 className="text-yellow-900 font-semibold mb-2">Time Limits for Refund Requests</h3>
                      <p className="text-yellow-800 mb-3">
                        Refund requests must be submitted within the specified timeframes to be eligible for processing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center border-l-4 border-green-500">
                    <div className="text-2xl font-bold text-green-600 mb-2">7 Days</div>
                    <h4 className="font-semibold text-gray-900 mb-1">Trial Courses</h4>
                    <p className="text-sm text-gray-600">Full refund available</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center border-l-4 border-blue-500">
                    <div className="text-2xl font-bold text-blue-600 mb-2">14 Days</div>
                    <h4 className="font-semibold text-gray-900 mb-1">Regular Courses</h4>
                    <p className="text-sm text-gray-600">Partial refund based on progress</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center border-l-4 border-purple-500">
                    <div className="text-2xl font-bold text-purple-600 mb-2">30 Days</div>
                    <h4 className="font-semibold text-gray-900 mb-1">Premium Courses</h4>
                    <p className="text-sm text-gray-600">Conditional refund</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Calculation */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                Refund Calculation
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Calculation Method</h3>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-blue-900 mb-4">
                      <strong>Refund Amount = Course Fee × (1 - Progress Percentage) × Eligibility Factor</strong>
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Progress &lt; 25%</h4>
                        <p className="text-blue-800">80% refund</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Progress 25-50%</h4>
                        <p className="text-blue-800">50% refund</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Progress &gt; 50%</h4>
                        <p className="text-blue-800">No refund</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Special Cases</h3>
                  <div className="space-y-3">
                    <div className="flex items-start bg-green-50 p-4 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-green-900">Technical Issues</h4>
                        <p className="text-green-800 text-sm">100% refund if technical issues prevent course access</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start bg-blue-50 p-4 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Course Cancellation</h4>
                        <p className="text-blue-800 text-sm">100% refund if we cancel the course</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start bg-yellow-50 p-4 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-yellow-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-yellow-900">Billing Errors</h4>
                        <p className="text-yellow-800 text-sm">100% refund for duplicate charges or billing mistakes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Request */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request a Refund</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Step-by-Step Process</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Contact Support</h4>
                      <p className="text-gray-700 text-sm">Email us at refunds@{instituteName.toLowerCase().replace(/\s+/g, '')}.com with your request</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Provide Information</h4>
                      <p className="text-gray-700 text-sm">Include your order number, course details, and reason for refund</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Review Process</h4>
                      <p className="text-gray-700 text-sm">We will review your request within 2-3 business days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Refund Processing</h4>
                      <p className="text-gray-700 text-sm">Approved refunds are processed within 7-14 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Required Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Information</h2>
              
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                <h3 className="text-amber-900 font-semibold mb-3">Please include the following in your refund request:</h3>
                <ul className="list-disc list-inside text-amber-800 space-y-2">
                  <li>Full name and registered email address</li>
                  <li>Order/Transaction ID</li>
                  <li>Course name and purchase date</li>
                  <li>Detailed reason for refund request</li>
                  <li>Screenshots of any technical issues (if applicable)</li>
                  <li>Preferred refund method</li>
                </ul>
              </div>
            </section>

            {/* Processing Time */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Time & Methods</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Processing Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded">
                      <span className="text-blue-900 font-medium">Request Review</span>
                      <span className="text-blue-700">2-3 business days</span>
                    </div>
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded">
                      <span className="text-green-900 font-medium">Refund Processing</span>
                      <span className="text-green-700">7-14 business days</span>
                    </div>
                    <div className="flex justify-between items-center bg-purple-50 p-3 rounded">
                      <span className="text-purple-900 font-medium">Bank Settlement</span>
                      <span className="text-purple-700">3-5 business days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Methods</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Original payment method (preferred)</li>
                    <li>Bank transfer (for cash payments)</li>
                    <li>Digital wallet refund</li>
                    <li>Course credit (if requested)</li>
                  </ul>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> Refunds are processed in the same currency as the original payment.
                    </p>
                  </div>
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
                  For any questions about refunds or to request a refund, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Refund Email:</strong> refunds@{instituteName.toLowerCase().replace(/\s+/g, '')}.com</p>
                    <p><strong>Support Email:</strong> support@{instituteName.toLowerCase().replace(/\s+/g, '')}.com</p>
                    <p><strong>Phone:</strong> Available on business days</p>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Business Hours:</strong> Mon-Fri, 9 AM - 6 PM</p>
                    <p><strong>Response Time:</strong> Within 24 hours</p>
                    <p><strong>Weekend Support:</strong> Email only</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Refund Policy from time to time to reflect changes in our services or applicable laws. 
                We will notify users of significant changes via email or platform notifications. The updated policy will be 
                effective immediately upon posting.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;