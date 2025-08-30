import { type User, type InsertUser, type Threat, type InsertThreat, type Achievement, type UserAchievement, type Notification, type InsertNotification } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getTopUsers(limit: number): Promise<User[]>;
  
  // Threat methods
  createThreat(threat: InsertThreat & { userId: string }): Promise<Threat>;
  getThreat(id: string): Promise<Threat | undefined>;
  getThreats(filters?: { status?: string; type?: string; userId?: string }): Promise<Threat[]>;
  updateThreat(id: string, updates: Partial<Threat>): Promise<Threat | undefined>;
  getThreatsInRadius(lat: number, lng: number, radiusKm: number): Promise<Threat[]>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  addUserAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private threats: Map<string, Threat> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    this.initializeAchievements();
    this.seedDummyData();
  }

  private initializeAchievements() {
    const achievements: Achievement[] = [
      {
        id: "1",
        name: "First Responder",
        description: "Submit your first threat report",
        icon: "fas fa-flag",
        points: 100,
        criteria: { reportsSubmitted: 1 }
      },
      {
        id: "2", 
        name: "Eagle Eye",
        description: "Report 5 verified threats",
        icon: "fas fa-eye",
        points: 250,
        criteria: { verifiedReports: 5 }
      },
      {
        id: "3",
        name: "Mangrove Hero",
        description: "Submit 50 verified reports",
        icon: "fas fa-shield-alt", 
        points: 1000,
        criteria: { verifiedReports: 50 }
      },
      {
        id: "4",
        name: "Community Builder", 
        description: "Maintain 90% accuracy rate",
        icon: "fas fa-users",
        points: 500,
        criteria: { accuracy: 90 }
      },
      {
        id: "5",
        name: "Forest Guardian",
        description: "Report illegal logging activities",
        icon: "fas fa-leaf",
        points: 300,
        criteria: { threatType: "logging", count: 10 }
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private async seedDummyData() {
    // Create dummy users
    const dummyUsers = [
      {
        id: "user-1",
        username: "EcoGuardian42",
        email: "eco.guardian@email.com",
        password: "password123",
        role: "user",
        points: 1250,
        level: 3,
        accuracy: "87.50",
        reportsSubmitted: 8,
        verifiedReports: 7,
        profilePicture: null,
        location: "Sundarbans, Bangladesh",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        id: "user-2", 
        username: "MangroveHero",
        email: "mangrove.hero@email.com",
        password: "password123",
        role: "user",
        points: 2100,
        level: 4,
        accuracy: "92.30",
        reportsSubmitted: 13,
        verifiedReports: 12,
        profilePicture: null,
        location: "Everglades, Florida",
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        id: "user-3",
        username: "CoastalWatcher",
        email: "coastal.watcher@email.com", 
        password: "password123",
        role: "user",
        points: 850,
        level: 2,
        accuracy: "75.00",
        reportsSubmitted: 4,
        verifiedReports: 3,
        profilePicture: null,
        location: "Kakadu, Australia",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: "authority-1",
        username: "Dr.ForestExpert",
        email: "dr.expert@authority.gov",
        password: "password123",
        role: "authority", 
        points: 500,
        level: 1,
        accuracy: "100.00",
        reportsSubmitted: 0,
        verifiedReports: 0,
        profilePicture: null,
        location: "Environmental Protection Agency",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        id: "authority-2",
        username: "ConservationOfficer",
        email: "officer@conservation.org",
        password: "password123",
        role: "authority",
        points: 300, 
        level: 1,
        accuracy: "100.00",
        reportsSubmitted: 0,
        verifiedReports: 0,
        profilePicture: null,
        location: "Wildlife Conservation Society",
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      }
    ];

    dummyUsers.forEach(user => {
      this.users.set(user.id, user as User);
    });

    // Create dummy threats
    const dummyThreats = [
      {
        id: "threat-1",
        userId: "user-1",
        type: "logging",
        title: "Illegal Logging Activity Detected",
        description: "Large machinery spotted clearing mangrove forest along the coastal area. Multiple trees have been cut down without proper permits.",
        latitude: "22.3569",
        longitude: "89.0423",
        photos: ["logging_photo_1.jpg", "logging_photo_2.jpg"],
        status: "verified",
        priority: "high",
        verifiedBy: "authority-1",
        verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        aiConfidence: "89.50",
        sector: "Sector 7B",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: "threat-2", 
        userId: "user-2",
        type: "pollution",
        title: "Industrial Waste Discharge",
        description: "Factory pipes dumping untreated chemicals into mangrove waterways. Water appears discolored and fish are dying.",
        latitude: "25.7617",
        longitude: "-80.1918",
        photos: ["pollution_photo_1.jpg"],
        status: "verified",
        priority: "high",
        verifiedBy: "authority-2",
        verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        aiConfidence: "94.20",
        sector: "Everglades Zone A",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: "threat-3",
        userId: "user-1",
        type: "development",
        title: "Unauthorized Construction Project",
        description: "New hotel development started without environmental impact assessment. Heavy machinery destroying root systems.",
        latitude: "22.3000",
        longitude: "89.1000", 
        photos: ["development_photo_1.jpg", "development_photo_2.jpg", "development_photo_3.jpg"],
        status: "pending",
        priority: "medium",
        verifiedBy: null,
        verifiedAt: null,
        aiConfidence: "76.80",
        sector: "Sector 12C",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: "threat-4",
        userId: "user-3",
        type: "wildlife",
        title: "Endangered Bird Species Disturbance",
        description: "Tour boats getting too close to nesting areas of saltwater crocodiles and disrupting breeding patterns.",
        latitude: "-12.4634",
        longitude: "132.8408",
        photos: ["wildlife_photo_1.jpg"],
        status: "verified",
        priority: "medium", 
        verifiedBy: "authority-1",
        verifiedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        aiConfidence: "82.10",
        sector: "Kakadu Zone 3",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        id: "threat-5",
        userId: "user-2",
        type: "other",
        title: "Plastic Waste Accumulation",
        description: "Large amounts of plastic debris washed up in mangrove roots, blocking waterflow and harming marine life.",
        latitude: "25.7000",
        longitude: "-80.2000",
        photos: ["waste_photo_1.jpg", "waste_photo_2.jpg"],
        status: "pending",
        priority: "low",
        verifiedBy: null,
        verifiedAt: null,
        aiConfidence: "68.30",
        sector: "Everglades Zone B",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    dummyThreats.forEach(threat => {
      this.threats.set(threat.id, threat as Threat);
    });

    // Create dummy user achievements
    const dummyAchievements = [
      {
        id: "ua-1",
        userId: "user-1",
        achievementId: "1", // First Responder
        earnedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ua-2",
        userId: "user-1", 
        achievementId: "2", // Eagle Eye
        earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ua-3",
        userId: "user-2",
        achievementId: "1", // First Responder
        earnedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ua-4",
        userId: "user-2",
        achievementId: "2", // Eagle Eye  
        earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ua-5",
        userId: "user-2",
        achievementId: "4", // Community Builder
        earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: "ua-6",
        userId: "user-3",
        achievementId: "1", // First Responder
        earnedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      }
    ];

    dummyAchievements.forEach(achievement => {
      this.userAchievements.set(achievement.id, achievement as UserAchievement);
    });

    // Create dummy notifications
    const dummyNotifications = [
      {
        id: "notif-1",
        userId: "user-1",
        type: "threat_verified",
        title: "Report Verified!",
        message: "Your logging threat report has been verified by authorities. You earned 50 points!",
        data: { threatId: "threat-1", points: 50 },
        read: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: "notif-2",
        userId: "user-2",
        type: "achievement",
        title: "Achievement Unlocked!",
        message: "Congratulations! You've earned the 'Community Builder' achievement for maintaining 90% accuracy.",
        data: { achievementId: "4", points: 500 },
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: "notif-3",
        userId: "authority-1",
        type: "alert",
        title: "High Priority Threat Reported",
        message: "New logging threat reported in Sector 7B",
        data: { threatId: "threat-1" },
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: "notif-4",
        userId: "user-3",
        type: "threat_verified", 
        title: "Report Verified!",
        message: "Your wildlife threat report has been verified. Keep up the great work!",
        data: { threatId: "threat-4", points: 50 },
        read: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    dummyNotifications.forEach(notification => {
      this.notifications.set(notification.id, notification as Notification);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      points: 0,
      level: 1,
      accuracy: "0.00",
      reportsSubmitted: 0,
      verifiedReports: 0,
      profilePicture: null,
      location: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTopUsers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  }

  async createThreat(threat: InsertThreat & { userId: string }): Promise<Threat> {
    const id = randomUUID();
    const newThreat: Threat = {
      ...threat,
      id,
      status: "pending",
      priority: "medium",
      verifiedBy: null,
      verifiedAt: null,
      aiConfidence: null,
      createdAt: new Date(),
    };
    this.threats.set(id, newThreat);
    
    // Update user stats
    const user = this.users.get(threat.userId);
    if (user) {
      await this.updateUser(user.id, {
        reportsSubmitted: user.reportsSubmitted + 1
      });
    }
    
    return newThreat;
  }

  async getThreat(id: string): Promise<Threat | undefined> {
    return this.threats.get(id);
  }

  async getThreats(filters?: { status?: string; type?: string; userId?: string }): Promise<Threat[]> {
    let threats = Array.from(this.threats.values());
    
    if (filters?.status) {
      threats = threats.filter(t => t.status === filters.status);
    }
    if (filters?.type) {
      threats = threats.filter(t => t.type === filters.type);
    }
    if (filters?.userId) {
      threats = threats.filter(t => t.userId === filters.userId);
    }
    
    return threats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateThreat(id: string, updates: Partial<Threat>): Promise<Threat | undefined> {
    const threat = this.threats.get(id);
    if (!threat) return undefined;
    
    const updatedThreat = { ...threat, ...updates };
    this.threats.set(id, updatedThreat);
    
    // If threat was verified, update user stats
    if (updates.status === "verified" && threat.status !== "verified") {
      const user = this.users.get(threat.userId);
      if (user) {
        const newVerifiedCount = user.verifiedReports + 1;
        const newAccuracy = (newVerifiedCount / user.reportsSubmitted) * 100;
        await this.updateUser(user.id, {
          verifiedReports: newVerifiedCount,
          accuracy: newAccuracy.toFixed(2),
          points: user.points + 50 // Base points for verified report
        });
      }
    }
    
    return updatedThreat;
  }

  async getThreatsInRadius(lat: number, lng: number, radiusKm: number): Promise<Threat[]> {
    return Array.from(this.threats.values()).filter(threat => {
      const distance = this.calculateDistance(
        lat, lng,
        parseFloat(threat.latitude), parseFloat(threat.longitude)
      );
      return distance <= radiusKm;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId)
      .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime());
  }

  async addUserAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const id = randomUUID();
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      earnedAt: new Date(),
    };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);
    
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, read: true });
    }
  }
}

export const storage = new MemStorage();
