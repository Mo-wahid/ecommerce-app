import Image from "next/image";
import Link from "next/link";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { ArrowRight, Mail, MapPin, Phone, Truck, ShoppingBag, Users } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const revalidate = 60; // Revalidate every 60 seconds

async function getFeaturedProducts() {
  try {
    await dbConnect();
    const result = await Product.find({ isFeatured: true }).limit(4).sort({ createdAt: -1 }).lean();

    return result.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : undefined,
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : undefined,
    }));
  } catch (err) {
    console.error("Failed to load featured products:", err);
    return [];
  }
}

const CATEGORIES = [
  { name: "Electronics", image: "/images/cat_electronics.png" },
  { name: "Clothing", image: "/images/cat_clothing.png" },
  { name: "Books", image: "/images/cat_books.png" },
  { name: "Home & Garden", image: "/images/cat_home.png" },
  { name: "Toys", image: "/images/cat_toys.png" },
  { name: "Sports & Outdoors", image: "/images/cat_sports.png" },
  { name: "Beauty & Personal Care", image: "/images/cat_beauty.png" },
  { name: "Automotive", image: "/images/cat_auto.png" },
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  const featuredProducts = await getFeaturedProducts();

  return (
    <main className="min-h-screen flex flex-col bg-background transition-colors">

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="Hero Background"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-zinc-950/60 dark:bg-zinc-950/80 backdrop-blur-[2px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-16 sm:mt-0">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight mb-6 sm:mb-8 drop-shadow-lg animate-in slide-in-from-bottom-8 duration-700 leading-tight">
            Elevate Your <br className="block sm:hidden" /><span className="text-zinc-300">Lifestyle</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl md:text-2xl text-zinc-200 mb-8 sm:mb-10 max-w-3xl mx-auto font-light drop-shadow-md animate-in slide-in-from-bottom-10 duration-700 delay-150 px-4">
            Discover premium products curated just for you. From high-tech electronics to essential daily wear, experience shopping reimagined.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-12 duration-700 delay-300 w-full px-4 sm:px-0">
            <LinkButton
              href="#featured"
              size="lg"
              className="w-full sm:w-auto px-8 rounded-full shadow-lg cursor-pointer"
            >
              Shop Featured
            </LinkButton>
            <LinkButton
              href="/products"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-white/20 cursor-pointer"
            >
              Browse Catalog
            </LinkButton>
          </div>
        </div>
      </section>


      {/* 2. FEATURED PRODUCTS */}
      <section id="featured" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground tracking-tight">Featured Collection</h2>
          <div className="h-1 w-24 bg-primary mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Hand-picked by our experts. These top-tier items are currently trending and heavily requested.</p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-card rounded-2xl border border-border shadow-sm">
            <p className="text-muted-foreground">No featured products currently available.</p>
          </div>
        )}
      </section>

      {/* 3. CATEGORIES */}
      <section id="categories" className="py-12 bg-muted/40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Shop by Category</h2>
            <div className="h-1 w-24 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => (
              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
                key={category.name}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Card className="h-full relative overflow-hidden border-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <CardContent className="absolute bottom-0 left-0 p-6 w-full flex items-center justify-between z-10 border-0 bg-transparent">
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <LinkButton href="/products" size="lg" className="rounded-full px-8 gap-2 shadow-lg hover:-translate-y-1 cursor-pointer">
              View All Products
              <ArrowRight className="w-5 h-5" />
            </LinkButton>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-foreground" />
              </div>
              <p className="text-4xl font-bold tracking-tight text-foreground mb-2">12,500+</p>
              <p className="text-muted-foreground font-medium">Items Shipped Globally</p>
            </div>

            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-foreground" />
              </div>
              <p className="text-4xl font-bold tracking-tight text-foreground mb-2">4,800+</p>
              <p className="text-muted-foreground font-medium">Premium Products</p>
            </div>

            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-foreground" />
              </div>
              <p className="text-4xl font-bold tracking-tight text-foreground mb-2">99.8%</p>
              <p className="text-muted-foreground font-medium">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONTACT SECTION */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-12 lg:p-16 text-white bg-zinc-900 dark:bg-zinc-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-zinc-800 opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-zinc-800 opacity-50 blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
              <p className="text-zinc-400 mb-12 text-lg">Have questions about our products or need support with your order? Our team is here to help 24/7.</p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Our Headquarters</h4>
                    <p className="text-zinc-400">123 Commerce Avenue, NY 10001</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Phone Support</h4>
                    <p className="text-zinc-400">+1 (800) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Email Us</h4>
                    <p className="text-zinc-400">support@ecommerce.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-12 lg:p-16 bg-card transition-colors">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input type="text" placeholder="John" className="h-12 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input type="text" placeholder="Doe" className="h-12 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input type="email" placeholder="john@example.com" className="h-12 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea rows={4} placeholder="How can we help you?" className="rounded-xl" />
              </div>
              <Button type="button" className="w-full h-12 rounded-xl shadow-lg">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <Footer />

    </main>
  );
}