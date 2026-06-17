import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Configure PostgreSQL connection pool to prevent connection exhaustion
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Connection pool settings
  min: 2,                      // Minimum number of connections in pool
  max: 10,                     // Maximum number of connections in pool

  // Timeout settings
  idleTimeoutMillis: 30000,    // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Fail after 10 seconds if no connection available

  // Connection lifecycle
  allowExitOnIdle: false,      // Keep pool alive even when idle
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

// Log pool stats in development
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    console.log(` - Pool: total=${pool.totalCount}, idle=${pool.idleCount}, waiting=${pool.waitingCount}`);
  }, 60000); // Log every minute
}

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
