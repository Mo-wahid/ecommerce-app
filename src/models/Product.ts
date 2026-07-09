import mongoose, { Schema, model, models } from "mongoose"
const ProductSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    stock:{
        type: Number,
        required: true,
        default: 0,
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    isFeatured: {
        type: Boolean,
        default: false,
    }
}, {timestamps: true},
)

const Product = models.Product || model("Product", ProductSchema);
export default Product;