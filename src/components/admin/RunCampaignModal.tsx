import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, AlertCircle, Info } from "lucide-react";
import { Campaign, RunCampaignRequest } from "@/api/types";

interface RunCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onRun: (id: string, data?: RunCampaignRequest) => Promise<void>;
  loading?: boolean;
}

export function RunCampaignModal({
  open,
  onOpenChange,
  campaign,
  onRun,
  loading = false,
}: RunCampaignModalProps) {
  const [customEmails, setCustomEmails] = useState<string>("");
  const [useCustomEmails, setUseCustomEmails] = useState(false);

  const handleRun = async () => {
    if (!campaign) return;

    const data: RunCampaignRequest = {};
    
    if (useCustomEmails && customEmails.trim()) {
      // Parse custom emails (comma or newline separated)
      const emails = customEmails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));
      
      if (emails.length > 0) {
        data.customEmails = emails;
      }
    }

    await onRun(campaign._id, data);
    onOpenChange(false);
    
    // Reset form
    setCustomEmails("");
    setUseCustomEmails(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setCustomEmails("");
    setUseCustomEmails(false);
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Run Campaign
          </DialogTitle>
          <DialogDescription>
            Start the campaign immediately. You can use all enquiry emails or specify custom emails.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Info */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Campaign Details</Label>
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{campaign.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Subject:</span>
                <span className="text-sm">{campaign.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Type:</span>
                <Badge variant="outline" className="text-xs">
                  {campaign.type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Recipients:</span>
                <span className="text-sm">{campaign.totalRecipients} emails</span>
              </div>
            </div>
          </div>

          {/* Email Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Email Options</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="useAllEmails"
                  name="emailOption"
                  checked={!useCustomEmails}
                  onChange={() => setUseCustomEmails(false)}
                  className="h-4 w-4"
                />
                <Label htmlFor="useAllEmails" className="text-sm">
                  Use all enquiry emails ({campaign.totalRecipients} recipients)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="useCustomEmails"
                  name="emailOption"
                  checked={useCustomEmails}
                  onChange={() => setUseCustomEmails(true)}
                  className="h-4 w-4"
                />
                <Label htmlFor="useCustomEmails" className="text-sm">
                  Use custom emails
                </Label>
              </div>
            </div>

            {useCustomEmails && (
              <div className="space-y-2">
                <Label htmlFor="customEmails" className="text-sm">
                  Custom Email Addresses
                </Label>
                <Textarea
                  id="customEmails"
                  placeholder="Enter email addresses separated by commas or new lines&#10;example@email.com, test@email.com"
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Enter one email per line or separate with commas
                </p>
              </div>
            )}
          </div>

          {/* Warning */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This action will start the campaign immediately and begin sending emails. 
              Make sure your campaign content is ready before proceeding.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleRun} 
            disabled={loading || (useCustomEmails && !customEmails.trim())}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting Campaign...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Run Campaign Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 