import mongoose from 'mongoose';

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Throw an error if the URI is not defined
if (!MONGODB_URI) {
  console.warn('MONGODB_URI environment variable is not defined');
  // Don't throw error during build time
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Please define the MONGODB_URI environment variable in Vercel'
    );
  }
}

/**
 * Connects to the MongoDB database.
 * Uses a cached connection if available.
 * @returns {Promise<typeof mongoose>} The Mongoose connection instance.
 */
async function dbConnect() {
  // Check if we already have a connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Connect to MongoDB
  const opts = {
    bufferCommands: false,
  };

  try {
    await mongoose.connect(MONGODB_URI!, opts);
    return mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect;