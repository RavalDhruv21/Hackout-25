import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Leaf, Shield, Flag, Trophy } from "lucide-react";
import { authManager } from "@/lib/auth";
import { format } from "date-fns";

export default function Achievements() {
  const [authState, setAuthState] = useState(authManager.getState());

  useEffect(() => {
    return authManager.subscribe(setAuthState);
  }, []);

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["/api/users", authState.user?.id, "achievements"],
    enabled: !!authState.user,
  });

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "fas fa-flag":
        return <Flag className="h-5 w-5" />;
      case "fas fa-eye":
        return <Eye className="h-5 w-5" />;
      case "fas fa-shield-alt":
        return <Shield className="h-5 w-5" />;
      case "fas fa-users":
        return <Users className="h-5 w-5" />;
      case "fas fa-leaf":
        return <Leaf className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  const getAchievementColor = (points: number) => {
    if (points >= 1000) return "bg-accent text-accent-foreground";
    if (points >= 500) return "bg-secondary text-secondary-foreground";
    if (points >= 250) return "bg-primary text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  const recentAchievements = Array.isArray(userAchievements) ? userAchievements.slice(0, 3) : [];

  return (
    <Card className="shadow-lg border border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-accent" />
          Recent Achievements
        </CardTitle>
      </CardHeader>

      <CardContent>
        {recentAchievements.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Complete your first report to earn achievements!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAchievements.map((userAchievement: any) => {
              const achievement = userAchievement.achievement;
              if (!achievement) return null;

              return (
                <div
                  key={userAchievement.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border transition-all hover:shadow-md"
                  style={{
                    backgroundColor: `${getAchievementColor(achievement.points).includes('accent') ? 'hsl(84, 81%, 44%, 0.1)' : 
                      getAchievementColor(achievement.points).includes('secondary') ? 'hsl(215, 64%, 40%, 0.1)' : 
                      getAchievementColor(achievement.points).includes('primary') ? 'hsl(158, 68%, 15%, 0.1)' : 
                      'hsl(215, 16%, 47%, 0.1)'}`,
                    borderColor: `${getAchievementColor(achievement.points).includes('accent') ? 'hsl(84, 81%, 44%, 0.2)' : 
                      getAchievementColor(achievement.points).includes('secondary') ? 'hsl(215, 64%, 40%, 0.2)' : 
                      getAchievementColor(achievement.points).includes('primary') ? 'hsl(158, 68%, 15%, 0.2)' : 
                      'hsl(215, 16%, 47%, 0.2)'}`
                  }}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAchievementColor(achievement.points)}`}>
                    {getAchievementIcon(achievement.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-card-foreground" data-testid="achievement-name">
                      {achievement.name}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid="achievement-description">
                      {achievement.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1" data-testid="achievement-points">
                      +{achievement.points}
                    </Badge>
                    <div className="text-xs text-muted-foreground" data-testid="achievement-date">
                      {format(new Date(userAchievement.earnedAt), 'MMM dd')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {Array.isArray(userAchievements) && userAchievements.length > 3 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              +{userAchievements.length - 3} more achievements
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
