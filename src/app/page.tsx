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
  let products = [];
  let error = null;

  try {
    await dbConnect();
    // Fetch all products, sort by newest, and convert Mongoose documents to plain objects
    const result = await Product.find({}).sort({ createdAt: -1 }).lean();
    
    // Convert ObjectIds to strings to pass them safely to Client Components
    products = result.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    }));
  } catch (err) {
    error = "Failed to load products. Please check your database connection.";
    console.error(err);
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
        <p className="text-gray-500 mt-2">Browse our latest collection</p>
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