import { motion } from "framer-motion";
import React from "react";

interface PageHeaderProps {
    heading: string;
    subHeading?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ heading, subHeading }) => {

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
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
                </div>
            </motion.div>
        </>
    )
};

export default PageHeader;