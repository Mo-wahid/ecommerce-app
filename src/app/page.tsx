import Image from "next/image";
import Link from "next/link";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { ArrowRight, Mail, MapPin, Phone, Truck, ShoppingBag, Users } from "lucide-react";
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
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="Hero Background"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-[2px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-16 sm:mt-0">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight mb-6 sm:mb-8 drop-shadow-lg animate-in slide-in-from-bottom-8 duration-700 leading-tight">
            Elevate Your <br className="block sm:hidden" /><span className="text-brand-400">Lifestyle</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl md:text-2xl text-slate-200 mb-8 sm:mb-10 max-w-3xl mx-auto font-light drop-shadow-md animate-in slide-in-from-bottom-10 duration-700 delay-150 px-4">
            Discover premium products curated just for you. From high-tech electronics to essential daily wear, experience shopping reimagined.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-12 duration-700 delay-300 w-full px-4 sm:px-0">
            <Link
              href="#featured"
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-1"
            >
              Shop Featured
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all hover:-translate-y-1"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>


      {/* 2. FEATURED PRODUCTS */}
      <section id="featured" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Featured Collection</h2>
          <div className="h-1 w-24 bg-brand-600 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Hand-picked by our experts. These top-tier items are currently trending and heavily requested.</p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400">No featured products currently available.</p>
          </div>
        )}
      </section>

      {/* 3. CATEGORIES */}
      <section id="categories" className="py-12 bg-white dark:bg-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Shop by Category</h2>
            <div className="h-1 w-24 bg-brand-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => (
              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
                key={category.name}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{category.name}</h3>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/products" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:-translate-y-1">
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">12,500+</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Items Shipped Globally</p>
            </div>

            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">4,800+</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Premium Products</p>
            </div>

            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">99.8%</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONTACT SECTION */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-12 lg:p-16 text-white bg-brand-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-600 opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-brand-800 opacity-50 blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
              <p className="text-brand-100 mb-12 text-lg">Have questions about our products or need support with your order? Our team is here to help 24/7.</p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Our Headquarters</h4>
                    <p className="text-brand-200">123 Commerce Avenue, NY 10001</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Phone Support</h4>
                    <p className="text-brand-200">+1 (800) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Email Us</h4>
                    <p className="text-brand-200">support@ecommerce.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-12 lg:p-16 bg-white dark:bg-slate-800 transition-colors">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white" placeholder="How can we help you?"></textarea>
              </div>
              <button type="button" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-brand-600/30">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <Footer />

    </main>
  );
}