import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validation';
import { User, Mail, UserPlus, Sparkles } from 'lucide-react';
import Network from '../../context/Network';
import instId from '../../context/instituteId';
import { PhoneRounded } from '@mui/icons-material';

const PublicSignup = ({ onSwitchToLogin, onClose }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
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
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Call student registration API
      // const registrationBody = {
      //   contact: tempSignupData?.phone || '1234567890',
      //   instId: instId,
      //   firstname: formData.firstname,
      //   lastname: formData.lastname,
      //   email: formData.email
      // };

      const registrationBody = {
        contact: tempSignupData?.phone,
        firstName: formData.firstname,
        lastName: formData.lastname,
        email: formData.email,
        instId: instId,
        password: 123456,
        gender: "male",
        cityId: 1,
        address: 'India',
        userName: `${formData.firstname} ${formData.lastname}`,
      };

      const registrationResponse = await Network.studentRegister(registrationBody);

      if (registrationResponse.status === true) {
        // Registration successful - now call student login API
        const loginBody = {
          contact: tempSignupData?.phone,
          otp: tempSignupData?.otp,
          instId: instId,
          deviceId: "1",
          deviceOS: "windows",
        };

        const loginResponse = await Network.verifyLoginOtp(loginBody);

        if (loginResponse.status === true) {
          const success = setStudentAuth(loginResponse);

          if (success) {
            // Login the user automatically
            const result = login(tempSignupData?.phone, tempSignupData?.otp);
            if (result.success) {
              // Clear temporary signup data
              localStorage.removeItem('tempSignup');
              // Close the signup form on successful signup/login
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
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-8">
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

          {tempSignupData && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Phone number verified for +91 {tempSignupData.phone}
              </p>
            </div>
          )}

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
          {/* First Name */}
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

          {/* Last Name */}
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

          {/* <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
              Phone Number
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600">
                <User className="h-5 w-5" />
              </div>
              <input
                id="phone"
                name="phone"
                type="number"
                autoComplete="tel"
                className={`block w-full pl-12 pr-4 py-3 border-2 ${errors.phone
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-indigo-500'
                  } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70`}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.phone}
              </p>
            )}
          </div> */}

          {/* Email */}
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
  );
};

export default PublicSignup;