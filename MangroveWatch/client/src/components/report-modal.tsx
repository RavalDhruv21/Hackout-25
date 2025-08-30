import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertThreatSchema } from "@shared/schema";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, X, Upload } from "lucide-react";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportSchema = insertThreatSchema.extend({
  photos: z.array(z.any()).optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const { toast } = useToast();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "success" | "error">("loading");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: "",
      title: "",
      description: "",
      latitude: "",
      longitude: "",
      sector: "",
      photos: [],
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/threats", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        throw new Error("Failed to submit report");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threats"] });
      toast({
        title: "Report Submitted!",
        description: "Your threat report is being validated by AI.",
      });
      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);
      setLocation(null);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = () => {
    setLocationStatus("loading");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
          setLocationStatus("success");
          form.setValue("latitude", newLocation.lat.toString());
          form.setValue("longitude", newLocation.lng.toString());
        },
        (error) => {
          setLocationStatus("error");
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      setLocationStatus("error");
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      toast({
        title: "Too Many Files",
        description: "You can upload a maximum of 5 photos.",
        variant: "destructive",
      });
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ReportFormValues) => {
    const user = authManager.getCurrentUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a report.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("type", data.type);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("latitude", data.latitude);
    formData.append("longitude", data.longitude);
    formData.append("sector", data.sector || "");

    selectedFiles.forEach((file, index) => {
      formData.append("photos", file);
    });

    reportMutation.mutate(formData);
  };

  // Get location when modal opens
  useState(() => {
    if (open && !location) {
      getCurrentLocation();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-card-foreground">
            Report Threat
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Threat Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-card-foreground">
                    Threat Type
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-threat-type">
                        <SelectValue placeholder="Select threat type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="logging">Illegal Logging</SelectItem>
                      <SelectItem value="pollution">Water/Soil Pollution</SelectItem>
                      <SelectItem value="development">Unauthorized Development</SelectItem>
                      <SelectItem value="wildlife">Wildlife Disturbance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-card-foreground">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the threat"
                      {...field}
                      data-testid="input-threat-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            <div>
              <FormLabel className="text-sm font-semibold text-card-foreground mb-2 block">
                Photo Evidence
              </FormLabel>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Tap to take photo or upload
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                  data-testid="input-photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                  data-testid="button-upload-photo"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      data-testid={`selected-file-${index}`}
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        data-testid={`button-remove-file-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <FormLabel className="text-sm font-semibold text-card-foreground mb-2 block">
                Location
              </FormLabel>
              <div className="flex items-center space-x-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <MapPin className="h-4 w-4 text-accent" />
                {locationStatus === "loading" && (
                  <span className="text-sm text-card-foreground">Getting location...</span>
                )}
                {locationStatus === "success" && location && (
                  <span className="text-sm text-card-foreground">
                    Using current location ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                  </span>
                )}
                {locationStatus === "error" && (
                  <span className="text-sm text-destructive">Location unavailable</span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={getCurrentLocation}
                  className="ml-auto text-accent hover:text-accent/80"
                  data-testid="button-get-location"
                >
                  {locationStatus === "loading" ? "Getting..." : "Refresh"}
                </Button>
              </div>
            </div>

            {/* Manual Location */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Latitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.0000"
                        {...field}
                        data-testid="input-latitude"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Longitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.0000"
                        {...field}
                        data-testid="input-longitude"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sector */}
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-card-foreground">
                    Sector (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sector 7B, North Coast"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-sector"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-card-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you observed..."
                      rows={3}
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={reportMutation.isPending}
                className="flex-1"
                data-testid="button-submit-report"
              >
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
