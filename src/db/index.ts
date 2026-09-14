import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  return databaseUrl;
}

function createPool() {
  const existing = globalForDb.__arenaNextJsPostgresqlPool;
  if (existing) return existing;

  const pool = new Pool({
    connectionString: requireDatabaseUrl(),
  });

  // Cache on globalThis in dev so Fast Refresh does not leak connections.
  // In production the module instance is reused for the process lifetime.
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  return pool;
}

let poolInstance: Pool | undefined;
let dbInstance: ReturnType<typeof drizzle> | undefined;

export function getPool() {
  if (!poolInstance) poolInstance = createPool();
  return poolInstance;
}

export function getDb() {
  if (!dbInstance) dbInstance = drizzle(getPool());
  return dbInstance;
}

function lazy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const value = Reflect.get(resolve(), prop, receiver);
      return typeof value === "function" ? value.bind(resolve()) : value;
    },
  });
}

// Lazy so `next build` can import this module without DATABASE_URL set
// (Vercel collects /api/health at build time).
export const pool = lazy(getPool);
export const db = lazy(getDb);
