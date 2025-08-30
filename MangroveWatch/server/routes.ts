import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertThreatSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, any>();
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          clients.set(data.userId, ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove client from map
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
    });
  });

  // Broadcast notification to user
  const notifyUser = (userId: string, notification: any) => {
    const client = clients.get(userId);
    if (client && client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({ type: 'notification', data: notification }));
    }
  };

  // Auth endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const threats = await storage.getThreats({ userId: req.params.id });
      const achievements = await storage.getUserAchievements(req.params.id);
      
      res.json({
        points: user.points,
        level: user.level,
        accuracy: parseFloat(user.accuracy),
        reportsSubmitted: user.reportsSubmitted,
        verifiedReports: user.verifiedReports,
        totalThreats: threats.length,
        recentAchievements: achievements.slice(0, 3)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await storage.getTopUsers(limit);
      
      const leaderboard = users.map(({ password, ...user }) => user);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Threat endpoints
  app.post("/api/threats", upload.array('photos', 5), async (req, res) => {
    try {
      const threatData = insertThreatSchema.parse({
        ...req.body,
        photos: (req.files as Express.Multer.File[])?.map(file => file.filename) || []
      });
      
      const threat = await storage.createThreat({
        ...threatData,
        userId: req.body.userId
      });
      
      // Simulate AI validation with random confidence
      const aiConfidence = Math.random() * 100;
      const status = aiConfidence > 70 ? "verified" : "pending";
      
      await storage.updateThreat(threat.id, {
        aiConfidence: aiConfidence.toFixed(2),
        status
      });
      
      // Notify authorities if high priority
      if (threat.priority === "high") {
        const authorities = await storage.getTopUsers(100); // Get authorities
        const authorityUsers = authorities.filter(u => u.role === "authority");
        
        for (const authority of authorityUsers) {
          const notification = await storage.createNotification({
            userId: authority.id,
            type: "alert",
            title: "High Priority Threat Reported",
            message: `New ${threat.type} threat reported in ${threat.sector}`,
            data: { threatId: threat.id }
          });
          notifyUser(authority.id, notification);
        }
      }
      
      res.json(threat);
    } catch (error) {
      console.error('Threat creation error:', error);
      res.status(400).json({ message: "Invalid threat data" });
    }
  });

  app.get("/api/threats", async (req, res) => {
    try {
      const { status, type, userId } = req.query as Record<string, string>;
      const threats = await storage.getThreats({ status, type, userId });
      res.json(threats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threats" });
    }
  });

  app.get("/api/threats/:id", async (req, res) => {
    try {
      const threat = await storage.getThreat(req.params.id);
      if (!threat) {
        return res.status(404).json({ message: "Threat not found" });
      }
      res.json(threat);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch threat" });
    }
  });

  app.patch("/api/threats/:id", async (req, res) => {
    try {
      const updates = req.body;
      const threat = await storage.updateThreat(req.params.id, updates);
      
      if (!threat) {
        return res.status(404).json({ message: "Threat not found" });
      }
      
      // Notify user if threat was verified
      if (updates.status === "verified") {
        const notification = await storage.createNotification({
          userId: threat.userId,
          type: "threat_verified",
          title: "Report Verified!",
          message: `Your ${threat.type} report has been verified by authorities`,
          data: { threatId: threat.id, points: 50 }
        });
        notifyUser(threat.userId, notification);
      }
      
      res.json(threat);
    } catch (error) {
      res.status(500).json({ message: "Failed to update threat" });
    }
  });

  app.get("/api/threats/nearby/:lat/:lng", async (req, res) => {
    try {
      const lat = parseFloat(req.params.lat);
      const lng = parseFloat(req.params.lng);
      const radius = parseFloat(req.query.radius as string) || 10; // Default 10km
      
      const threats = await storage.getThreatsInRadius(lat, lng, radius);
      res.json(threats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby threats" });
    }
  });

  // Achievement endpoints
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/users/:id/achievements", async (req, res) => {
    try {
      const userAchievements = await storage.getUserAchievements(req.params.id);
      const allAchievements = await storage.getAchievements();
      
      const achievementsWithDetails = userAchievements.map(ua => ({
        ...ua,
        achievement: allAchievements.find(a => a.id === ua.achievementId)
      }));
      
      res.json(achievementsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Notification endpoints
  app.get("/api/users/:id/notifications", async (req, res) => {
    try {
      const unreadOnly = req.query.unread === 'true';
      const notifications = await storage.getUserNotifications(req.params.id, unreadOnly);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const allThreats = await storage.getThreats();
      const allUsers = await storage.getTopUsers(1000);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const reportsToday = allThreats.filter(t => t.createdAt >= today).length;
      const activeGuardians = allUsers.filter(u => u.role === "user").length;
      const protectedArea = allThreats.filter(t => t.status === "resolved").length * 0.5; // Estimate
      
      res.json({
        reportsToday,
        activeGuardians,
        protectedArea: protectedArea.toFixed(1)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  return httpServer;
}
