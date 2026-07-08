import Link from "next/link";

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="h-48 w-full bg-gray-100 relative">
        {/* Using standard img tag for simplicity, next/image requires domain config */}
        <img 
          src={product.imageUrl || "https://via.placeholder.com/300?text=No+Image"} 
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{product.name}</h3>
          <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">{product.category}</p>
        
        <div className="flex items-center justify-between mt-4">
          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
          <Link 
            href={`/products/${product._id}`}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}