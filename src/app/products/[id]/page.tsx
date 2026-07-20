import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddToCartSection from "@/components/AddToCartSection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 1. Update the type definition to expect a Promise
export default async function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 2. Await the params to unwrap them
  const resolvedParams = await params;
  
  await dbConnect();
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === "admin";
  const backUrl = isAdmin ? "/admin/products" : "/products";
  
  // 3. Use the unwrapped ID to fetch the product
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
  };

  return (
    <div className="max-w-5xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8 w-full">
      <Link 
        href={backUrl} 
        className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {isAdmin ? "Back to Admin Products" : "Back to Products"}
      </Link>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Product Image */}
        <div className="bg-gray-100 dark:bg-slate-900 h-96 md:h-auto relative">
          <img
            src={serializedProduct.imageUrl || "https://via.placeholder.com/600"}
            alt={serializedProduct.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Product Details */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-2">
            <span className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              {serializedProduct.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            {serializedProduct.name}
          </h1>
          
          <div className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-6">
            ${serializedProduct.price.toFixed(2)}
          </div>
          
          <p className="text-gray-600 dark:text-slate-300 mb-8 leading-relaxed">
            {serializedProduct.description}
          </p>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
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
  );
}