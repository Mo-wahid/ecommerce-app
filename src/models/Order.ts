import mongoose, { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
})

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderItems: [OrderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    stripeSessionId: {
        type: String,
        required: false,
    },
    paymentStatus: {
        type: String,
        enum: ["Unpaid", "Paid", "Failed"],
        default: "Unpaid"
    }
},{timestamps: true}
)

const Order = models.Order || model("Order", OrderSchema);
export default Order;