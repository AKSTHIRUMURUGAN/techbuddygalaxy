import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/techbuddyspace';
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Database helper functions
export async function getDatabase() {
  try {
    const client = await clientPromise;
    return client.db('internship'); // Use the database name from the URI
  } catch (error) {
    console.error('Failed to connect to MongoDB:', {
      message: error.message,
      name: error.name,
      uri: uri ? 'Set' : 'Not set'
    });
    throw error;
  }
}

export async function getCollection(collectionName) {
  try {
    const db = await getDatabase();
    return db.collection(collectionName);
  } catch (error) {
    console.error('Failed to get MongoDB collection:', {
      collectionName,
      message: error.message,
      name: error.name
    });
    throw error;
  }
}