import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, LayoutDashboard, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogoIcon } from "@/components/ui/logo-icon";
import { TwoFactorLoginModal } from "@/components/auth/TwoFactorLoginModal";
import { Check6DigitPassword, CheckEmail } from '@/validations/validations';
import { useDispatch, useSelector } from "react-redux";
import { loginInfo } from '@/redux/features/authSlice';
import { RootState } from '@/redux/store/store';
import { LoginAPi } from '@/api/services/authApis/loginApi';
import { verify2FAApi } from '@/api/services/authApis/2faApi';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const { isAuthenticated, isLoggingIn, isVerifying2FA } = useSelector((state: RootState) => state?.auth);

  const [loginUser, setLoginUser] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAFlow, setIs2FAFlow] = useState(false);

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });


  // Check for 2FA requirement
  useEffect(() => {
    const tempToken = localStorage.getItem('tempToken');
    if (tempToken && !isLoggingIn && !isVerifying2FA) {
      setShow2FAModal(true);
      setIs2FAFlow(true);
    }
  }, [isLoggingIn, isVerifying2FA]);


  // Handle input changes with validation
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginUser({
      ...loginUser,
      [name]: value,
    });
  };


  // Handle input blur (mark as touched and validate)
  const blurHandler = (text: string) => {
    if (text?.toLocaleLowerCase() === "email") {
      setTouched(prev => ({ ...prev, email: true }));
      const error = CheckEmail(loginUser?.email);
      setEmailError(error);
    } else {
      setTouched(prev => ({ ...prev, password: true }));
      const error = Check6DigitPassword(loginUser?.password);
      setPasswordError(error);
    }
  };


  // Login Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailValidation = CheckEmail(loginUser?.email);
    const passwordValidation = Check6DigitPassword(loginUser?.password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    // If there are validation errors, don't submit
    if (emailValidation || passwordValidation) {
      return;
    };

    // Call Login API -
    try {
      const payload = {
        email: loginUser?.email,
        password: loginUser?.password,
      };

      // const res = await LoginAPi(payload as any);
      // console.log("Login_Ress",res)

      // Navigate to admin dashboard after successful 2FA verification
      navigate('/admin', { replace: true });

      // Now have a static data only for development
      dispatch(loginInfo({
        id: "1",
        username: "admin",
        email: "paypal@gmail.com",
        role: "Paypal_admin",
        profilePic: "/logo.svg",
        fullName: "Jai Dev",
        phone: "+91-9876543210",
        address: "Indore, India",
      }));

    } catch (error) {
      console.log("login_catch_err", error)
    }
  };


  // Handle 2FA verification
  const handleVerify2FA = async (otpData: { otp: string; tempToken: string }): Promise<boolean> => {
    try {
      await verify2FA(otpData);
      setShow2FAModal(false);
      setIs2FAFlow(false);
      return true;
    } catch (error) {
      return false;
    }
  };


  // Verify 2FA Handler
  const verify2FA = async (otpData: any) => {
    const payload = { otp: otpData };
    try {
      const res = await verify2FAApi(payload);
      if (res && res.data) {
        // Update user in cache
        console.log("verify2FA_res", res);

        // Navigate to admin dashboard after successful 2FA verification
        navigate('/admin', { replace: true });
      }
    } catch (error) {
      // Don't navigate on error - let the component handle it
      console.log("verify2FA_catch", error);
    }
  };


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
  };


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
              {error && (
                <Alert variant="destructive">
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
                    name="email"
                    value={loginUser?.email}
                    // onChange={handleEmailChange}
                    // onBlur={handleEmailBlur}
                    onChange={onChangeHandler}
                    onBlur={() => blurHandler("email")}
                    className={`focus:ring-brand-green focus:border-brand-green ${touched.email && emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
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
                      name="password"
                      value={loginUser?.password}
                      // onChange={handlePasswordChange}
                      // onBlur={handlePasswordBlur}
                      onChange={onChangeHandler}
                      onBlur={() => blurHandler("password")}
                      className={`focus:ring-brand-green focus:border-brand-green pr-10 ${touched.password && passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
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
                  forgot password
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

      {/* Two-Factor Authentication Modal */}
      <TwoFactorLoginModal
        isOpen={false}
        onClose={() => {
          setShow2FAModal(false);
          setIs2FAFlow(false);
          // Clear temp token if user cancels
          localStorage.removeItem('tempToken');
        }}
        onVerify2FA={handleVerify2FA}
        verifying2FA={isVerifying2FA}
        userEmail={loginUser?.email}
      />
    </div>
  );
};

export default Login; 