import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import AuthorityDashboard from "@/pages/authority-dashboard";
import Leaderboard from "@/pages/leaderboard";
import { authManager } from "@/lib/auth";
import { useState, useEffect } from "react";

function ProtectedRoute({ component: Component, requireAuth = true, requireRole }: { 
  component: React.ComponentType; 
  requireAuth?: boolean;
  requireRole?: string;
}) {
  const [authState, setAuthState] = useState(authManager.getState());
  
  useEffect(() => {
    return authManager.subscribe(setAuthState);
  }, []);

  if (requireAuth && !authState.isAuthenticated) {
    return <Home />;
  }

  if (requireRole && authState.user?.role !== requireRole) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    </div>;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Home} requireAuth={false} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/authority" component={() => <ProtectedRoute component={AuthorityDashboard} requireRole="authority" />} />
      <Route path="/leaderboard" component={() => <ProtectedRoute component={Leaderboard} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
