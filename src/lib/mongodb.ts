import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  clientPromise ??= new MongoClient(process.env.MONGODB_URI).connect();
  return clientPromise;
}
