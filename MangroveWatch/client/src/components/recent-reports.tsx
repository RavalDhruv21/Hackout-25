import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  MapPin, 
  User, 
  Share2,
  Heart,
  TreePine,
  Droplets,
  Building,
  Bird
} from "lucide-react";
import { format } from "date-fns";

export default function RecentReports() {
  const { data: threats = [] } = useQuery({
    queryKey: ["/api/threats"],
    select: (data) => Array.isArray(data) ? data.slice(0, 3) : [],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "verified":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            Rejected
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/5 border-destructive/20";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      case "low":
        return "bg-accent/5 border-accent/20";
      default:
        return "bg-muted/20 border-border";
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case "logging":
        return <TreePine className="h-5 w-5" />;
      case "pollution":
        return <Droplets className="h-5 w-5" />;
      case "development":
        return <Building className="h-5 w-5" />;
      case "wildlife":
        return <Bird className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getThreatIconColor = (type: string, priority: string) => {
    if (priority === "high") return "text-destructive-foreground bg-destructive";
    if (priority === "medium") return "text-white bg-yellow-500";
    
    switch (type) {
      case "logging":
        return "text-destructive-foreground bg-destructive";
      case "pollution":
        return "text-white bg-blue-500";
      case "development":
        return "text-white bg-orange-500";
      case "wildlife":
        return "text-accent-foreground bg-accent";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <Card className="shadow-lg border border-border">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-xl font-bold text-card-foreground">
          Recent Reports
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-accent hover:text-accent/80"
          data-testid="button-view-all-reports"
        >
          View All Reports
        </Button>
      </CardHeader>

      <CardContent>
        {threats.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No threat reports yet. Be the first to report!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {threats.map((threat: any) => (
              <div
                key={threat.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border ${getPriorityStyle(threat.priority)}`}
                data-testid={`report-${threat.id}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getThreatIconColor(threat.type, threat.priority)}`}>
                  {getThreatIcon(threat.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-card-foreground truncate" data-testid="threat-title">
                      {threat.title}
                    </h4>
                    {getStatusBadge(threat.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2" data-testid="threat-description">
                    {threat.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {threat.sector || `${parseFloat(threat.latitude).toFixed(2)}, ${parseFloat(threat.longitude).toFixed(2)}`}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(threat.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Reporter
                    </span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 flex-shrink-0">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-accent hover:text-accent/80 h-8 px-2"
                    data-testid={`button-view-${threat.id}`}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  
                  {threat.status === "verified" ? (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-primary hover:text-primary/80 h-8 px-2"
                      data-testid={`button-celebrate-${threat.id}`}
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Celebrate</span>
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-secondary hover:text-secondary/80 h-8 px-2"
                      data-testid={`button-alert-${threat.id}`}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Alert</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
