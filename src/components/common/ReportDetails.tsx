import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Eye, Loader2, Mail, Phone, Reply, Star, User } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";


const ReportDetails = (props) => {
    const {
        isUpdating,
        isReplyDialogOpen,
        selectedReportData,
        getStatusBadge,
        formatDate,
        openReplyBoxHandler,
        closeReplyBoxHandler,
        handleReply,
        optionChangeHandler,
    } = props;

    const [replyMessage, setReplyMessage] = useState("");

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
        >
            <Card className="flex-1 flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Report Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    {selectedReportData ?
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-brand-green" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">
                                            {selectedReportData.fullName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedReportData.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status:</span>
                                        {getStatusBadge(selectedReportData.status)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Category:</span>
                                        <Badge variant="outline" className="capitalize">
                                            {selectedReportData.inquiryCategory}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">IP Address:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {selectedReportData.ipAddress}
                                        </span>
                                    </div>
                                </div>

                                {selectedReportData.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {selectedReportData.phone}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Submitted {formatDate(selectedReportData.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Subject</h4>
                                <p className="text-sm">
                                    {selectedReportData.subject}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Message</h4>
                                <div className="bg-muted p-3 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">
                                        {selectedReportData.message}
                                    </p>
                                </div>
                            </div>

                            {/* Replies Section */}
                            <div className="space-y-3">
                                <h4 className="font-medium">Replies</h4>
                                {selectedReportData?.replies && selectedReportData?.replies?.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedReportData?.replies.map((reply, index) => (
                                            <div key={reply?.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User className="h-3 w-3 text-blue-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-blue-900">
                                                            {reply.adminName}
                                                        </span>
                                                        <span className="text-xs text-blue-600">
                                                            {reply.adminEmail}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-blue-600">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(reply.repliedAt)}
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded border p-2">
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                                        {reply.replyMessage}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <Reply className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">No replies yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Send the first reply to this report</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Dialog
                                    open={isReplyDialogOpen}
                                    onOpenChange={openReplyBoxHandler}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Reply className="h-4 w-4 mr-2" />
                                            )}
                                            Reply
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Reply to {selectedReportData.fullName}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Your Reply
                                                </label>
                                                <Textarea
                                                    value={replyMessage}
                                                    onChange={(e) => setReplyMessage(e.target.value)}
                                                    placeholder="Type your reply here..."
                                                    rows={6}
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => (closeReplyBoxHandler(), setReplyMessage(""))}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={() => (handleReply(replyMessage), setReplyMessage(""))}
                                                    disabled={!replyMessage.trim() || isUpdating}
                                                    className="bg-brand-green hover:bg-brand-green/90 text-white"
                                                >
                                                    {isUpdating ? (
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Reply className="h-4 w-4 mr-2" />
                                                    )}
                                                    {isUpdating ? "Sending..." : "Send Reply"}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Button
                                    variant="outline"
                                    onClick={() => optionChangeHandler(selectedReportData?.id, "star")}
                                >
                                    <Star
                                        className={`h-4 w-4 ${selectedReportData.isStarred ? "text-yellow-500 fill-current" : ""}`}
                                    />
                                </Button>
                            </div>

                        </div>
                        :
                        <div className="text-center py-8">
                            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                No Enquiry Selected
                            </h3>
                            <p className="text-muted-foreground">
                                Select an enquiry from the list to view details and respond.
                            </p>
                        </div>
                    }
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ReportDetails;