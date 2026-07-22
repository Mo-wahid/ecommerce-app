import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, CheckCircle2, AlertTriangle, XCircle, FileText, Truck, Info, RotateCcw, ShieldCheck } from "lucide-react";
import AddToCartSection from "@/components/AddToCartSection";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  
  await dbConnect();
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === "admin";
  
  const product = await Product.findById(resolvedParams.id).lean();

  if (!product) {
    notFound();
  }

  const serializedProduct = {
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    imageUrl: product.imageUrl,
    stock: product.stock,
    createdAt: product.createdAt ? product.createdAt.toISOString() : undefined,
  };

  // Fetch related products in the same category (excluding current product)
  const rawRelatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .limit(4)
    .lean();

  const relatedProducts = rawRelatedProducts.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    price: p.price,
    category: p.category,
    imageUrl: p.imageUrl,
    stock: p.stock,
  }));

  // Helper for stock availability badge
  const renderStockBadge = (stock: number) => {
    if (stock > 10) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>In Stock ({stock} available)</span>
        </div>
      );
    } else if (stock > 0) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock (Only {stock} left)</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
          <XCircle className="w-3.5 h-3.5" />
          <span>Out of Stock</span>
        </div>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-20 pb-16 px-4 sm:px-6 lg:px-8 w-full space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home className="w-4 h-4" />
          <span className="sr-only">Home</span>
        </Link>
        <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/60" />
        <Link href={isAdmin ? "/admin/products" : "/products"} className="hover:text-foreground transition-colors">
          {isAdmin ? "Admin Products" : "Products"}
        </Link>
        <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/60" />
        <span className="capitalize text-muted-foreground">{serializedProduct.category}</span>
        <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/60" />
        <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
          {serializedProduct.name}
        </span>
      </nav>
      
      {/* 2-Column Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Main Product Card */}
        <div className={`${relatedProducts.length > 0 ? "lg:col-span-8" : "lg:col-span-12"}`}>
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-colors w-full">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side: Sticky Product Image Container */}
              <div className="relative h-full border-r border-border/50 bg-muted">
                <div className="h-[350px] sm:h-[450px] md:h-[500px] lg:h-[540px] w-full relative flex items-center justify-center md:sticky md:top-24">
                  <img
                    src={serializedProduct.imageUrl || "https://via.placeholder.com/600"}
                    alt={serializedProduct.name}
                    className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>
              </div>

              {/* Right Side: Header + Accordion + AddToCart */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-xs font-bold tracking-wider text-primary uppercase">
                      {serializedProduct.category}
                    </span>
                    {renderStockBadge(serializedProduct.stock)}
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
                    {serializedProduct.name}
                  </h1>
                  
                  <div className="text-3xl font-bold text-primary mb-4">
                    ${serializedProduct.price.toFixed(2)}
                  </div>

                  {/* Accordion ABOVE AddToCartSection */}
                  <div className="pt-2">
                    <Accordion>
                      <AccordionItem
                        title="Description"
                        icon={<FileText className="w-4 h-4 text-primary" />}
                        defaultOpen={true}
                      >
                        <p className="leading-relaxed text-sm text-foreground">{serializedProduct.description}</p>
                      </AccordionItem>

                      <AccordionItem
                        title="Shipping & Returns"
                        icon={<Truck className="w-4 h-4 text-primary" />}
                      >
                        <div className="space-y-2.5 pt-1 text-xs sm:text-sm">
                          <div className="flex items-start gap-2">
                            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>Free standard shipping on orders over $50 (3–5 business days).</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <RotateCcw className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>30-day hassle-free return and exchange policy.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>Backed by 1-Year manufacturer warranty.</span>
                          </div>
                        </div>
                      </AccordionItem>

                      <AccordionItem
                        title="Product Specs"
                        icon={<Info className="w-4 h-4 text-primary" />}
                      >
                        <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                          <div className="p-2 rounded-md bg-muted/40 border border-border">
                            <span className="font-semibold text-foreground block">Category</span>
                            <span className="text-muted-foreground capitalize">{serializedProduct.category}</span>
                          </div>
                          <div className="p-2 rounded-md bg-muted/40 border border-border">
                            <span className="font-semibold text-foreground block">SKU</span>
                            <span className="font-mono text-muted-foreground">{serializedProduct._id.substring(serializedProduct._id.length - 8).toUpperCase()}</span>
                          </div>
                          <div className="p-2 rounded-md bg-muted/40 border border-border">
                            <span className="font-semibold text-foreground block">Availability</span>
                            <span className="text-muted-foreground">{serializedProduct.stock} in stock</span>
                          </div>
                          <div className="p-2 rounded-md bg-muted/40 border border-border">
                            <span className="font-semibold text-foreground block">Listed</span>
                            <span className="text-muted-foreground">{serializedProduct.createdAt ? new Date(serializedProduct.createdAt).toLocaleDateString() : "Recent"}</span>
                          </div>
                        </div>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Add to Cart Section below Accordion */}
                  <AddToCartSection 
                    productId={serializedProduct._id} 
                    stock={serializedProduct.stock} 
                    price={serializedProduct.price}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Recommended Products (YouTube Style) */}
        {relatedProducts.length > 0 && (
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">You Might Also Like</h2>
                <p className="text-xs text-muted-foreground">More in {serializedProduct.category}</p>
              </div>
              <Link 
                href="/products" 
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct._id}
                  href={`/products/${relProduct._id}`}
                  className="flex items-center gap-3.5 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all group shadow-xs"
                >
                  <div className="w-20 h-20 bg-muted/50 rounded-lg relative shrink-0 border border-border/50">
                    <img
                      src={relProduct.imageUrl || "https://via.placeholder.com/150"}
                      alt={relProduct.name}
                      className="absolute inset-0 w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                      {relProduct.category}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {relProduct.name}
                    </h3>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-sm font-bold text-foreground">
                        ${relProduct.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium group-hover:text-primary group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}