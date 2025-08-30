import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
  };
  
  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    // Check for stored auth on initialization
    const storedUser = localStorage.getItem("mangrove_user");
    if (storedUser) {
      try {
        this.state.user = JSON.parse(storedUser);
        this.state.isAuthenticated = true;
      } catch (error) {
        localStorage.removeItem("mangrove_user");
      }
    }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState() {
    return this.state;
  }

  async login(email: string, password: string): Promise<User> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const { user } = await response.json();
    this.state.user = user;
    this.state.isAuthenticated = true;
    localStorage.setItem("mangrove_user", JSON.stringify(user));
    this.notify();
    return user;
  }

  async register(username: string, email: string, password: string, role: string = "user"): Promise<User> {
    const response = await fetch("/api/auth/register", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const { user } = await response.json();
    this.state.user = user;
    this.state.isAuthenticated = true;
    localStorage.setItem("mangrove_user", JSON.stringify(user));
    this.notify();
    return user;
  }

  logout() {
    this.state.user = null;
    this.state.isAuthenticated = false;
    localStorage.removeItem("mangrove_user");
    this.notify();
  }

  getCurrentUser() {
    return this.state.user;
  }

  isAuthenticated() {
    return this.state.isAuthenticated;
  }
}

export const authManager = new AuthManager();
