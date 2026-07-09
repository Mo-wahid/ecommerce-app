import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductCatalog from "@/components/ProductCatalog";

// Revalidate the page every 60 seconds so it updates when new products are added
export const revalidate = 60; 

export const metadata = {
  title: "Premium Products | E-Commerce",
  description: "Browse our latest collection of industry-leading products. Find exactly what you need.",
};

export default async function Home() {
  let products: import("@/types").IProduct[] = [];
  let error = null;

  try {
    await dbConnect();
    // Fetch all products, sort by newest, and convert Mongoose documents to plain objects
    const result = await Product.find({}).sort({ createdAt: -1 }).lean();
    
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
        <p className="text-gray-500 dark:text-slate-400 mt-2">Browse our latest collection</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <ProductCatalog initialProducts={products} />
      )}
    </div>
  );
}