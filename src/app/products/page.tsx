import { Suspense } from "react";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";

export const revalidate = 60;

export default async function ProductsPage() {
  let products: import("@/types").IProduct[] = [];
  let totalPages = 1;
  let error = null;

  try {
    await dbConnect();
    const [result, totalCount] = await Promise.all([
      Product.find({}).sort({ createdAt: -1 }).limit(8).lean(),
      Product.countDocuments({})
    ]);
    
    totalPages = Math.ceil(totalCount / 8);
    
    type RawProduct = Omit<import("@/types").IProduct, "_id" | "createdAt" | "updatedAt"> & {
      _id: import("mongoose").Types.ObjectId;
      createdAt?: Date;
      updatedAt?: Date;
    };

    products = result.map((doc: unknown) => {
      const raw = doc as RawProduct;
      return {
        ...raw,
        _id: raw._id.toString(),
        createdAt: raw.createdAt ? raw.createdAt.toISOString() : undefined,
        updatedAt: raw.updatedAt ? raw.updatedAt.toISOString() : undefined,
      };
    });
  } catch (err) {
    error = "Failed to load products.";
    console.error(err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors">
      
      {/* Banner Header */}
      <div className="bg-zinc-900 text-white dark:bg-zinc-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-zinc-800 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-zinc-800 opacity-50 blur-3xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 drop-shadow-md">
            Discover Our Collection
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light">
            Browse through our extensive catalog of premium products. Use the filters below to find exactly what you're looking for at the right price.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
        ) : (
          <Suspense fallback={<ProductCatalogSkeleton />}>
            <ProductCatalog initialProducts={products} initialTotalPages={totalPages} />
          </Suspense>
        )}
      </div>

      <Footer />
    </div>
  );
}

function ProductCatalogSkeleton() {
  return (
    <div className="w-full">
      {/* Skeleton for ProductFilterBar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-1/3 h-10 bg-muted animate-pulse rounded-md"></div>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="w-32 h-10 bg-muted animate-pulse rounded-md"></div>
          <div className="w-32 h-10 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
      
      {/* Skeleton for Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[400px] w-full bg-muted animate-pulse rounded-xl border border-border"></div>
        ))}
      </div>
      
      {/* Skeleton for Pagination */}
      <div className="flex justify-center">
        <div className="w-64 h-10 bg-muted animate-pulse rounded-md"></div>
      </div>
    </div>
  );
}