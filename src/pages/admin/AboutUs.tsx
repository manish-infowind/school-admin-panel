import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Users,
  Award,
  Target,
  Heart,
  Building,
  Calendar,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface AboutSection {
  id: number;
  title: string;
  content: string;
  type: "mission" | "vision" | "values" | "team" | "history" | "awards";
  isActive: boolean;
  order: number;
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  email: string;
  linkedin: string;
  isActive: boolean;
}

const initialSections: AboutSection[] = [
  {
    id: 1,
    title: "Our Mission",
    content:
      "To revolutionize healthcare through innovative medical technology and pharmaceutical solutions that improve patient outcomes and enhance the quality of life for people worldwide.",
    type: "mission",
    isActive: true,
    order: 1,
  },
  {
    id: 2,
    title: "Our Vision",
    content:
      "To be the global leader in medical technology innovation, setting new standards for healthcare excellence and making advanced medical solutions accessible to all.",
    type: "vision",
    isActive: true,
    order: 2,
  },
  {
    id: 3,
    title: "Our Values",
    content:
      "Innovation, Excellence, Integrity, Compassion, and Collaboration guide everything we do. We believe in putting patients first and creating solutions that make a real difference.",
    type: "values",
    isActive: true,
    order: 3,
  },
  {
    id: 4,
    title: "Company History",
    content:
      "Founded in 2015, MedoScopic Pharma has grown from a startup to a leading medical technology company. Our journey has been marked by groundbreaking innovations and strategic partnerships with healthcare providers worldwide.",
    type: "history",
    isActive: true,
    order: 4,
  },
];

const initialTeam: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    position: "Chief Executive Officer",
    bio: "Dr. Johnson brings over 20 years of experience in medical technology and pharmaceutical development. She holds a PhD in Biomedical Engineering from Stanford University.",
    image: "/placeholder.svg",
    email: "sarah.johnson@medoscopic.com",
    linkedin: "linkedin.com/in/sarahjohnson",
    isActive: true,
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    position: "Chief Technology Officer",
    bio: "Dr. Chen is a renowned expert in medical device innovation with over 15 years of experience. He has led the development of several award-winning medical technologies.",
    image: "/placeholder.svg",
    email: "michael.chen@medoscopic.com",
    linkedin: "linkedin.com/in/michaelchen",
    isActive: true,
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    position: "Head of Research & Development",
    bio: "Dr. Rodriguez leads our R&D initiatives with a focus on next-generation diagnostic solutions. She has published over 50 research papers in leading medical journals.",
    image: "/placeholder.svg",
    email: "emily.rodriguez@medoscopic.com",
    linkedin: "linkedin.com/in/emilyrodriguez",
    isActive: true,
  },
];

