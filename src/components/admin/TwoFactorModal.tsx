import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Shield, ShieldCheck, ShieldX, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetup2FA: () => Promise<boolean>;
  onEnable2FA: (data: { otp: string }) => Promise<boolean>;
  onDisable2FA: (data: { otp: string }) => Promise<boolean>;
  settingUp2FA: boolean;
  enabling2FA: boolean;
  disabling2FA: boolean;
  twoFactorEnabled: boolean;
}

export function TwoFactorModal({
  isOpen,
  onClose,
  onSetup2FA,
  onEnable2FA,
  onDisable2FA,
  settingUp2FA,
  enabling2FA,
  disabling2FA,
  twoFactorEnabled,
}: TwoFactorModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'setup' | 'enable' | 'disable' | 'request-otp' | 'success'>('setup');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (twoFactorEnabled) {
        // For disabled 2FA, we need to request OTP first
        setStep('request-otp');
      } else {
        setStep('setup');
      }
      setOtp('');
      setOtpError(null);
      setShowOtp(false);
    }
  }, [isOpen, twoFactorEnabled]);

  const handleSetup2FA = async () => {
    try {
      const success = await onSetup2FA();
      if (success) {
        if (twoFactorEnabled) {
          // For disabling 2FA, we should call disable2FA which will send OTP if needed
          // But first, let's go to disable step to enter OTP
          setStep('disable');
          toast({
            title: "OTP Sent",
            description: "Please check your email for the OTP to disable 2FA",
          });
        } else {
          // For enabling 2FA, go to enable step
          setStep('enable');
          toast({
            title: "OTP Sent",
            description: "Please check your email for the OTP to enable 2FA",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup 2FA';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEnable2FA = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const success = await onEnable2FA({ otp });
      if (success) {
        setStep('success');
        toast({
          title: "Success",
          description: "Two-factor authentication enabled successfully",
        });
        // Close modal after a short delay to show success message
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  const handleDisable2FA = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const success = await onDisable2FA({ otp });
      if (success) {
        setStep('success');
        toast({
          title: "Success",
          description: "Two-factor authentication disabled successfully",
        });
        // Close modal after a short delay to show success message
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (otpError) {
      setOtpError(null);
    }
  };

  const handleClose = () => {
    setStep(twoFactorEnabled ? 'request-otp' : 'setup');
    setOtp('');
    setOtpError(null);
    setShowOtp(false);
    onClose();
  };

  const getStepContent = () => {
    switch (step) {
      case 'setup':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Enable Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mt-2">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You'll receive a 6-digit code via email</li>
                <li>• Enter the code to verify your identity</li>
                <li>• 2FA will be required for future logins</li>
              </ul>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSetup2FA}
                disabled={settingUp2FA}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {settingUp2FA ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Setup 2FA
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        );

      case 'request-otp':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldX className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Disable Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mt-2">
                To disable 2FA, we need to verify your identity first. An OTP will be sent to your email.
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Warning:</h4>
              <p className="text-sm text-red-800">
                Disabling 2FA will reduce the security of your account. You'll only need your email and password to log in.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  // Use setup2FA to request OTP for disabling 2FA
                  // The backend setup2FA endpoint should send OTP for both enable and disable flows
                  await handleSetup2FA();
                }}
                disabled={settingUp2FA || disabling2FA}
                variant="destructive"
              >
                {(settingUp2FA || disabling2FA) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Requesting OTP...
                  </>
                ) : (
                  <>
                    <ShieldX className="h-4 w-4 mr-2" />
                    Request OTP
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        );

      case 'enable':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Enter Verification Code</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enter the 6-digit code sent to your email to enable two-factor authentication.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <Input
                  id="otp"
                  type={showOtp ? "text" : "password"}
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className={`text-center text-lg tracking-widest ${otpError ? "border-red-500 focus:border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowOtp(!showOtp)}
                >
                  {showOtp ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {otpError && (
                <p className="text-sm text-red-500 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {otpError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('setup')}>
                Back
              </Button>
              <Button 
                onClick={handleEnable2FA}
                disabled={enabling2FA || otp.length !== 6}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {enabling2FA ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        );

      case 'disable':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldX className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Disable Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enter the 6-digit code sent to your email to disable two-factor authentication.
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Warning:</h4>
              <p className="text-sm text-red-800">
                Disabling 2FA will reduce the security of your account. You'll only need your email and password to log in.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <Input
                  id="otp"
                  type={showOtp ? "text" : "password"}
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className={`text-center text-lg tracking-widest ${otpError ? "border-red-500 focus:border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowOtp(!showOtp)}
                >
                  {showOtp ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {otpError && (
                <p className="text-sm text-red-500 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {otpError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('request-otp')}>
                Back
              </Button>
              <Button 
                onClick={handleDisable2FA}
                disabled={disabling2FA || otp.length !== 6}
                variant="destructive"
              >
                {disabling2FA ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  <>
                    <ShieldX className="h-4 w-4 mr-2" />
                    Disable 2FA
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">
                {twoFactorEnabled ? '2FA Disabled Successfully!' : '2FA Enabled Successfully!'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {twoFactorEnabled 
                  ? 'Two-factor authentication has been disabled for your account.'
                  : 'Two-factor authentication has been enabled for your account. You will need to enter a verification code for future logins.'
                }
              </p>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={handleClose}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                Close
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              This modal will close automatically in 2 seconds...
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {step === 'setup' ? 'Setup Two-Factor Authentication' : 
             step === 'request-otp' ? 'Disable Two-Factor Authentication' :
             step === 'enable' ? 'Enable 2FA' : 
             step === 'disable' ? 'Disable 2FA' : 
             'Success'}
          </DialogTitle>
          <DialogDescription>
            {step === 'setup' && 'Add an extra layer of security to your account'}
            {step === 'request-otp' && 'Verify your identity to disable 2FA'}
            {step === 'enable' && 'Enter the verification code to enable 2FA'}
            {step === 'disable' && 'Enter the verification code to disable 2FA'}
            {step === 'success' && 'Two-factor authentication has been updated'}
          </DialogDescription>
        </DialogHeader>
        {getStepContent()}
      </DialogContent>
    </Dialog>
  );
} 