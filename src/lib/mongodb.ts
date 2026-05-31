import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  // Fail fast when a node can't be reached so the app's graceful fallbacks
  // (bundled products, best-effort analytics) kick in quickly instead of
  // hanging on the driver's 30s default.
  clientPromise ??= new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  }).connect();
  return clientPromise;
}
