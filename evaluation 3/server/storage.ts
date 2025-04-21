import { type User, type InsertUser, type Booking, type InsertBooking, type Post, type InsertPost } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MemoryStore = createMemoryStore(session);

// File paths
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const PACKAGES_FILE = path.join(DATA_DIR, "packages.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize empty files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, "[]");
}
if (!fs.existsSync(BOOKINGS_FILE)) {
  fs.writeFileSync(BOOKINGS_FILE, "[]");
}
if (!fs.existsSync(POSTS_FILE)) {
  fs.writeFileSync(POSTS_FILE, "[]");
}
if (!fs.existsSync(PACKAGES_FILE)) {
  fs.writeFileSync(PACKAGES_FILE, "[]");
}

// Helper function to read JSON file
function readJsonFile<T>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Helper function to write JSON file
function writeJsonFile<T>(filePath: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAllHosts(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

  // Booking methods
  getBooking(id: number): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<Booking[]>;
  getHostBookings(hostId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  deleteBooking(id: number, userId: number): Promise<void>;
  
  // Post methods
  getPost(id: number): Promise<Post | undefined>;
  getUserPosts(userId: number): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  createPost(post: InsertPost, userId: number): Promise<Post>;
  deletePost(id: number, userId: number): Promise<void>;

  // Package methods
  getPackages(destinationId: string): Promise<any[]>;

  sessionStore: session.Store;
}

export class JsonStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const users = readJsonFile<User>(USERS_FILE);
    return users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = readJsonFile<User>(USERS_FILE);
    return users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = readJsonFile<User>(USERS_FILE);
    const newUser = {
      ...insertUser,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      createdAt: new Date()
    };
    users.push(newUser);
    writeJsonFile(USERS_FILE, users);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return readJsonFile<User>(USERS_FILE);
  }

  async getAllHosts(): Promise<User[]> {
    const users = readJsonFile<User>(USERS_FILE);
    return users.filter(user => user.role === "host");
  }

  async deleteUser(id: number): Promise<void> {
    const users = readJsonFile<User>(USERS_FILE);
    const filteredUsers = users.filter(user => user.id !== id);
    writeJsonFile(USERS_FILE, filteredUsers);
  }

  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    const bookings = readJsonFile<Booking>(BOOKINGS_FILE);
    return bookings.find(booking => booking.id === id);
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    const bookings = readJsonFile<Booking>(BOOKINGS_FILE);
    console.log("User bookings for userId", userId, ":", bookings);
    return bookings.filter(booking => booking.userId === userId);
  }

  async getHostBookings(hostId: number): Promise<Booking[]> {
    const bookings = readJsonFile<Booking>(BOOKINGS_FILE);
    console.log("Host bookings for hostId", hostId, ":", bookings);
    return bookings.filter(booking => booking.hostId === hostId);
  }

  async getAllBookings(): Promise<Booking[]> {
    const bookings = readJsonFile<Booking>(BOOKINGS_FILE);
    console.log("All bookings:", bookings);
    return bookings;
  }

  async createBooking(insertBooking: InsertBooking & { userId: number }): Promise<Booking> {
    const bookings = readJsonFile<Booking>(BOOKINGS_FILE);
    const existingIds = new Set(bookings.map(b => b.id));
    let newId = 1;
    while (existingIds.has(newId)) {
      newId++;
    }
    const newBooking = {
      ...insertBooking,
      id: newId,
      createdAt: new Date(),
      notes: insertBooking.notes || null,
      status: insertBooking.status || "pending"
    };
    console.log("Creating booking with data:", newBooking);
    bookings.push(newBooking);
    writeJsonFile(BOOKINGS_FILE, bookings);
    console.log("Created new booking:", newBooking);
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const bookings = readJsonFile<Booking>(BOOKINGS_FILE);
    const index = bookings.findIndex(booking => booking.id === id);
    if (index === -1) {
      throw new Error("Booking not found");
    }
    bookings[index] = { ...bookings[index], status };
    writeJsonFile(BOOKINGS_FILE, bookings);
    return bookings[index];
  }

  async deleteBooking(id: number, userId: number): Promise<void> {
    const bookings = readJsonFile<Booking>(BOOKINGS_FILE);
    const newBookings = bookings.filter(booking => booking.id !== id);
    
    if (newBookings.length === bookings.length) {
      throw new Error("Booking not found");
    }
    
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(newBookings, null, 2));
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    const posts = readJsonFile<Post>(POSTS_FILE);
    return posts.find(post => post.id === id);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    const posts = readJsonFile<Post>(POSTS_FILE);
    return posts.filter(post => post.userId === userId);
  }

  async getAllPosts(): Promise<Post[]> {
    return readJsonFile<Post>(POSTS_FILE);
  }

  async createPost(insertPost: InsertPost, userId: number): Promise<Post> {
    const posts = readJsonFile<Post>(POSTS_FILE);
    const newPost = {
      ...insertPost,
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      userId,
      createdAt: new Date()
    };
    posts.push(newPost);
    writeJsonFile(POSTS_FILE, posts);
    return newPost;
  }

  async deletePost(id: number, userId: number): Promise<void> {
    const posts = readJsonFile<Post>(POSTS_FILE);
    const filteredPosts = posts.filter(post => 
      !(post.id === id && post.userId === userId)
    );
    writeJsonFile(POSTS_FILE, filteredPosts);
  }

  async getPackages(destinationId: string): Promise<any[]> {
    try {
      const packages = await readJsonFile(PACKAGES_FILE);
      return packages.filter((pkg: any) => pkg.destinationId === destinationId);
    } catch (error) {
      console.error("Error reading packages:", error);
      return [];
    }
  }
}

export const storage = new JsonStorage();
