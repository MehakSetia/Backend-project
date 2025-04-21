import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole, UserRole } from "./auth";
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, "data");
const USERS_FILE = join(DATA_DIR, "users.json");
const BOOKINGS_FILE = join(DATA_DIR, "bookings.json");
const POSTS_FILE = join(DATA_DIR, "posts.json");
const PACKAGES_FILE = join(DATA_DIR, "packages.json");

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Bookings routes
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const userRole = req.user!.role as UserRole;

    try {
      let bookings;
      if (userRole === "admin") {
        bookings = await storage.getAllBookings();
      } else if (userRole === "host") {
        // Hosts can see bookings for their properties
        bookings = await storage.getHostBookings(userId);
      } else {
        // Travelers can only see their own bookings
        bookings = await storage.getUserBookings(userId);
      }
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const userRole = req.user!.role as UserRole;

    try {
      // Ensure all required fields are present and properly formatted
      const bookingData = {
        ...req.body,
        userId,
        hostId: Number(req.body.hostId) || 2, // Ensure hostId is a number
        status: userRole === "admin" ? "confirmed" : "pending",
        title: req.body.title?.trim(),
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        guests: req.body.guests?.toString(),
        price: req.body.price?.toString(),
        notes: req.body.notes?.trim()
      };

      console.log("Creating booking with data:", JSON.stringify(bookingData, null, 2));
      
      // Validate required fields
      if (!bookingData.hostId || isNaN(bookingData.hostId)) {
        return res.status(400).json({ error: "Host selection is required" });
      }
      if (!bookingData.title) {
        return res.status(400).json({ error: "Title is required" });
      }
      if (!bookingData.startDate) {
        return res.status(400).json({ error: "Start date is required" });
      }
      if (!bookingData.endDate) {
        return res.status(400).json({ error: "End date is required" });
      }
      if (!bookingData.guests) {
        return res.status(400).json({ error: "Guests information is required" });
      }
      if (!bookingData.price) {
        return res.status(400).json({ error: "Price is required" });
      }

      const booking = await storage.createBooking(bookingData);
      console.log("Booking created successfully:", booking);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof Error) {
        res.status(500).json({ 
          error: "Failed to create booking", 
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      } else {
        res.status(500).json({ 
          error: "Failed to create booking", 
          message: String(error)
        });
      }
    }
  });

  app.patch("/api/bookings/:id/status", requireRole(["admin", "host"]), async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    const newStatus = req.body.status;
    const userRole = req.user!.role as UserRole;

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    try {
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Hosts can only update their own bookings
      if (userRole === "host" && booking.hostId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to update this booking" });
      }

      const updatedBooking = await storage.updateBookingStatus(bookingId, newStatus);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  app.delete("/api/bookings/:id", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const userRole = req.user!.role as UserRole;
    const bookingId = parseInt(req.params.id);

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    try {
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (userRole === "admin" || 
          (userRole === "host" && booking.hostId === userId) ||
          (userRole === "traveler" && booking.userId === userId)) {
        await storage.deleteBooking(bookingId, userId);
        return res.status(200).json({ message: "Booking deleted successfully" });
      }
      
      return res.status(403).json({ error: "Not authorized to delete this booking" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // Posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const userRole = req.user!.role as UserRole;

    try {
      // Only hosts and admins can create posts
      if (!["host", "admin"].includes(userRole)) {
        return res.status(403).json({ error: "Only hosts and admins can create posts" });
      }

      const post = await storage.createPost(req.body, userId);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const userRole = req.user!.role as UserRole;
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    try {
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Only admins can delete any post, others can only delete their own
      if (userRole !== "admin" && post.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this post" });
      }

      await storage.deletePost(postId, userId);
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/bookings", requireRole(["admin"]), async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/hosts", isAuthenticated, async (req, res) => {
    try {
      const hosts = await storage.getAllHosts();
      const hostsWithoutPasswords = hosts.map(({ password, ...rest }) => rest);
      res.json(hostsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hosts" });
    }
  });

  app.delete("/api/admin/users/:id", requireRole(["admin"]), async (req, res) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
      await storage.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Add these routes before the error handler
  app.get("/api/destinations", (req, res) => {
    try {
      const destinations = JSON.parse(readFileSync(join(__dirname, 'data/destinations.json'), 'utf-8'));
      res.json(destinations);
    } catch (error) {
      console.error('Error reading destinations:', error);
      res.status(500).json({ error: 'Failed to load destinations' });
    }
  });

  app.get("/api/destinations/:id", (req, res) => {
    try {
      const destinations = JSON.parse(readFileSync(join(__dirname, 'data/destinations.json'), 'utf-8'));
      const destination = destinations.find((d: any) => d.id === req.params.id);
      
      if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      
      res.json(destination);
    } catch (error) {
      console.error('Error reading destination:', error);
      res.status(500).json({ error: 'Failed to load destination' });
    }
  });

  // Get packages for a destination
  app.get("/api/packages", async (req, res) => {
    const destinationId = req.query.destinationId as string;
    
    try {
      const packages = await storage.getPackages(destinationId);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  // Revenue routes
  app.get("/api/admin/revenue", requireRole(["admin"]), async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      
      // Calculate total revenue
      const totalRevenue = bookings.reduce((sum, booking) => {
        return sum + (booking.status === "confirmed" ? parseFloat(booking.price) || 0 : 0);
      }, 0);

      // Calculate monthly revenue
      const monthlyRevenue = bookings.reduce((acc, booking) => {
        if (booking.status === "confirmed") {
          const date = new Date(booking.startDate);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[monthYear] = (acc[monthYear] || 0) + (parseFloat(booking.price) || 0);
        }
        return acc;
      }, {} as Record<string, number>);

      // Get revenue by host
      const revenueByHost = bookings.reduce((acc, booking) => {
        if (booking.status === "confirmed") {
          acc[booking.hostId] = (acc[booking.hostId] || 0) + (parseFloat(booking.price) || 0);
        }
        return acc;
      }, {} as Record<number, number>);

      res.json({
        totalRevenue,
        monthlyRevenue,
        revenueByHost
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}