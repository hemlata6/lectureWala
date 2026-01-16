import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validation';
import { User, Mail, UserPlus, Sparkles } from 'lucide-react';
import Network from '../../context/Network';
import instId from '../../context/instituteId';

const Signup = ({ onSwitchToLogin, onClose }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tempSignupData, setTempSignupData] = useState(null);
  const { login } = useAuth();
  const { setStudentAuth } = useStudent();

  // Check for temporary signup data on component mount
  useEffect(() => {
    const tempData = localStorage.getItem('tempSignup');
    if (tempData) {
      const parsedData = JSON.parse(tempData);
      setTempSignupData(parsedData);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    const newErrors = {};

    if (!validateRequired(formData.firstname)) {
      newErrors.firstname = 'First name is required';
    }

    if (!validateRequired(formData.lastname)) {
      newErrors.lastname = 'Last name is required';
    }

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // if (tempSignupData && tempSignupData.otpVerified) {
      // Complete registration with verified phone number
      const registrationData = {
        contact: tempSignupData.phone,
        firstName: formData.firstname,
        lastName: formData.lastname,
        email: formData.email,
        instId: instId,
        password: 123456,
        gender: "other",
        cityId: 1,
        address: 'India',
        userName: `${formData.firstname} ${formData.lastname}`,
      };

      // console.log('Completing student registration:', registrationData);
      const registrationResponse = await Network.studentRegister(registrationData);
      // console.log('Registration response:', registrationResponse);

      if (registrationResponse.status === true) {
        // Registration successful - now call student login API
        // console.log('Registration successful, calling student login...');

        localStorage.removeItem('tempSignup'); // Clean up temp data

        let loginBody = {
          userName: `${formData.firstname} ${formData.lastname}`,
          password: 123456,
          instId: instId,
          deviceId: '1',
          deviceOS: 'windows'
        };

        const loginResponse = await Network.studentLogIn(loginBody);
        // console.log('Login response after registration:', loginResponse);
        // console.log('AuthToken from login response:', loginResponse.authToken);
        // console.log('Student data from login response:', loginResponse.student);

        if (loginResponse.status === true) {
          // Use StudentContext to store auth data
          const success = setStudentAuth(loginResponse);
          // console.log('StudentContext save success in Signup:', success);
          
          // Also save authToken separately for backward compatibility
          if (loginResponse.authToken) {
            localStorage.setItem('authToken', loginResponse.authToken);
            // console.log('AuthToken saved to localStorage in Signup:', loginResponse.authToken);
          }
          
          if (success) {
            // Login the user automatically
            const result = login(tempSignupData.phone, '000000'); // Use dummy OTP since already verified
            if (result.success) {
              // console.log('Registration and login successful!');
              // console.log('Current localStorage authToken:', localStorage.getItem('authToken'));
              // console.log('Current localStorage studentData:', localStorage.getItem('studentData'));
              // Close the modal on successful signup/login
              if (onClose) {
                onClose();
              }
            } else {
              setErrors({ submit: result.error || 'Registration successful but login failed.' });
            }
          } else {
            setErrors({ submit: 'Registration successful but failed to save authentication data.' });
          }
        } else {
          setErrors({ submit: loginResponse.message || 'Registration successful but login failed.' });
        }
      } else {
        setErrors({ submit: registrationResponse.message || 'Registration failed. Please try again.' });
      }
      // }
    } catch (error) {
      // console.error('Registration error:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-8">
          {/* Close Button */}
          {onClose && (
            <div className="absolute top-4 right-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="text-center">
            <div className="relative mx-auto h-16 w-16 mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl"></div>
              <div className="relative h-full w-full bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center transform rotate-3">
                <UserPlus className="h-7 w-7 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-gray-600 text-sm">
                Join our community and start your learning journey
              </p>
            </div>

            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* First Name Field */}
            <div className="space-y-1">
              <label htmlFor="firstname" className="block text-sm font-semibold text-gray-700">
                First Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  autoComplete="given-name"
                  className={`block w-full pl-12 pr-4 py-3 border-2 ${errors.firstname
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-indigo-500'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70`}
                  placeholder="Enter your first name"
                  value={formData.firstname}
                  onChange={handleChange}
                />
              </div>
              {errors.firstname && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.firstname}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div className="space-y-1">
              <label htmlFor="lastname" className="block text-sm font-semibold text-gray-700">
                Last Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  autoComplete="family-name"
                  className={`block w-full pl-12 pr-4 py-3 border-2 ${errors.lastname
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-indigo-500'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70`}
                  placeholder="Enter your last name"
                  value={formData.lastname}
                  onChange={handleChange}
                />
              </div>
              {errors.lastname && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.lastname}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-12 pr-4 py-3 border-2 ${errors.email
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-indigo-500'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70`}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-slide-down">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;