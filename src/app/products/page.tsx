import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import ProductCatalog from "@/components/ProductCatalog";

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