import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authManager } from "@/lib/auth";

export default function UserProgress() {
  const [authState, setAuthState] = useState(authManager.getState());

  useEffect(() => {
    return authManager.subscribe(setAuthState);
  }, []);

  const { data: userStats } = useQuery({
    queryKey: ["/api/users", authState.user?.id, "stats"],
    enabled: !!authState.user,
  });

  const user = authState.user;
  if (!user) return null;

  const progressPercentage = Math.min((user.points % 1000) / 1000 * 100, 100);
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <Card className="shadow-lg border border-border">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-xl font-bold text-card-foreground">
          Your Guardian Progress
        </CardTitle>
        <Badge variant="secondary" className="text-lg font-semibold" data-testid="badge-user-level">
          Level {user.level}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Ring */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 progress-ring" viewBox="0 0 120 120">
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="hsl(158, 30%, 85%)"
                strokeWidth="8"
                fill="none"
                className="dark:stroke-gray-700"
              />
              {/* Progress Circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="hsl(84, 81%, 44%)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="progress-ring-fill"
                data-testid="progress-circle"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent" data-testid="text-user-points">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Reports Submitted</span>
            <span className="font-semibold" data-testid="text-reports-submitted">
              {user.reportsSubmitted}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Verified Reports</span>
            <span className="font-semibold text-accent" data-testid="text-verified-reports">
              {user.verifiedReports}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Accuracy Rate</span>
            <span className="font-semibold text-accent" data-testid="text-accuracy-rate">
              {parseFloat(user.accuracy || "0").toFixed(1)}%
            </span>
          </div>
          {userStats && typeof userStats === 'object' && userStats !== null && 'totalThreats' in userStats && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Contributions</span>
              <span className="font-semibold" data-testid="text-total-contributions">
                {(userStats as any).totalThreats}
              </span>
            </div>
          )}
        </div>

        {/* Next Level Progress */}
        <div className="pt-3 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Level {user.level}</span>
            <span>Level {user.level + 1}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
              data-testid="progress-bar-level"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {1000 - (user.points % 1000)} points to next level
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
