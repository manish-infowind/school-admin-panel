import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, LayoutDashboard, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { LogoIcon } from "@/components/ui/logo-icon";
// COMMENTED OUT: No 2FA APIs available yet
// import { TwoFactorLoginModal } from "@/components/auth/TwoFactorLoginModal";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  // COMMENTED OUT: No 2FA APIs available yet
  // const [show2FAModal, setShow2FAModal] = useState(false);
  // const [loginResponse, setLoginResponse] = useState<any>(null);
  // const [is2FAFlow, setIs2FAFlow] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  
  const { login, isAuthenticated, isLoggingIn, loginError } = useAuth();
  // COMMENTED OUT: No 2FA APIs available yet
  // const { verify2FA, isVerifying2FA, verify2FAError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    if (!email.includes('@')) {
      return 'Please include an \'@\' in the email address';
    }
    if (!email.includes('.')) {
      return 'Please include a valid domain in the email address';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password || password.trim() === '') {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  // Handle input changes with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error immediately when user starts typing
    if (touched.email) {
      const error = validateEmail(value);
      setEmailError(error);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error immediately when user starts typing
    if (touched.password) {
      const error = validatePassword(value);
      setPasswordError(error);
    }
  };

  // Handle input blur (mark as touched and validate)
  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const error = validateEmail(email);
    setEmailError(error);
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    const error = validatePassword(password);
    setPasswordError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors
    setError('');
    setEmailError('');
    setPasswordError('');
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate all fields
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);
    
    // If there are validation errors, don't submit
    if (emailValidation || passwordValidation) {
      return;
    }
    
    // Call login with email and password
    login(email, password);
  };

  // Handle 2FA verification - COMMENTED OUT: No 2FA APIs available yet
  // const handleVerify2FA = async (otpData: { otp: string; tempToken: string }): Promise<boolean> => {
  //   try {
  //     await verify2FA(otpData);
  //     setShow2FAModal(false);
  //     setLoginResponse(null);
  //     setIs2FAFlow(false);
  //     return true;
  //   } catch (error) {
  //     return false;
  //   }
  // };

  // Handle login response and errors
  React.useEffect(() => {
    if (loginError) {
      // Extract error message from different possible structures
      let errorMessage = 'An error occurred during login';
      
      // Debug: Log the error structure to help identify the issue
      console.log('Login error received:', loginError);
      
      // Check for ApiError structure from API client
      if (loginError && typeof loginError === 'object') {
        // ApiError from client.ts has message property
        if ('message' in loginError && loginError.message) {
          errorMessage = String(loginError.message);
        }
        // Check for nested error structures
        else if ('data' in loginError && loginError.data) {
          if (typeof loginError.data === 'string') {
            errorMessage = loginError.data;
          } else if (loginError.data && typeof loginError.data === 'object' && 'message' in loginError.data) {
            errorMessage = String(loginError.data.message);
          }
        }
        // Check for axios error response structure
        else if ('response' in loginError && loginError.response) {
          const response = (loginError as any).response;
          if (response.data?.message) {
            errorMessage = String(response.data.message);
          } else if (response.data?.data?.message) {
            errorMessage = String(response.data.data.message);
          } else if (response.statusText) {
            errorMessage = String(response.statusText);
          } else if (response.status) {
            errorMessage = `Request failed with status ${response.status}`;
          }
        }
        // Check for error string directly
        else if (typeof (loginError as any).error === 'string') {
          errorMessage = (loginError as any).error;
        }
      } else if (typeof loginError === 'string') {
        errorMessage = loginError;
      }
      
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
    } else {
      // Clear error when loginError is null/undefined
      setError('');
    }
  }, [loginError]);

  // Check for 2FA requirement - COMMENTED OUT: No 2FA APIs available yet
  // React.useEffect(() => {
  //   const tempToken = localStorage.getItem('tempToken');
  //   if (tempToken && !isLoggingIn && !isVerifying2FA) {
  //     setShow2FAModal(true);
  //     setIs2FAFlow(true);
  //   }
  // }, [isLoggingIn, isVerifying2FA]);



  // Don't show login form if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <LogoIcon size="xl" />
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent mb-2">
              Pinaypal
            </h1>

            <p className="text-sm text-muted-foreground mb-8">
              Redirecting to Dashboard...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-6">
            <LogoIcon size="xl" />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent mb-2">
            Pinaypal
          </h1>

          <p className="text-sm text-muted-foreground mb-8">
            Admin Panel Login
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-2 border-dashed border-border hover:border-brand-green/50 transition-colors">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <LayoutDashboard className="h-5 w-5" />
                Sign In
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && error.trim() !== '' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={`focus:ring-brand-green focus:border-brand-green ${
                      touched.email && emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {touched.email && emailError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-600">{emailError}</span>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      className={`focus:ring-brand-green focus:border-brand-green pr-10 ${
                        touched.password && passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {touched.password && passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-600">{passwordError}</span>
                    </motion.div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>

              <div className="pt-4">
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>© 2024 Pinaypal. All rights reserved.</p>
        </motion.div>
      </div>

      {/* Two-Factor Authentication Modal - COMMENTED OUT: No 2FA APIs available yet */}
      {/* <TwoFactorLoginModal
        isOpen={show2FAModal}
        onClose={() => {
          setShow2FAModal(false);
          setIs2FAFlow(false);
          // Clear temp token if user cancels
          localStorage.removeItem('tempToken');
        }}
        onVerify2FA={handleVerify2FA}
        verifying2FA={isVerifying2FA}
        userEmail={email}
      /> */}
    </div>
  );
};

export default Login; 