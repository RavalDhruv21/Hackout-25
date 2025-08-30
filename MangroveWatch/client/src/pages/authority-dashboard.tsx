import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ThreatMap from "@/components/threat-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Clock, Eye, MapPin, User } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AuthorityDashboard() {
  const { toast } = useToast();
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);

  const { data: allThreats = [] } = useQuery({
    queryKey: ["/api/threats"],
  });

  const { data: pendingThreats = [] } = useQuery({
    queryKey: ["/api/threats"],
    select: (data) => data?.filter((threat: any) => threat.status === "pending") || [],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const updateThreatMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await fetch(`/api/threats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update threat");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threats"] });
      toast({
        title: "Threat updated",
        description: "The threat status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update threat status.",
        variant: "destructive",
      });
    },
  });

  const handleThreatAction = (threatId: string, action: string) => {
    const updates: any = {};
    
    switch (action) {
      case "verify":
        updates.status = "verified";
        updates.verifiedAt = new Date().toISOString();
        break;
      case "reject":
        updates.status = "rejected";
        break;
      case "resolve":
        updates.status = "resolved";
        break;
      case "high-priority":
        updates.priority = "high";
        break;
    }

    updateThreatMutation.mutate({ id: threatId, updates });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "verified":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "resolved":
        return <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Authority Header */}
      <section className="bg-secondary text-secondary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-authority-title">
                Authority Dashboard
              </h1>
              <p className="text-secondary-foreground/80">
                Monitor and respond to mangrove threats
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-300" data-testid="text-pending-count">
                {pendingThreats.length}
              </div>
              <div className="text-sm text-secondary-foreground/80">Pending Review</div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <div>
                    <div className="text-2xl font-bold" data-testid="text-total-threats">
                      {allThreats.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Threats</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold" data-testid="text-pending-threats">
                      {pendingThreats.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending Review</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-accent" />
                  <div>
                    <div className="text-2xl font-bold" data-testid="text-verified-threats">
                      {allThreats.filter((t: any) => t.status === "verified").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Verified</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold" data-testid="text-active-reporters">
                      {dashboardStats?.activeGuardians || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Reporters</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending Review ({pendingThreats.length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              All Threats ({allThreats.length})
            </TabsTrigger>
            <TabsTrigger value="map" data-testid="tab-map">
              Threat Map
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                  Threats Requiring Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingThreats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-pending">
                    No threats pending review
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingThreats.map((threat: any) => (
                        <TableRow key={threat.id}>
                          <TableCell>
                            <Badge variant="outline">{threat.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{threat.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {threat.sector || `${threat.latitude}, ${threat.longitude}`}
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(threat.priority)}</TableCell>
                          <TableCell>{format(new Date(threat.createdAt), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedThreat(threat.id)}
                                data-testid={`button-view-${threat.id}`}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleThreatAction(threat.id, "verify")}
                                disabled={updateThreatMutation.isPending}
                                data-testid={`button-verify-${threat.id}`}
                              >
                                Verify
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleThreatAction(threat.id, "reject")}
                                disabled={updateThreatMutation.isPending}
                                data-testid={`button-reject-${threat.id}`}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Threat Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allThreats.map((threat: any) => (
                      <TableRow key={threat.id}>
                        <TableCell>
                          <Badge variant="outline">{threat.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{threat.title}</TableCell>
                        <TableCell>{getStatusBadge(threat.status)}</TableCell>
                        <TableCell>{getPriorityBadge(threat.priority)}</TableCell>
                        <TableCell>{format(new Date(threat.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedThreat(threat.id)}
                              data-testid={`button-view-all-${threat.id}`}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            {threat.status === "verified" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleThreatAction(threat.id, "resolve")}
                                disabled={updateThreatMutation.isPending}
                                data-testid={`button-resolve-${threat.id}`}
                              >
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="map">
            <ThreatMap showAllThreats />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
