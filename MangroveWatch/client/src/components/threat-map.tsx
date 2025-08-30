import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Minus, Navigation } from "lucide-react";

interface ThreatMapProps {
  showAllThreats?: boolean;
}

export default function ThreatMap({ showAllThreats = false }: ThreatMapProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: threats = [] } = useQuery({
    queryKey: ["/api/threats"],
    select: (data) => {
      if (!showAllThreats) {
        // Limit to recent threats for user dashboard
        return data?.slice(0, 10) || [];
      }
      return data || [];
    },
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, []);

  const filteredThreats = threats.filter((threat: any) => {
    if (activeFilter === "all") return true;
    return threat.type === activeFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "hsl(0, 65%, 51%)"; // destructive
      case "medium":
        return "hsl(45, 93%, 47%)"; // yellow
      case "low":
        return "hsl(84, 81%, 44%)"; // accent
      default:
        return "hsl(215, 16%, 47%)"; // muted
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "logging":
        return "🌲";
      case "pollution":
        return "💧";
      case "development":
        return "🏗️";
      case "wildlife":
        return "🐦";
      default:
        return "⚠️";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">
            Live Threat Map
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={activeFilter === "all" ? "default" : "outline"}
              onClick={() => setActiveFilter("all")}
              data-testid="filter-all"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "logging" ? "default" : "outline"}
              onClick={() => setActiveFilter("logging")}
              data-testid="filter-logging"
            >
              Logging
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "pollution" ? "default" : "outline"}
              onClick={() => setActiveFilter("pollution")}
              data-testid="filter-pollution"
            >
              Pollution
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "development" ? "default" : "outline"}
              onClick={() => setActiveFilter("development")}
              data-testid="filter-development"
            >
              Development
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-96 map-container relative overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20">
            {/* Simulated Coastline */}
            <svg className="w-full h-full" viewBox="0 0 400 300">
              {/* Water/Ocean */}
              <rect x="0" y="0" width="400" height="160" fill="hsl(215, 64%, 40%, 0.2)" />
              
              {/* Coastline */}
              <path
                d="M0 150 Q100 120 200 140 T400 160 L400 300 L0 300 Z"
                fill="hsl(158, 68%, 15%, 0.1)"
                stroke="hsl(158, 68%, 15%)"
                strokeWidth="2"
              />

              {/* Mangrove Areas */}
              <circle cx="80" cy="180" r="25" fill="hsl(158, 68%, 15%, 0.3)" />
              <circle cx="180" cy="190" r="35" fill="hsl(158, 68%, 15%, 0.3)" />
              <circle cx="320" cy="200" r="30" fill="hsl(158, 68%, 15%, 0.3)" />

              {/* Threat Markers */}
              {filteredThreats.map((threat: any, index: number) => {
                const x = 50 + (index * 60) % 300;
                const y = 140 + (index * 30) % 120;
                const radius = threat.priority === "high" ? 10 : threat.priority === "medium" ? 8 : 6;

                return (
                  <g key={threat.id} data-testid={`threat-marker-${threat.id}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={getPriorityColor(threat.priority)}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <text
                      x={x}
                      y={y + 2}
                      textAnchor="middle"
                      fontSize="8"
                      fill="white"
                    >
                      {getTypeIcon(threat.type)}
                    </text>
                  </g>
                );
              })}

              {/* User Location */}
              {userLocation && (
                <circle
                  cx="200"
                  cy="180"
                  r="8"
                  fill="hsl(84, 81%, 44%)"
                  stroke="white"
                  strokeWidth="3"
                  className="animate-pulse"
                  data-testid="user-location"
                />
              )}
            </svg>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button size="sm" variant="outline" className="w-10 h-10 p-0" data-testid="button-zoom-in">
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="w-10 h-10 p-0" data-testid="button-zoom-out">
                <Minus className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="w-10 h-10 p-0" data-testid="button-center-location">
                <Navigation className="h-4 w-4" />
              </Button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card rounded-lg p-3 shadow-lg border border-border">
              <div className="text-sm font-semibold text-card-foreground mb-2">Threat Level</div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Low</span>
                </div>
              </div>
            </div>

            {/* Threat Count */}
            <div className="absolute top-4 left-4 bg-card rounded-lg p-3 shadow-lg border border-border">
              <div className="text-sm text-muted-foreground">Active Threats</div>
              <div className="text-2xl font-bold text-card-foreground" data-testid="text-threat-count">
                {filteredThreats.length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
