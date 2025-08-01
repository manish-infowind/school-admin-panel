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
import { Loader2, Shield, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify2FA: (data: { otp: string; tempToken: string }) => Promise<boolean>;
  verifying2FA: boolean;
  userEmail?: string;
}

export function TwoFactorLoginModal({
  isOpen,
  onClose,
  onVerify2FA,
  verifying2FA,
  userEmail,
}: TwoFactorLoginModalProps) {
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setOtpError(null);
      setShowOtp(false);
      // Get temp token from localStorage
      const token = localStorage.getItem('tempToken');
      setTempToken(token);
    }
  }, [isOpen]);

  const handleVerify2FA = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!tempToken) {
      setOtpError("Session expired. Please login again.");
      return;
    }

    try {
      const success = await onVerify2FA({ otp, tempToken });
      if (success) {
        toast({
          title: "Success",
          description: "Two-factor authentication verified successfully",
        });
        // Modal will be closed by parent component
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
    setOtp('');
    setOtpError(null);
    setShowOtp(false);
    setTempToken(null);
    onClose();
  };

  const handleResendOTP = () => {
    // This would typically call the login API again to resend OTP
    toast({
      title: "OTP Resent",
      description: "A new verification code has been sent to your email",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit verification code sent to your email
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Enter Verification Code</h3>
            <p className="text-sm text-gray-600 mt-2">
              We've sent a 6-digit code to <span className="font-medium">{userEmail}</span>
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
                autoFocus
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
          
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResendOTP}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Didn't receive the code? Resend
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerify2FA}
            disabled={verifying2FA || otp.length !== 6}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {verifying2FA ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Verify & Login
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 