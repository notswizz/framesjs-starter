// utils/mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // Your MongoDB connection string
const dbName = process.env.MONGODB_DB; // Your database name

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function logData(collectionName, data) {
  const { db } = await connectToDatabase();
  const collection = db.collection(collectionName);
  await collection.insertOne(data);
}
