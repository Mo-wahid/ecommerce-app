import Link from "next/link";
import Image from "next/image";

interface ProductProps {
  product: {
    _id: string;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <div className="h-56 w-full bg-slate-100 relative overflow-hidden">
        <Image
          src={product.imageUrl || "https://via.placeholder.com/400?text=No+Image"}
          alt={product.name}
          fill
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.stock === 0 && (
          <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight">{product.name}</h3>
          <span className="text-xl font-black text-brand-600 shrink-0">${product.price.toFixed(2)}</span>
        </div>
        
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-auto">{product.category}</p>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
          <span className={`text-sm font-semibold flex items-center gap-1.5 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            {product.stock > 0 ? `${product.stock} left` : 'Sold Out'}
          </span>
          <Link 
            href={`/products/${product._id}`}
            className="bg-slate-900 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}