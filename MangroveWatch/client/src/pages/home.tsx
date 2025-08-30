import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ReportModal from "@/components/report-modal";
import ThreatMap from "@/components/threat-map";
import UserProgress from "@/components/user-progress";
import Achievements from "@/components/achievements";
import RecentReports from "@/components/recent-reports";
import LoginModal from "@/components/login-modal";
import { authManager } from "@/lib/auth";
import { Camera, MapPin, Trophy, MessageSquare, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [authState, setAuthState] = useState(authManager.getState());
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    return authManager.subscribe(setAuthState);
  }, []);

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: true,
  });

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Hero Section */}
        <section className="hero-gradient py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6">
                  Community <span className="text-accent">Mangrove</span> Watch
                </h1>
                <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                  Empowering coastal communities to protect vital mangrove ecosystems through participatory monitoring, AI validation, and gamified engagement.
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent" data-testid="text-reports-today">
                      {stats && typeof stats === 'object' && 'reportsToday' in stats ? (stats as any).reportsToday : 0}
                    </div>
                    <div className="text-sm text-primary-foreground/80">Reports Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent" data-testid="text-active-guardians">
                      {stats && typeof stats === 'object' && 'activeGuardians' in stats ? (stats as any).activeGuardians : 0}
                    </div>
                    <div className="text-sm text-primary-foreground/80">Active Guardians</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent" data-testid="text-protected-area">
                      {stats && typeof stats === 'object' && 'protectedArea' in stats ? (stats as any).protectedArea : 0}k
                    </div>
                    <div className="text-sm text-primary-foreground/80">Hectares Protected</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-accent text-accent-foreground hover:bg-accent/90 transform hover:scale-105" 
                    onClick={() => setShowLoginModal(true)}
                    data-testid="button-get-started"
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30" 
                    onClick={() => {
                      // Scroll to features section
                      const featuresSection = document.querySelector('#features-section');
                      if (featuresSection) {
                        featuresSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    data-testid="button-learn-more"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Learn More
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Leaf className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">Protecting Our Mangroves</h3>
                    <p className="text-muted-foreground">Community-driven conservation for coastal ecosystems</p>
                  </div>
                </div>
                
                {/* Floating Achievement Badge */}
                <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-xl achievement-glow">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                      <Trophy className="text-accent-foreground h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-card-foreground">Mangrove Hero</div>
                      <div className="text-sm text-muted-foreground">Join our community</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="py-16 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-card-foreground mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our platform combines community reporting, AI validation, and gamification to create a powerful conservation tool.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Report Threats</h3>
                  <p className="text-muted-foreground">Easily report threats with photos and GPS location using our mobile-friendly interface.</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI Validation</h3>
                  <p className="text-muted-foreground">Reports are automatically validated using AI and satellite imagery for accuracy.</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
                  <p className="text-muted-foreground">Gain points, badges, and recognition for your contributions to conservation.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Quick Actions Bar */}
      <section className="bg-card border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 transform hover:scale-105" 
              onClick={() => setShowReportModal(true)}
              data-testid="button-quick-report"
            >
              <Camera className="mr-2 h-4 w-4" />
              Quick Report
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transform hover:scale-105"
              data-testid="button-threat-map"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Threat Map
            </Button>
            
            <Link href="/leaderboard">
              <Button 
                variant="outline" 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transform hover:scale-105"
                data-testid="button-leaderboard"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="bg-muted text-card hover:bg-muted/90 transform hover:scale-105"
              data-testid="button-sms-report"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              SMS Report
            </Button>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: User Stats & Gamification */}
          <div className="lg:col-span-1 space-y-6">
            <UserProgress />
            <Achievements />
          </div>
          
          {/* Right Column: Interactive Map & Reports */}
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
          data-testid="button-floating-report"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>

      <ReportModal open={showReportModal} onOpenChange={setShowReportModal} />
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
