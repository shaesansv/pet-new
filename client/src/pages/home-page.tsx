import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ForestAnimation from "@/components/forest-animation";
import ProductCard from "@/components/product-card";
import ProductModal from "@/components/product-modal";
import CheckoutModal from "@/components/checkout-modal";
import SuccessModal from "@/components/success-modal";
import { useAppContext } from "@/context/app-context";
import type { Product, Category, SiteSettings } from "@shared/schema";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { categories, products } = useAppContext();

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/public/settings"],
  });

  const filteredProducts = products?.filter(product => {
    if (selectedCategory === "all") return true;
    return product.categoryId === selectedCategory || product.type === selectedCategory;
  }) || [];

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ForestAnimation />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-serif font-bold text-accent">🌲 PetShopForest</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              <button 
                onClick={() => setActiveSection("home")}
                className={`text-muted-foreground hover:text-foreground transition-colors ${activeSection === "home" ? "text-foreground" : ""}`}
                data-testid="nav-home"
              >
                Home
              </button>
              <button 
                onClick={() => setActiveSection("products")}
                className={`text-muted-foreground hover:text-foreground transition-colors ${activeSection === "products" ? "text-foreground" : ""}`}
                data-testid="nav-shop"
              >
                Shop
              </button>
              <button 
                onClick={() => setActiveSection("contact")}
                className={`text-muted-foreground hover:text-foreground transition-colors ${activeSection === "contact" ? "text-foreground" : ""}`}
                data-testid="nav-contact"
              >
                Contact
              </button>
              <Link href="/auth">
                <Button variant="outline" size="sm" data-testid="nav-admin">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-16">
        
        {/* Home Section */}
        {activeSection === "home" && (
          <section className="animate-fade-in" data-testid="section-home">
            <div className="container mx-auto px-4 py-12">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-foreground">
                  Welcome to the <span className="text-accent">Forest</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-description">
                  {siteSettings?.description || "Discover a magical world of pets, premium food, and accessories in our enchanted forest marketplace."}
                </p>
                <Button 
                  onClick={() => setActiveSection("products")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all"
                  data-testid="button-explore"
                >
                  Explore Our Collection
                </Button>
              </div>

              {/* YouTube Video Section */}
              {siteSettings?.youtubeUrl && (
                <div className="max-w-4xl mx-auto mb-16">
                  <div className="forest-card rounded-2xl p-8">
                    <h3 className="text-2xl font-serif font-semibold mb-6 text-center">Meet Our Forest Friends</h3>
                    <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={getYouTubeEmbedUrl(siteSettings.youtubeUrl)}
                        title="Pet Shop Forest Video" 
                        frameBorder="0" 
                        allowFullScreen
                        data-testid="video-youtube"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="forest-card rounded-xl p-6 text-center transform hover:scale-105 transition-all">
                  <div className="text-3xl text-accent mb-4">🐕</div>
                  <h3 className="text-xl font-semibold mb-2">Healthy Pets</h3>
                  <p className="text-muted-foreground">Carefully selected companions from trusted breeders</p>
                </div>
                <div className="forest-card rounded-xl p-6 text-center transform hover:scale-105 transition-all">
                  <div className="text-3xl text-accent mb-4">🥘</div>
                  <h3 className="text-xl font-semibold mb-2">Premium Food</h3>
                  <p className="text-muted-foreground">Nutritious meals for every stage of life</p>
                </div>
                <div className="forest-card rounded-xl p-6 text-center transform hover:scale-105 transition-all">
                  <div className="text-3xl text-accent mb-4">🎾</div>
                  <h3 className="text-xl font-semibold mb-2">Quality Accessories</h3>
                  <p className="text-muted-foreground">Everything your pet needs to thrive</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        {activeSection === "products" && (
          <section className="animate-fade-in" data-testid="section-products">
            <div className="container mx-auto px-4 py-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Our Forest Collection</h2>
                <p className="text-xl text-muted-foreground">Browse by category to find the perfect companions and supplies</p>
              </div>

              {/* Category Navigation */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Button
                  variant={selectedCategory === "all" ? "default" : "secondary"}
                  onClick={() => setSelectedCategory("all")}
                  data-testid="filter-all"
                >
                  All Items
                </Button>
                {categories?.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "secondary"}
                    onClick={() => setSelectedCategory(category.id)}
                    data-testid={`filter-${category.slug}`}
                  >
                    {category.name}
                  </Button>
                ))}
                <Button
                  variant={selectedCategory === "pet" ? "default" : "secondary"}
                  onClick={() => setSelectedCategory("pet")}
                  data-testid="filter-pets"
                >
                  Pets
                </Button>
                <Button
                  variant={selectedCategory === "food" ? "default" : "secondary"}
                  onClick={() => setSelectedCategory("food")}
                  data-testid="filter-food"
                >
                  Food
                </Button>
                <Button
                  variant={selectedCategory === "accessory" ? "default" : "secondary"}
                  onClick={() => setSelectedCategory("accessory")}
                  data-testid="filter-accessories"
                >
                  Accessories
                </Button>
              </div>

              {/* Products Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-12" data-testid="text-no-products">
                    <p className="text-muted-foreground text-lg">No products found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        {activeSection === "contact" && (
          <section className="animate-fade-in" data-testid="section-contact">
            <div className="container mx-auto px-4 py-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Visit Our Forest</h2>
                <p className="text-xl text-muted-foreground">Come experience our magical pet paradise in person</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Information */}
                <Card className="forest-card">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-serif font-semibold mb-6">Get in Touch</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <MapPin className="text-accent mt-1" />
                        <div>
                          <h4 className="font-semibold">Address</h4>
                          <p className="text-muted-foreground" data-testid="text-address">
                            123 Forest Grove Lane<br />
                            Mumbai, Maharashtra 400001<br />
                            India
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <Phone className="text-accent mt-1" />
                        <div>
                          <h4 className="font-semibold">Phone</h4>
                          <p className="text-muted-foreground" data-testid="text-phone">+91 98765 43210</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <Mail className="text-accent mt-1" />
                        <div>
                          <h4 className="font-semibold">Email</h4>
                          <p className="text-muted-foreground" data-testid="text-email">hello@petshopforest.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <Clock className="text-accent mt-1" />
                        <div>
                          <h4 className="font-semibold">Hours</h4>
                          <p className="text-muted-foreground" data-testid="text-hours">
                            Monday - Saturday: 9:00 AM - 8:00 PM<br />
                            Sunday: 10:00 AM - 6:00 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Map Embed */}
                <Card className="forest-card">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-serif font-semibold mb-6">Location Map</h3>
                    <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                      <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.0223729665743!2d72.82229631490195!3d19.08230198709806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce9a6d804d5d%3A0x3d79de3b6b0a6d99!2sMumbai%2C%20Maharashtra%2C%20India!5e0!3m2!1sen!2sus!4v1635789012345!5m2!1sen!2sus"
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        data-testid="map-location"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={handleBuyNow}
      />
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        product={selectedProduct}
        quantity={quantity}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleOrderSuccess}
      />
      
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setActiveSection("products");
        }}
      />
    </div>
  );
}
