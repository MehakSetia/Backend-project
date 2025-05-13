import { type User, type InsertUser, type Booking, type InsertBooking, type Post, type InsertPost } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import mongoose from "mongoose";

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/ReactBackendPortal")
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// Define schemas
const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date,
});

const bookingSchema = new mongoose.Schema({
  id: Number,
  userId: Number,
  hostId: Number,
  status: String,
  notes: String,
  createdAt: Date,
  title: String,
  startDate: Date,
  endDate: Date,
  guests: String,
  price: String
});

const postSchema = new mongoose.Schema({
  id: Number,
  userId: Number,
  title: String,
  content: String,
  category: String,
  status: String,
  createdAt: Date,
});

const packageSchema = new mongoose.Schema({
  id: Number,
  destinationId: String,
  name: String,
  description: String,
  duration: String,
  price: String,
  inclusions: String,
  exclusions: String,
  createdAt: Date,
});

// Create models
const User = mongoose.model("User", userSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const Post = mongoose.model("Post", postSchema);
// const Package = mongoose.model("Package", packageSchema);

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  createUser(user: InsertUser): Promise<any>;
  getAllUsers(): Promise<any[]>;
  getAllHosts(): Promise<any[]>;
  deleteUser(id: number): Promise<void>;

  getBooking(id: number): Promise<any>;
  getUserBookings(userId: number): Promise<any[]>;
  getHostBookings(hostId: number): Promise<any[]>;
  getAllBookings(): Promise<any[]>;
  createBooking(booking: InsertBooking): Promise<any>;
  updateBookingStatus(id: number, status: string): Promise<any>;
  deleteBooking(id: number, userId: number): Promise<void>;

  getPost(id: number): Promise<any>;
  getUserPosts(userId: number): Promise<any[]>;
  getAllPosts(): Promise<any[]>;
  createPost(post: InsertPost, userId: number): Promise<any>;
  deletePost(id: number, userId: number): Promise<void>;

  getPackages(destinationId: string): Promise<any[]>;

  sessionStore: session.Store;
}

export class MongoStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  // User methods
  async getUser(id: number) {
    return await User.findOne({ id });
  }
  async getUserByEmail(email: string) {
    return await User.findOne({ email });
  }
  async createUser(insertUser: InsertUser) {
    const newUser = new User({
      ...insertUser,
      id: await User.countDocuments() + 1,
      createdAt: new Date()
    });
    await newUser.save();
    return newUser;
  }
  async getAllUsers() { return await User.find(); }
  async getAllHosts() { return await User.find({ role: "host" }); }
  async deleteUser(id: number) { await User.deleteOne({ id }); }

  // Booking methods
  async getBooking(id: number) { return await Booking.findOne({ id }); }
  async getUserBookings(userId: number) { return await Booking.find({ userId }); }
  async getHostBookings(hostId: number) { return await Booking.find({ hostId }); }
  async getAllBookings() { return await Booking.find(); }
  async createBooking(insertBooking: InsertBooking & { userId: number }) {
    const newBooking = new Booking({
      ...insertBooking,
      id: await Booking.countDocuments() + 1,
      createdAt: new Date(),
      notes: insertBooking.notes || null,
      status: insertBooking.status || "pending"
    });
    await newBooking.save();
    return newBooking;
  }
  async updateBookingStatus(id: number, status: string) {
    const booking = await Booking.findOne({ id });
    if (!booking) throw new Error("Booking not found");
    booking.status = status;
    await booking.save();
    return booking;
  }
  async deleteBooking(id: number, userId: number) { await Booking.deleteOne({ id }); }

  // Post methods
  async getPost(id: number) { return await Post.findOne({ id }); }
  async getUserPosts(userId: number) { return await Post.find({ userId }); }
  async getAllPosts() { return await Post.find(); }
  async createPost(insertPost: InsertPost, userId: number) {
    const newPost = new Post({
      ...insertPost,
      id: await Post.countDocuments() + 1,
      userId,
      createdAt: new Date()
    });
    await newPost.save();
    return newPost;
  }
  async deletePost(id: number, userId: number) { await Post.deleteOne({ id, userId }); }

  // Package methods
  async getPackages(destinationId: string) { return await Package.find({ destinationId }); }
}

export const storage = new MongoStorage();
