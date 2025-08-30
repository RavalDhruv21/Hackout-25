import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Trophy, Medal, Star, User } from "lucide-react";
import { authManager } from "@/lib/auth";
import { useState, useEffect } from "react";

export default function Leaderboard() {
  const [authState, setAuthState] = useState(authManager.getState());

  useEffect(() => {
    return authManager.subscribe(setAuthState);
  }, []);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
    select: (data) => data?.slice(0, 50) || [],
  });

  const getCurrentUserRank = () => {
    if (!authState.user) return null;
    const userIndex = leaderboard.findIndex((user: any) => user.id === authState.user!.id);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <Badge variant="default" className="text-lg font-bold px-3 py-1">
          #{rank}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-lg font-bold px-3 py-1">
        #{rank}
      </Badge>
    );
  };

  const currentUserRank = getCurrentUserRank();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="bg-accent text-accent-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 mr-4" />
            <h1 className="text-4xl font-bold" data-testid="text-leaderboard-title">
              Guardian Leaderboard
            </h1>
          </div>
          <p className="text-xl text-accent-foreground/80 max-w-2xl mx-auto">
            Celebrating our top contributors in the fight to protect mangrove ecosystems
          </p>
        </div>
      </section>

      {/* Current User Rank */}
      {authState.isAuthenticated && currentUserRank && (
        <section className="py-6 bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(currentUserRank)}
                    {getRankBadge(currentUserRank)}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {authState.user?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold" data-testid="text-user-name">
                      {authState.user?.username} (You)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {authState.user?.points} points • Level {authState.user?.level}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Your Rank</div>
                    <div className="text-2xl font-bold text-primary" data-testid="text-user-rank">
                      #{currentUserRank}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              
              {/* 2nd Place */}
              <div className="md:order-1 flex flex-col items-center">
                <Card className="w-full bg-gray-50 border-gray-300">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <Badge variant="secondary" className="text-lg font-bold px-4 py-2">
                        2nd Place
                      </Badge>
                    </div>
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarFallback className="text-xl">
                        {leaderboard[1]?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-2" data-testid="text-second-place">
                      {leaderboard[1]?.username}
                    </h3>
                    <p className="text-2xl font-bold text-gray-500" data-testid="text-second-points">
                      {leaderboard[1]?.points} pts
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {leaderboard[1]?.verifiedReports} verified reports
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 1st Place */}
              <div className="md:order-2 flex flex-col items-center">
                <Card className="w-full bg-yellow-50 border-yellow-300 transform scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <Crown className="h-20 w-20 text-yellow-500 mx-auto mb-2" />
                      <Badge className="text-lg font-bold px-4 py-2 bg-yellow-500 text-white">
                        1st Place
                      </Badge>
                    </div>
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarFallback className="text-2xl">
                        {leaderboard[0]?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-bold mb-2" data-testid="text-first-place">
                      {leaderboard[0]?.username}
                    </h3>
                    <p className="text-3xl font-bold text-yellow-600" data-testid="text-first-points">
                      {leaderboard[0]?.points} pts
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {leaderboard[0]?.verifiedReports} verified reports
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 3rd Place */}
              <div className="md:order-3 flex flex-col items-center">
                <Card className="w-full bg-amber-50 border-amber-300">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <Medal className="h-16 w-16 text-amber-600 mx-auto mb-2" />
                      <Badge variant="outline" className="text-lg font-bold px-4 py-2 border-amber-600 text-amber-600">
                        3rd Place
                      </Badge>
                    </div>
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarFallback className="text-xl">
                        {leaderboard[2]?.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-2" data-testid="text-third-place">
                      {leaderboard[2]?.username}
                    </h3>
                    <p className="text-2xl font-bold text-amber-600" data-testid="text-third-points">
                      {leaderboard[2]?.points} pts
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {leaderboard[2]?.verifiedReports} verified reports
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full Leaderboard */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">All Guardians</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((user: any, index: number) => {
                  const rank = index + 1;
                  const isCurrentUser = authState.user?.id === user.id;
                  
                  return (
                    <div 
                      key={user.id} 
                      className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                        isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                      }`}
                      data-testid={`leaderboard-item-${rank}`}
                    >
                      <div className="flex items-center space-x-3 w-20">
                        {getRankIcon(rank)}
                        <span className="text-lg font-bold text-muted-foreground">
                          #{rank}
                        </span>
                      </div>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {user.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {user.username}
                          {isCurrentUser && (
                            <Badge variant="outline" className="ml-2">You</Badge>
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{user.reportsSubmitted} reports</span>
                          <span>{user.verifiedReports} verified</span>
                          <span>{parseFloat(user.accuracy).toFixed(1)}% accuracy</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary" data-testid={`points-${rank}`}>
                          {user.points}
                        </div>
                        <div className="text-sm text-muted-foreground">points</div>
                      </div>
                      
                      <Badge variant="outline" className="ml-4">
                        Level {user.level}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              
              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No guardians yet
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to start protecting mangroves!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
