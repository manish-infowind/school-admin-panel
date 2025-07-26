import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { LogoIcon } from "@/components/ui/logo-icon";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-6">
            <LogoIcon size="xl" />
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent mb-4">
            MedoScopic Pharma
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Advanced Medical Technology & Pharmaceutical Solutions
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
                Admin Panel Access
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Welcome to the MedoScopic Pharma content management system.
                Access the admin panel to manage your website content, products,
                and pages.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link to={isAuthenticated ? "/admin" : "/login"} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80 text-white">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {isAuthenticated ? "Enter Admin Panel" : "Login to Admin Panel"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="flex-1 hover:bg-sidebar-accent"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  View Website
                </Button>
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
          <p>© 2024 MedoScopic Pharma. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
