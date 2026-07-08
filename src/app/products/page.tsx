import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductCatalog from "@/components/ProductCatalog";

export const revalidate = 60;

export default async function ProductsPage() {
  let products = [];
  let error = null;

  try {
    await dbConnect();
    const result = await Product.find({}).sort({ createdAt: -1 }).lean();
    
    products = result.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    }));
  } catch (err) {
    error = "Failed to load products.";
    console.error(err);
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-2">Use the search and filters to find what you need.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      ) : (
        <ProductCatalog initialProducts={products} />
      )}
    </div>
  );
}