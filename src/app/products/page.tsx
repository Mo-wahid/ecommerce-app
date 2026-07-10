import { Suspense } from "react";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductCatalog from "@/components/ProductCatalog";
import Footer from "@/components/Footer";

export const revalidate = 60;

export default async function ProductsPage() {
  let products: import("@/types").IProduct[] = [];
  let error = null;

  try {
    await dbConnect();
    const result = await Product.find({}).sort({ createdAt: -1 }).lean();
    
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      
      {/* Banner Header */}
      <div className="bg-brand-700 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-600 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-brand-800 opacity-50 blur-3xl"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 drop-shadow-md">
            Discover Our Collection
          </h1>
          <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto font-light">
            Browse through our extensive catalog of premium products. Use the filters below to find exactly what you're looking for at the right price.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
        ) : (
          <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading catalog...</div>}>
            <ProductCatalog initialProducts={products} />
          </Suspense>
        )}
      </div>

      <Footer />
    </div>
  );
}