export default function AboutUs() {
  const { toast } = useToast();
  const [sections, setSections] = useState(initialSections);
  const [team, setTeam] = useState(initialTeam);
  const [selectedSection, setSelectedSection] = useState<AboutSection | null>(
    null,
  );
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");

  const handleSaveSection = async (section: AboutSection) => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedSections = sections.map((s) =>
        s.id === section.id ? section : s,
      );
      setSections(updatedSections);

      toast({
        title: "Success!",
        description: `${section.title} updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTeamMember = async (member: TeamMember) => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedTeam = team.map((m) => (m.id === member.id ? member : m));
      setTeam(updatedTeam);

      toast({
        title: "Success!",
        description: `${member.name} updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save team member.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = (id: number) => {
    const section = sections.find((s) => s.id === id);
    if (section && window.confirm(`Delete "${section.title}"?`)) {
      setSections(sections.filter((s) => s.id !== id));
      if (selectedSection?.id === id) {
        setSelectedSection(null);
      }
      toast({
        title: "Deleted",
        description: `${section.title} deleted successfully.`,
      });
    }
  };

  const handleDeleteTeamMember = (id: number) => {
    const member = team.find((m) => m.id === id);
    if (member && window.confirm(`Remove ${member.name} from team?`)) {
      setTeam(team.filter((m) => m.id !== id));
      if (selectedMember?.id === id) {
        setSelectedMember(null);
      }
      toast({
        title: "Deleted",
        description: `${member.name} removed from team.`,
      });
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "mission":
        return Target;
      case "vision":
        return Eye;
      case "values":
        return Heart;
      case "team":
        return Users;
      case "history":
        return Calendar;
      case "awards":
        return Award;
      default:
        return Building;
    }
  };

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
              About Us Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your company information, mission, team, and history
            </p>
          </div>
          <Button className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80">
            <Eye className="h-4 w-4 mr-2" />
            Preview About Page
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections">About Sections</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="edit">Edit Content</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Sections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections.map((section, index) => {
                    const IconComponent = getIconForType(section.type);
                    return (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-sidebar-accent transition-colors"
                      >
                        <div className="h-12 w-12 bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-brand-green" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{section.title}</h3>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {section.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {section.type}
                            </Badge>
                            <Badge
                              variant={
                                section.isActive ? "default" : "secondary"
                              }
                              className={
                                section.isActive
                                  ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
                                  : ""
                              }
                            >
                              {section.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSection(section);
                              setActiveTab("edit");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSection(section.id)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </div>
                  <Button
                    onClick={() => {
                      const newMember: TeamMember = {
                        id: Date.now(),
                        name: "New Team Member",
                        position: "Position",
                        bio: "",
                        image: "/placeholder.svg",
                        email: "",
                        linkedin: "",
                        isActive: true,
                      };
                      setTeam([...team, newMember]);
                      setSelectedMember(newMember);
                      setActiveTab("edit");
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {team.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-sidebar-accent transition-colors"
                    >
                      <div className="text-center space-y-3">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-green/20 to-brand-teal/20 rounded-full flex items-center justify-center">
                          <Users className="h-10 w-10 text-brand-green" />
                        </div>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {member.position}
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Badge
                            variant={member.isActive ? "default" : "secondary"}
                            className={
                              member.isActive
                                ? "bg-gradient-to-r from-brand-green to-brand-teal text-white"
                                : ""
                            }
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMember(member);
                              setActiveTab("edit");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTeamMember(member.id)}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          {selectedSection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Edit Section: {selectedSection.title}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedSection.isActive}
                        onCheckedChange={(checked) =>
                          setSelectedSection({
                            ...selectedSection,
                            isActive: checked,
                          })
                        }
                      />
                      <Label>Active</Label>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sectionTitle">Section Title</Label>
                      <Input
                        id="sectionTitle"
                        value={selectedSection.title}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            title: e.target.value,
                          })
                        }
                        placeholder="Enter section title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sectionType">Section Type</Label>
                      <select
                        id="sectionType"
                        value={selectedSection.type}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            type: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="mission">Mission</option>
                        <option value="vision">Vision</option>
                        <option value="values">Values</option>
                        <option value="history">History</option>
                        <option value="awards">Awards</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sectionContent">Content</Label>
                    <Textarea
                      id="sectionContent"
                      value={selectedSection.content}
                      onChange={(e) =>
                        setSelectedSection({
                          ...selectedSection,
                          content: e.target.value,
                        })
                      }
                      placeholder="Enter section content"
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={() => handleSaveSection(selectedSection)}
                    disabled={saving}
                    className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Section
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {selectedMember && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Edit Team Member: {selectedMember.name}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedMember.isActive}
                        onCheckedChange={(checked) =>
                          setSelectedMember({
                            ...selectedMember,
                            isActive: checked,
                          })
                        }
                      />
                      <Label>Active</Label>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="memberName">Full Name</Label>
                      <Input
                        id="memberName"
                        value={selectedMember.name}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberPosition">Position</Label>
                      <Input
                        id="memberPosition"
                        value={selectedMember.position}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            position: e.target.value,
                          })
                        }
                        placeholder="Enter position/title"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memberBio">Biography</Label>
                    <Textarea
                      id="memberBio"
                      value={selectedMember.bio}
                      onChange={(e) =>
                        setSelectedMember({
                          ...selectedMember,
                          bio: e.target.value,
                        })
                      }
                      placeholder="Enter biography"
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="memberEmail">Email</Label>
                      <Input
                        id="memberEmail"
                        type="email"
                        value={selectedMember.email}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberLinkedin">LinkedIn</Label>
                      <Input
                        id="memberLinkedin"
                        value={selectedMember.linkedin}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            linkedin: e.target.value,
                          })
                        }
                        placeholder="LinkedIn profile URL"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Profile Image</Label>
                    <ImageUpload
                      images={
                        selectedMember.image ? [selectedMember.image] : []
                      }
                      onImagesChange={(images) =>
                        setSelectedMember({
                          ...selectedMember,
                          image: images[0] || "/placeholder.svg",
                        })
                      }
                      maxImages={1}
                    />
                  </div>

                  <Button
                    onClick={() => handleSaveTeamMember(selectedMember)}
                    disabled={saving}
                    className="bg-gradient-to-r from-brand-green to-brand-teal hover:from-brand-green/80 hover:to-brand-teal/80"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Team Member
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!selectedSection && !selectedMember && (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Content Selected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Select a section or team member to edit their content.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => setActiveTab("sections")}
                    variant="outline"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    View Sections
                  </Button>
                  <Button
                    onClick={() => setActiveTab("team")}
                    variant="outline"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
