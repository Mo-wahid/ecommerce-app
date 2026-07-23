import mongoose from "mongoose"
const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  )
}
declare global {
  var mongoose: { conn: typeof import("mongoose") | null; promise: Promise<typeof import("mongoose")> | null };
}

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of default 30s
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose
      })
      .catch((error) => {
        // Clear the cached promise so the next request can retry connecting
        cached.promise = null;
        
        let errorMessage = "Failed to connect to the database.";
        
        // Handle common MongoDB connection errors
        if (error.code === 'ENOTFOUND' || error.message.includes('ENOTFOUND')) {
          errorMessage = `Network Error (ENOTFOUND): Could not reach the MongoDB server. Please check your internet connection or verify your MONGODB_URI.`;
        } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
          errorMessage = `Authentication Error: Invalid MongoDB username or password. Please check your MONGODB_URI.`;
        } else if (error.message.includes('IP address') && error.message.includes('whitelist')) {
          errorMessage = `Network Access Error: Your current IP address is not whitelisted in MongoDB Atlas. Please add your IP to the Network Access list.`;
        }

        console.error(`\n❌ [Database Connection Error] ${errorMessage}\n   Original Error: ${error.message}\n`);
        throw new Error(errorMessage);
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn
}

export default dbConnect