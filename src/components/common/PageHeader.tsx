import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const PageHeader = (props) => {
    const {
        page,
        heading,
        subHeading,
    } = props;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
                            {heading}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {subHeading}
                        </p>
                    </div>
                </div>
            </motion.div>
        </>
    )
};

export default PageHeader;