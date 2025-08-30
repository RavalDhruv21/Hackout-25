import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ThreatMap from "@/components/threat-map";
import UserProgress from "@/components/user-progress";
import Achievements from "@/components/achievements";
import RecentReports from "@/components/recent-reports";
import ReportModal from "@/components/report-modal";
import { authManager } from "@/lib/auth";
import { Camera, MapPin, Trophy, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [authState, setAuthState] = useState(authManager.getState());
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    return authManager.subscribe(setAuthState);
  }, []);

  const { data: userStats } = useQuery({
    queryKey: ["/api/users", authState.user?.id, "stats"],
    enabled: !!authState.user,
  });

  const { data: recentThreats } = useQuery({
    queryKey: ["/api/threats"],
    enabled: !!authState.user,
  });

  const user = authState.user;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Welcome Header */}
      <section className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
                Welcome back, {user.username}!
              </h1>
              <p className="text-primary-foreground/80">
                Continue protecting our mangrove ecosystems
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" data-testid="text-user-points">{user.points}</div>
              <div className="text-sm text-primary-foreground/80">Total Points</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-6 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-primary" data-testid="text-reports-submitted">
                    {userStats?.reportsSubmitted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Reports Submitted</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-accent" data-testid="text-verified-reports">
                    {userStats?.verifiedReports || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Verified Reports</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-secondary" data-testid="text-accuracy-rate">
                    {userStats?.accuracy?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-lg font-bold">
                    Level {user.level}
                  </Badge>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-6 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 transform hover:scale-105 h-16" 
              onClick={() => setShowReportModal(true)}
              data-testid="button-report-threat"
            >
              <Camera className="mr-2 h-5 w-5" />
              Report Threat
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transform hover:scale-105 h-16"
              data-testid="button-view-map"
            >
              <MapPin className="mr-2 h-5 w-5" />
              View Threat Map
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 transform hover:scale-105 h-16"
              data-testid="button-check-leaderboard"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Leaderboard
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-muted text-muted-foreground hover:bg-muted/90 transform hover:scale-105 h-16"
              data-testid="button-sms-report"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              SMS Report
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: User Progress & Achievements */}
          <div className="lg:col-span-1 space-y-6">
            <UserProgress />
            <Achievements />
          </div>
          
          {/* Right Column: Map & Reports */}
          <div className="lg:col-span-2 space-y-6">
            <ThreatMap />
            <RecentReports />
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          size="lg"
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 transform hover:scale-110 achievement-glow"
          onClick={() => setShowReportModal(true)}
          data-testid="button-floating-add"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <ReportModal open={showReportModal} onOpenChange={setShowReportModal} />
    </div>
  );
}
