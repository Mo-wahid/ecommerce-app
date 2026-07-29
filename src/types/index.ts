export interface IUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
}

export interface IOrderProduct {
  product: IProduct;
  quantity: number;
  price: number;
}

export interface ICategory {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  itemCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOrder {
  _id: string;
  user: IUser;
  orderItems: IOrderProduct[];
  totalAmount: number;
  orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Unpaid" | "Paid" | "Failed";
  createdAt: string;
}
