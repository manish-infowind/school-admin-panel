import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, RefreshCw, UserCheck, UserPlus, UserX } from "lucide-react";
import React from "react";

interface PageHeaderProps {
    page?: string;
    heading: string;
    subHeading?: string;
    fetchHandler?: () => void;
    isLoading?: boolean;
    openModal?: () => void;
    handleBack?: () => void;
    verification?: any;
    manualVerificationModal?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    page,
    heading,
    subHeading,
    fetchHandler,
    isLoading,
    openModal,
    handleBack,
    verification,
    manualVerificationModal,
}) => {

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Header Back Button */}
                        {page?.toLowerCase() === "flaggedusers" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}

                        {/* Heading & SubHeading */}
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
                                {heading}
                            </h1>
                            {subHeading && (
                                <p className="text-muted-foreground mt-2">
                                    {subHeading}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Additional Buttons for different Pages */}
                    {(page?.toLowerCase() === "faceverify" || page?.toLowerCase() === "pendingverify") && (
                        <Button variant="outline" onClick={fetchHandler} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    )}

                    {page?.toLowerCase() === "flaggedusers" && (
                        <div className="flex items-center gap-2">
                            {!verification?.user?.isFaceVerified && (
                                <Button
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={manualVerificationModal}
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Verify Manually
                                </Button>
                            )}
                            {verification?.user?.isFaceVerified && (
                                <Button
                                    variant="destructive"
                                    onClick={manualVerificationModal}
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    De-verify Manually
                                </Button>
                            )}
                        </div>
                    )}

                    {page?.toLowerCase() === "admin" && openModal && (
                        <Button className="bg-brand-green hover:bg-brand-green/90 text-white" onClick={openModal}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Admin
                        </Button>
                    )}

                    {page?.toLowerCase() === "roles" && openModal && (
                        <Button className="bg-brand-green hover:bg-brand-green/90 text-white" onClick={openModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Role
                        </Button>
                    )}

                    {(page?.toLowerCase() === "stages" || 
                      page?.toLowerCase() === "industries" || 
                      page?.toLowerCase() === "funding-ranges" || 
                      page?.toLowerCase() === "team-sizes") && openModal && (
                        <Button className="bg-brand-green hover:bg-brand-green/90 text-white" onClick={openModal}>
                            <Plus className="h-4 w-4 mr-2" />
                            {page?.toLowerCase() === "stages" && "Create Stage"}
                            {page?.toLowerCase() === "industries" && "Create Industry"}
                            {page?.toLowerCase() === "funding-ranges" && "Create Funding Range"}
                            {page?.toLowerCase() === "team-sizes" && "Create Team Size"}
                        </Button>
                    )}

                </div>
            </motion.div>
        </>
    )
};

export default PageHeader;