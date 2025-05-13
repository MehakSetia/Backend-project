import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface User extends Omit<SelectUser, 'password'> {}
  }
}

const scryptAsync = promisify(scrypt);

// Role types
export type UserRole = "admin" | "traveler" | "host";

// Role-based middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(req.user!.role as UserRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, (user as any).password))) {
          return done(null, false, { message: "Invalid email or password" });
        }
        console.log("User found for login:", user);
        console.log("User password:", (user as any).password);
        const { password: _, ...userWithoutPassword } = (user as any).toObject();
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as any).id || (user as any)._id);
  });

  passport.deserializeUser(async (id: number | string, done) => {
    try {
      let user = null;
      if (typeof id === "number") {
        user = await storage.getUser(id);
      } else if (!isNaN(Number(id))) {
        // If id is a string that can be converted to a number, try that
        user = await storage.getUser(Number(id));
      }
      if (!user) {
        // Fallback: try to find by MongoDB _id
        const UserModel = (storage as any).User || require("mongoose").model("User");
        user = await UserModel.findById(id);
      }
      if (!user) {
        return done(new Error("User not found"));
      }
      const { password: _, ...userWithoutPassword } = (user as any).toObject();
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { name, email, password, role = "traveler" } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (!["admin", "traveler", "host"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const user = await storage.createUser({
        name,
        email,
        password: await hashPassword(password),
        role
      });
      console.log("User created:", user);

      const { password: _, ...userWithoutPassword } = (user as any).toObject();

      req.login(userWithoutPassword, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string }) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", isAuthenticated, (req, res) => {
    res.json(req.user);
  });
}

const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date,
});
