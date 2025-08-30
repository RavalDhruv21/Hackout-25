import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { authManager } from "@/lib/auth";
import { useWebSocket } from "@/hooks/use-websocket";
import LoginModal from "@/components/login-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Leaf, Menu, User, LogOut, Shield, Trophy, BarChart3 } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [authState, setAuthState] = useState(authManager.getState());
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { notifications, clearNotifications } = useWebSocket();

  useEffect(() => {
    return authManager.subscribe(setAuthState);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    authManager.logout();
    setShowMobileMenu(false);
  };

  const isActive = (path: string) => location === path;

  return (
    <>
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity" data-testid="link-home">
            <div className="bg-primary rounded-full p-2">
              <Leaf className="text-primary-foreground h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-primary">
              Mangrove Guardian
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {authState.isAuthenticated && (
              <>
                <Link 
                  href="/dashboard" 
                  className={`transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-primary font-semibold' 
                      : 'text-foreground hover:text-primary'
                  }`}
                  data-testid="link-dashboard"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/leaderboard" 
                  className={`transition-colors ${
                    isActive('/leaderboard') 
                      ? 'text-primary font-semibold' 
                      : 'text-foreground hover:text-primary'
                  }`}
                  data-testid="link-leaderboard"
                >
                  Leaderboard
                </Link>
                {authState.user?.role === 'authority' && (
                  <Link 
                    href="/authority" 
                    className={`transition-colors ${
                      isActive('/authority') 
                        ? 'text-primary font-semibold' 
                        : 'text-foreground hover:text-primary'
                    }`}
                    data-testid="link-authority"
                  >
                    Authority
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {authState.isAuthenticated ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative"
                      data-testid="button-notifications"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center pulse-notification"
                          data-testid="badge-notification-count"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Notifications</h3>
                        {notifications.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearNotifications}
                            data-testid="button-clear-notifications"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No new notifications
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {notifications.slice(0, 5).map((notification, index) => (
                            <div 
                              key={index} 
                              className="p-3 rounded-lg bg-muted/50 border"
                              data-testid={`notification-${index}`}
                            >
                              <h4 className="font-semibold text-sm">{notification.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {authState.user?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium">
                        {authState.user?.username}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="p-2">
                      <div className="text-sm font-medium">{authState.user?.username}</div>
                      <div className="text-xs text-muted-foreground">{authState.user?.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {authState.user?.points} points • Level {authState.user?.level}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center" data-testid="menu-dashboard">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/leaderboard" className="flex items-center" data-testid="menu-leaderboard">
                        <Trophy className="mr-2 h-4 w-4" />
                        Leaderboard
                      </Link>
                    </DropdownMenuItem>
                    {authState.user?.role === 'authority' && (
                      <DropdownMenuItem asChild>
                        <Link href="/authority" className="flex items-center" data-testid="menu-authority">
                          <Shield className="mr-2 h-4 w-4" />
                          Authority Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => setShowLoginModal(true)}
                data-testid="button-login"
              >
                <User className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            {authState.isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                  data-testid="mobile-dashboard"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/leaderboard" 
                  className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                  data-testid="mobile-leaderboard"
                >
                  Leaderboard
                </Link>
                {authState.user?.role === 'authority' && (
                  <Link 
                    href="/authority" 
                    className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                    data-testid="mobile-authority"
                  >
                    Authority Dashboard
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-4 py-2"
                  onClick={handleLogout}
                  data-testid="mobile-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-start px-4 py-2"
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowLoginModal(true);
                }}
                data-testid="mobile-login"
              >
                <User className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
    
    <LoginModal 
      open={showLoginModal} 
      onOpenChange={setShowLoginModal} 
    />
    </>
  );
}
