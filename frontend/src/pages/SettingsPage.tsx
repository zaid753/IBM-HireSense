import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Clock, Shield, Paintbrush } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { Trash2, Edit } from "lucide-react";

export function SettingsPage() {
  const { setAuth, user: authUser, token } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    }
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      const parts = user.full_name ? user.full_name.split(' ') : [];
      setFirstName(parts[0] || user.email?.split('@')[0] || "User");
      setLastName(parts.slice(1).join(' ') || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const res = await api.put('/auth/me', { full_name: fullName });
      // Update both React Query cache and local Auth Store
      queryClient.setQueryData(['auth', 'me'], res.data);
      if (token) setAuth(token, res.data);
      
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : "A";
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8 pb-8"
    >
      <div>
        <h1 className="text-3xl font-bold font-heading mb-2 text-white">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and application settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('profile')}
            className={`w-full justify-start transition-colors ${activeTab === 'profile' ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
          >
            <User className="w-4 h-4 mr-3" /> Profile
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('history')}
            className={`w-full justify-start transition-colors ${activeTab === 'history' ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
          >
            <Clock className="w-4 h-4 mr-3" /> History
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('appearance')}
            className={`w-full justify-start transition-colors ${activeTab === 'appearance' ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
          >
            <Paintbrush className="w-4 h-4 mr-3" /> Appearance
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('security')}
            className={`w-full justify-start transition-colors ${activeTab === 'security' ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
          >
            <Shield className="w-4 h-4 mr-3" /> Security
          </Button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card rounded-3xl p-6 relative overflow-hidden border-white/5"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                <h2 className="text-xl font-bold font-heading text-white mb-6">Profile Information</h2>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/20">
                      {initial}
                    </div>
                    <div>
                      <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 800K</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">First Name</label>
                      <Input 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-black/20 border-white/10 text-white focus-visible:ring-primary focus-visible:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Last Name</label>
                      <Input 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name" 
                        className="bg-black/20 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Email Address</label>
                    <Input 
                      defaultValue={user?.email || ""} 
                      type="email" 
                      disabled 
                      className="bg-black/40 border-white/5 text-muted-foreground opacity-70"
                    />
                  </div>
                  
                  <Button 
                    variant="gradient" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-shadow"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-card rounded-3xl p-6 relative overflow-hidden border-white/5"
              >
                <h2 className="text-xl font-bold font-heading text-white mb-6">Company Preferences</h2>
                
                <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Company Name</label>
                    <Input 
                      defaultValue={user?.company_name || "Acme Corp"} 
                      className="bg-black/20 border-white/10 text-white focus-visible:ring-primary focus-visible:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Default ATS Minimum Score threshold</label>
                    <Input 
                      defaultValue="70" 
                      type="number" 
                      className="bg-black/20 border-white/10 text-white focus-visible:ring-primary focus-visible:border-primary"
                    />
                  </div>
                  <Button variant="outline" onClick={() => alert("Company preferences updated")} className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
                    Update Preferences
                  </Button>
                </div>
              </motion.div>
            </>
          )}

          {activeTab === 'history' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-6 border-white/5"
            >
              <h2 className="text-xl font-bold font-heading text-white mb-6">Activity History</h2>
              <div className="space-y-4">
                {[
                  { id: 1, title: 'Parsed Resume for Frontend Engineer', date: 'Oct 24, 2023', status: 'Completed' },
                  { id: 2, title: 'Created Job: UI/UX Designer', date: 'Oct 23, 2023', status: 'Completed' },
                  { id: 3, title: 'Generated ATS Score for Sarah Jenkins', date: 'Oct 22, 2023', status: 'Completed' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                    <div>
                      <h3 className="text-white font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.date} • {item.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-white/5">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-white/5">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-6 border-white/5"
            >
              <h2 className="text-xl font-bold font-heading text-white mb-6">Appearance Settings</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Theme</label>
                  <select 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="w-full bg-black/20 border border-white/10 text-white rounded-xl p-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="system">System Default</option>
                    <option value="dark">Dark Mode</option>
                    <option value="light">Light Mode</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-6 border-white/5"
            >
              <h2 className="text-xl font-bold font-heading text-white mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Change Password</label>
                  <Input type="password" placeholder="Current password" className="bg-black/20 border-white/10 text-white mb-2" />
                  <Input type="password" placeholder="New password" className="bg-black/20 border-white/10 text-white mb-2" />
                  <Input type="password" placeholder="Confirm new password" className="bg-black/20 border-white/10 text-white mb-4" />
                  <Button variant="gradient">Update Password</Button>
                </div>
                <hr className="border-white/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" className="text-white border-white/20">Enable 2FA</Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
