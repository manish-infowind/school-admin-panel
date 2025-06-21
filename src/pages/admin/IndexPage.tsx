import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Edit3, Save, Eye, Settings, Layout } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    name: "Hero Section",
    description: "Main banner with company branding",
    status: "Active",
    lastModified: "2 hours ago",
  },
  {
    name: "About Section",
    description: "Company overview and mission",
    status: "Active",
    lastModified: "1 day ago",
  },
  {
    name: "Services Overview",
    description: "Brief overview of services offered",
    status: "Draft",
    lastModified: "3 days ago",
  },
  {
    name: "Contact Information",
    description: "Contact details and location",
    status: "Active",
    lastModified: "1 week ago",
  },
];

export default function IndexPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
              Index Page Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your homepage content and sections
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Page Sections */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Page Sections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.map((section, index) => (
                <motion.div
                  key={section.name}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="h-12 w-12 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-lg flex items-center justify-center">
                    <Home className="h-6 w-6 text-brand-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{section.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Modified {section.lastModified}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        section.status === "Active" ? "default" : "secondary"
                      }
                      className={
                        section.status === "Active"
                          ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
                          : ""
                      }
                    >
                      {section.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Page Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Homepage content management tools will be available here.
                </p>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-brand-green/10 to-brand-teal/10 text-brand-green"
                >
                  Feature in Development
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
