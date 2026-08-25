import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    loyaltyPoints: { type: Number, default: 0 },
    pendingPoints: { type: Number, default: 0 },
    tier: { type: String, enum: ["Silver", "Gold", "Platinum"], default: "Silver" },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductSchema = new Schema(
  {
    slug: { type: String, unique: true },
    name: String,
    description: String,
    priceUsd: Number,
    images: [String],
    gender: String,
    category: String,
    collection: String,
    collaboration: String,
    featured: Boolean,
    lookItems: [String],
    variants: [{ color: String, size: String, stock: Number, sku: String }],
  },
  { timestamps: true }
);

const CartSchema = new Schema(
  {
    userId: String,
    items: [
      {
        productId: String,
        slug: String,
        name: String,
        image: String,
        priceUsd: Number,
        color: String,
        size: String,
        qty: Number,
      },
    ],
  },
  { timestamps: true }
);

const OrderSchema = new Schema(
  {
    userId: String,
    items: [{}],
    totalUsd: Number,
    currency: String,
    stripePaymentId: String,
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    deliveryStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    shipping: {
      name: String,
      line1: String,
      city: String,
      country: String,
      postal: String,
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export const CartModel = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;
  if (mongoose.connection.readyState === 1) return true;
  try {
    await mongoose.connect(uri);
    return true;
  } catch {
    return false;
  }
}
