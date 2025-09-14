import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCategorySchema, insertProductSchema, insertOrderSchema, updateSiteSettingsSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), "server", "uploads"));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// WebSocket clients for real-time updates
let wsClients: Set<WebSocket> = new Set();

function broadcastUpdate(event: string, data: any) {
  const message = JSON.stringify({ event, data });
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Middleware to check admin authentication
function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);
  
  // Serve uploaded files statically
  app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads")));

  // Public routes
  
  // Get site settings (public)
  app.get("/api/public/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  // Get categories (public)
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get single category (public)
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get products with filters (public)
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId as string,
        type: req.query.type as string,
        species: req.query.species as string,
      };
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product (public)
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Place order (public)
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      
      // Get products and validate stock
      const productIds = validatedData.products.map(p => p.productId);
      const products = await Promise.all(productIds.map(id => storage.getProduct(id)));
      
      if (products.some(p => !p)) {
        return res.status(400).json({ message: "One or more products not found" });
      }
      
      // Check stock availability
      for (const orderProduct of validatedData.products) {
        const product = products.find(p => p?.id === orderProduct.productId);
        if (!product || product.stock < orderProduct.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for product: ${product?.name}` 
          });
        }
      }
      
      // Create order
      const order = await storage.createOrder(validatedData, products.filter(Boolean) as any[]);
      
      // Update product stock atomically
      for (const orderProduct of validatedData.products) {
        const product = products.find(p => p?.id === orderProduct.productId);
        if (product) {
          await storage.updateProductStock(product.id, product.stock - orderProduct.quantity);
        }
      }
      
      // Broadcast order created event
      broadcastUpdate("order:created", order);
      
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  // Admin protected routes
  
  // Update site settings
  app.put("/api/admin/site", requireAdmin, async (req, res) => {
    try {
      const validatedData = updateSiteSettingsSchema.parse(req.body);
      const settings = await storage.updateSiteSettings(validatedData);
      
      // Broadcast settings updated event
      broadcastUpdate("settings:updated", settings);
      
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update site settings" });
    }
  });

  // Category management
  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      
      broadcastUpdate("category:created", category);
      
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(req.params.id, validatedData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      broadcastUpdate("category:updated", category);
      
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      broadcastUpdate("category:deleted", { id: req.params.id });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Product management
  app.post("/api/admin/products", requireAdmin, upload.array("images", 5), async (req, res) => {
    try {
      const productData = JSON.parse(req.body.productData || "{}");
      const validatedData = insertProductSchema.parse(productData);
      
      const product = await storage.createProduct(validatedData);
      
      // Handle uploaded images
      if (req.files && Array.isArray(req.files)) {
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        await storage.updateProductImages(product.id, imagePaths);
        product.images = imagePaths;
      }
      
      broadcastUpdate("product:created", product);
      
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", requireAdmin, upload.array("images", 5), async (req, res) => {
    try {
      const productData = JSON.parse(req.body.productData || "{}");
      const validatedData = insertProductSchema.parse(productData);
      
      const product = await storage.updateProduct(req.params.id, validatedData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Handle uploaded images if provided
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        await storage.updateProductImages(product.id, imagePaths);
        product.images = imagePaths;
      }
      
      broadcastUpdate("product:updated", product);
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      broadcastUpdate("product:deleted", { id: req.params.id });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Order management
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      broadcastUpdate("order:updated", order);
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  
  wss.on("connection", (ws) => {
    wsClients.add(ws);
    
    ws.on("close", () => {
      wsClients.delete(ws);
    });
    
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      wsClients.delete(ws);
    });
  });

  return httpServer;
}
