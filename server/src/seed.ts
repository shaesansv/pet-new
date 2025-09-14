import { storage } from "./storage.js";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  try {
    // Create admin user
    console.log("Creating admin user...");
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
    });
    console.log("✅ Admin user created (username: admin, password: admin123)");

    // Create categories
    console.log("Creating categories...");
    const dogCategory = await storage.createCategory({
      name: "Dogs",
      description: "Products and companions for dog lovers",
    });

    const catCategory = await storage.createCategory({
      name: "Cats",
      description: "Everything for your feline friends",
    });

    const fishCategory = await storage.createCategory({
      name: "Fish",
      description: "Aquatic pets and aquarium supplies",
    });

    const birdCategory = await storage.createCategory({
      name: "Birds",
      description: "Feathered friends and bird care products",
    });

    console.log("✅ Categories created");

    // Create sample products
    console.log("Creating sample products...");

    // Dog products
    await storage.createProduct({
      name: "Golden Retriever Puppy",
      categoryId: dogCategory.id,
      type: "pet",
      species: "Dog",
      description:
        "Friendly and energetic golden retriever puppy, perfect for families with children. Well-socialized and health-checked.",
      priceInINR: 25000,
      stock: 2,
      available: true,
    });

    await storage.createProduct({
      name: "Premium Dog Food - Adult",
      categoryId: dogCategory.id,
      type: "food",
      species: "Dog",
      description:
        "High-quality dry dog food with real chicken, perfect for adult dogs. Contains essential nutrients for healthy growth.",
      priceInINR: 1200,
      stock: 15,
      available: true,
    });

    await storage.createProduct({
      name: "Dog Leash and Collar Set",
      categoryId: dogCategory.id,
      type: "accessory",
      species: "Dog",
      description:
        "Durable leather leash with matching collar, adjustable and comfortable for daily walks.",
      priceInINR: 800,
      stock: 8,
      available: true,
    });

    // Cat products
    await storage.createProduct({
      name: "Persian Kitten",
      categoryId: catCategory.id,
      type: "pet",
      species: "Cat",
      description:
        "Beautiful Persian kitten with long, fluffy coat. Very gentle and perfect for indoor living.",
      priceInINR: 18000,
      stock: 3,
      available: true,
    });

    await storage.createProduct({
      name: "Premium Cat Food - Kitten",
      categoryId: catCategory.id,
      type: "food",
      species: "Cat",
      description:
        "Specially formulated dry food for kittens with DHA for brain development and calcium for strong bones.",
      priceInINR: 900,
      stock: 20,
      available: true,
    });

    await storage.createProduct({
      name: "Cat Scratching Post",
      categoryId: catCategory.id,
      type: "accessory",
      species: "Cat",
      description:
        "Multi-level scratching post with sisal rope and cozy hideout, perfect for active cats.",
      priceInINR: 2500,
      stock: 5,
      available: true,
    });

    // Fish products
    await storage.createProduct({
      name: "Tropical Angelfish Pair",
      categoryId: fishCategory.id,
      type: "pet",
      species: "Fish",
      description:
        "Beautiful pair of angelfish, perfect for community aquariums. Hardy and easy to care for.",
      priceInINR: 350,
      stock: 12,
      available: true,
    });

    await storage.createProduct({
      name: "Aquarium Fish Food Flakes",
      categoryId: fishCategory.id,
      type: "food",
      species: "Fish",
      description:
        "High-quality fish flakes with vitamins and minerals for tropical fish. Enhances color and promotes growth.",
      priceInINR: 250,
      stock: 30,
      available: true,
    });

    await storage.createProduct({
      name: "10 Gallon Aquarium Kit",
      categoryId: fishCategory.id,
      type: "accessory",
      species: "Fish",
      description:
        "Complete aquarium kit with filter, heater, and LED lighting. Perfect starter tank for beginners.",
      priceInINR: 4500,
      stock: 3,
      available: true,
    });

    // Bird products
    await storage.createProduct({
      name: "Cockatiel Pair",
      categoryId: birdCategory.id,
      type: "pet",
      species: "Bird",
      description:
        "Friendly and social cockatiel pair. Hand-fed and very tame, great for families.",
      priceInINR: 8000,
      stock: 4,
      available: true,
    });

    await storage.createProduct({
      name: "Bird Seed Mix",
      categoryId: birdCategory.id,
      type: "food",
      species: "Bird",
      description:
        "Nutritious seed mix for cockatiels and small parrots. Contains sunflower seeds, millet, and safflower.",
      priceInINR: 400,
      stock: 25,
      available: true,
    });

    await storage.createProduct({
      name: "Large Bird Cage",
      categoryId: birdCategory.id,
      type: "accessory",
      species: "Bird",
      description:
        "Spacious bird cage with multiple perches and feeding stations. Easy to clean with removable tray.",
      priceInINR: 6500,
      stock: 2,
      available: true,
    });

    console.log("✅ Sample products created");

    // Update site settings
    console.log("Updating site settings...");
    await storage.updateSiteSettings({
      description:
        "Welcome to PetShopForest, your magical destination for pets, premium food, and accessories in our enchanted forest marketplace. Every creature deserves the finest care nature can provide. Discover healthy pets from trusted sources, nutritious food for every life stage, and quality accessories to keep your companions happy and thriving.",
      youtubeUrl: "https://www.youtube.com/embed/hFZFjoX2cGg", // Sample pet video
    });
    console.log("✅ Site settings updated");

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log("- Admin user: username=admin, password=admin123");
    console.log("- Categories: Dogs, Cats, Fish, Birds");
    console.log("- Products: 12 sample products across all categories");
    console.log("- Site settings: Updated with description and YouTube video");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  });
}

export { seedDatabase };
