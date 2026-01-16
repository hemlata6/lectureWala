import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validation';
import { Eye, EyeOff, User, Mail, Lock, LogIn, Sparkles, Phone, MessageCircle, Timer } from 'lucide-react';
import Network from '../../context/Network';
import instId from '../../context/instituteId';

const Login = ({ onSwitchToSignup, onClose }) => {
  const [formData, setFormData] = useState({
    phone: null,
    otp: null
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isNewUser, setIsNewUser] = useState(false); // Track if user is new or existing
  const { login } = useAuth();
  const { setStudentAuth } = useStudent();

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Phone number validation
  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Generate 6-digit OTP
  // const generateOTP = () => {
  //   return Math.floor(100000 + Math.random() * 900000).toString();
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format phone number input
    if (name === 'phone') {
      // Remove all non-digits and limit to 10 digits
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: limited
      }));
    } else if (name === 'otp') {
      // Limit OTP to 6 digits
      const cleaned = value.replace(/\D/g, '');
      const limited = cleaned.slice(0, 6);
      setFormData(prev => ({
        ...prev,
        [name]: limited
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // console.log("Form Data:", formData);

  const handleSendOTP = async () => {
    // Validate phone number
    if (!validateRequired(formData.phone)) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrors({ phone: 'Please enter a valid 10-digit phone number' });
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      // Step 1: Call sendLoginOtp API
      // console.log('Sending OTP to:', formData.phone);
      const response = await Network.sendLoginOtp(formData.phone);
      // console.log('SendLoginOtp response:', response);

      // Step 2: Check if login OTP was sent successfully (errorCode 0 or status true)
      if (response.status === true || response.errorCode === 0) {
        // console.log('Login OTP sent successfully');
        setIsNewUser(false); // Mark as existing user
        setOtpSent(true);
        setCountdown(60); // 60 seconds countdown
        // alert(`OTP sent to +91 ${formData.phone} for login!`);
      } else {
        // Step 3: If login OTP failed, try signup OTP (new user)
        // console.log('Login OTP failed, trying signup OTP for new user...');
        setIsNewUser(true); // Mark as new user

        const body = {
          contact: formData.phone,
          instId: instId, // Use instId from the context
        };

        const signUpOtpResponse = await Network.signUpSendOtp(body);
        // console.log('SignUpSendOtp response:', signUpOtpResponse);

        // Handle the signup OTP response
        if (signUpOtpResponse.status === false || signUpOtpResponse.errorCode === 10) {
          // This means user needs to signup - show OTP field
          setOtpSent(true);
          setCountdown(60); // 60 seconds countdown
          // alert(`OTP sent to +91 ${formData.phone} for signup!`);
        } else if (signUpOtpResponse.status === true) {
          // OTP sent successfully for signup
          setOtpSent(true);
          setCountdown(60);
          // alert(`OTP sent to +91 ${formData.phone} for signup!`);
        } else {
          // Handle signup OTP failure
          setErrors({ submit: signUpOtpResponse.message || 'Failed to send OTP. Please try again.' });
        }
      }

    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      handleSendOTP();
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear any previous errors

    // Validate OTP
    const newErrors = {};

    if (!validateRequired(formData.otp)) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      if (isNewUser) {
        // New user - call signUpVerifyOtp API
        // console.log('Verifying OTP for new user...');
        const body = {
          contact: Number(formData.phone),
          otp: Number(formData.otp),
          instId: instId
        };

        const verifyResponse = await Network.signUpVerifyOtp(body);
        // console.log('SignupVerifyOtp response:', verifyResponse);

        if (verifyResponse.status === true) {
          // Signup OTP verification successful - redirect to Signup.js for profile completion
          // console.log('Signup OTP verification successful!');
          // alert('OTP verified successfully! Please complete your profile.');

          // Save temporary signup data to localStorage
          // const tempSignupData = {
          //   phone: formData.phone,
          //   instId: instId,
          //   otpVerified: true,
          //   verificationTime: new Date().toISOString()
          // };

          // localStorage.setItem('tempSignup', JSON.stringify(tempSignupData));

          // Redirect to Signup component for profile completion
          onSwitchToSignup();
        } else {
          setErrors({ submit: verifyResponse.message || 'OTP verification failed. Please try again.' });
        }
      } else {
        // Existing user - call verifyLoginOtp API
        // console.log('Verifying OTP for existing user...');
        const body = {
          contact: formData.phone,
          otp: Number(formData.otp),
          instId: instId,
          deviceId: "1",
          deviceOS: "windows",
        };

        const loginVerifyResponse = await Network.verifyLoginOtp(body);

        // console.log('VerifyLoginOtp response:', loginVerifyResponse);

        if (loginVerifyResponse.status === true) {
          // Login successful - save auth data using StudentContext
          // console.log('Login verification successful!', loginVerifyResponse);
          // console.log('AuthToken from response:', loginVerifyResponse.authToken);
          // console.log('Student data from response:', loginVerifyResponse.student);

          // Store student data and auth token using the new context
          const success = setStudentAuth(loginVerifyResponse);

          if (success) {
            // Also call the legacy login for backward compatibility
            const result = login(formData.phone, formData.otp);
            if (!result.success) {
              setErrors({ submit: result.error || 'Login failed. Please try again.' });
            } else {

              if (onClose) {
                onClose();
              }
              // The AuthWrapper will automatically redirect to Dashboard
              // No need to force reload, state should update automatically
            }
          } else {
            setErrors({ submit: 'Failed to save authentication data. Please try again.' });
          }
        } else {
          setErrors({ submit: loginVerifyResponse.message || 'OTP verification failed. Please try again.' });
        }
      }
    } catch (error) {
      // console.error('Error verifying OTP:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Verification failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;

    setFormData(prev => ({ ...prev, otp: '' }));
    setErrors({});
    handleSendOTP();
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
                <LogIn className="h-7 w-7 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome
              </h2>
              <p className="text-gray-600 text-sm">
                {!otpSent ? 'Enter your phone number to receive OTP' : 'Enter the OTP sent to your phone'}
              </p>
            </div>

            {/* <p className="mt-4 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Create one here
              </button>
            </p> */}
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Phone Number Field */}
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">+91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`block w-full pl-20 pr-4 py-3 border-2 ${errors.phone
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-indigo-500'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70`}
                  placeholder="Enter your 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  disabled={otpSent && countdown > 0}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* OTP Field - Show only after OTP is sent */}
            {otpSent && (
              <div className="space-y-1 animate-slide-down">
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                  Enter OTP
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    className={`block w-full pl-12 pr-4 py-3 border-2 ${errors.otp
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-indigo-500'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 text-left text-lg font-mono tracking-widest`}
                    placeholder="------"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength={6}
                  />
                </div>
                {errors.otp && (
                  <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.otp}
                  </p>
                )}

                {/* Resend OTP */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    OTP sent to +91 {formData.phone}
                  </span>
                  {countdown > 0 ? (
                    <span className="text-indigo-600 flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

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
                    {!otpSent ? 'Sending OTP...' : 'Verifying...'}
                  </>
                ) : (
                  <>
                    {!otpSent ? (
                      <>
                        <MessageCircle className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                        Send OTP
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                        Verify & Sign In
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div> */}

          {/* Social Login Options */}
          {/* <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2.5 px-4 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-sm font-medium text-gray-500 hover:bg-white/70 hover:text-gray-700 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="ml-2">Google</span>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-2.5 px-4 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-sm font-medium text-gray-500 hover:bg-white/70 hover:text-gray-700 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
              <span className="ml-2">Twitter</span>
            </button>
          </div> */}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
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

export default Login;