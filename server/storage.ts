import { type Admin, type InsertAdmin, type Category, type InsertCategory, type Product, type InsertProduct, type Order, type InsertOrder, type SiteSettings, type UpdateSiteSettings, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods (for auth compatibility)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin methods
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Product methods
  getProducts(filters?: { categoryId?: string; type?: string; species?: string }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  updateProductImages(id: string, images: string[]): Promise<Product | undefined>;
  updateProductStock(id: string, newStock: number): Promise<Product | undefined>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder, products: Product[]): Promise<Order>;
  updateOrderStatus(id: string, status: "pending" | "completed" | "cancelled"): Promise<Order | undefined>;
  
  // Site settings methods
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: UpdateSiteSettings): Promise<SiteSettings>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private admins: Map<string, Admin>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private siteSettings: SiteSettings;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.admins = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    
    // Initialize default site settings
    this.siteSettings = {
      id: "default",
      description: "Discover a magical world of pets, premium food, and accessories in our enchanted forest marketplace. Every creature deserves the finest care nature can provide.",
      youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      updatedAt: new Date(),
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize default admin user
    this.initializeDefaultAdmin();
  }
  
  private async initializeDefaultAdmin() {
    // Create default admin if not exists
    const defaultAdmin = await this.getAdminByEmail("admin@petshop.forest");
    if (!defaultAdmin) {
      await this.createAdmin({
        email: "admin@petshop.forest",
        password: await this.hashPassword("admin123"),
        name: "Forest Admin",
      });
    }
  }
  
  private async hashPassword(password: string): Promise<string> {
    const { scrypt, randomBytes, timingSafeEqual } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);
    
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  // User methods (for auth compatibility)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Admin methods
  async getAdmin(id: string): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.email === email);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = {
      ...insertAdmin,
      id,
      role: "admin",
      createdAt: new Date(),
    };
    this.admins.set(id, admin);
    return admin;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const slug = insertCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category: Category = {
      ...insertCategory,
      id,
      slug,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: Category = {
      ...category,
      ...updateData,
      slug: updateData.name ? updateData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : category.slug,
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Product methods
  async getProducts(filters?: { categoryId?: string; type?: string; species?: string }): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters?.type) {
      products = products.filter(p => p.type === filters.type);
    }
    if (filters?.species) {
      products = products.filter(p => p.species === filters.species);
    }
    
    return products.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      images: [],
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = {
      ...product,
      ...updateData,
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async updateProductImages(id: string, images: string[]): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    product.images = images;
    this.products.set(id, product);
    return product;
  }

  async updateProductStock(id: string, newStock: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    product.stock = newStock;
    this.products.set(id, product);
    return product;
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder, products: Product[]): Promise<Order> {
    const id = randomUUID();
    
    // Calculate order details
    const orderProducts = insertOrder.products.map(orderProduct => {
      const product = products.find(p => p.id === orderProduct.productId);
      if (!product) throw new Error(`Product ${orderProduct.productId} not found`);
      
      return {
        productId: orderProduct.productId,
        name: product.name,
        priceInINR: product.priceInINR,
        quantity: orderProduct.quantity,
      };
    });
    
    const totalAmountINR = orderProducts.reduce((total, product) => 
      total + (product.priceInINR * product.quantity), 0
    );
    
    const order: Order = {
      id,
      products: orderProducts,
      customer: insertOrder.customer,
      totalAmountINR,
      status: "pending",
      createdAt: new Date(),
    };
    
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: "pending" | "completed" | "cancelled"): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    order.status = status;
    this.orders.set(id, order);
    return order;
  }

  // Site settings methods
  async getSiteSettings(): Promise<SiteSettings> {
    return this.siteSettings;
  }

  async updateSiteSettings(settings: UpdateSiteSettings): Promise<SiteSettings> {
    this.siteSettings = {
      ...this.siteSettings,
      ...settings,
      updatedAt: new Date(),
    };
    return this.siteSettings;
  }
}

export const storage = new MemStorage();
