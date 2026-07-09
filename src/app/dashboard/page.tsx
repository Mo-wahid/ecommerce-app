import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";

// Revalidate the page every 60 seconds so it updates when new products are added
export const revalidate = 60; 

export const metadata = {
  title: "Premium Products | E-Commerce",
  description: "Browse our latest collection of industry-leading products. Find exactly what you need.",
};

export default async function Dashboard() {
  let products: import("@/types").IProduct[] = [];
  let error = null;

  try {
    await dbConnect();
    // Fetch only featured products, sort by newest, limit to 8
    const result = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    
    type RawProduct = Omit<import("@/types").IProduct, "_id" | "createdAt" | "updatedAt"> & {
      _id: import("mongoose").Types.ObjectId;
      createdAt?: Date;
      updatedAt?: Date;
    };

    // Convert ObjectIds to strings to pass them safely to Client Components
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
    error = "Failed to load products. Please check your database connection.";
    console.error(err);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Featured Products</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Discover our hand-picked selections</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
          <p className="text-gray-500 dark:text-slate-400 text-lg">No featured products found.</p>
        </div>
      )}
    </div>
  );
}
