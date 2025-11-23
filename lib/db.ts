// @ts-expect-error - Prisma 7 type exports may not be recognized by TypeScript immediately after generation
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// Prisma 7 requires an adapter for direct database connections
// Read connection URL from environment variable
let databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please ensure DATABASE_URL is defined in your .env.local or environment variables.'
  )
}

// Handle Prisma Accelerate URL format (prisma+postgres://)
// For direct connections, we need standard postgres:// or postgresql:// format
if (databaseUrl.startsWith('prisma+postgres://') || databaseUrl.startsWith('prisma+postgresql://')) {
  // Extract the underlying PostgreSQL connection string
  // Prisma Accelerate URLs encode the actual connection in the api_key parameter
  try {
    const url = new URL(databaseUrl.replace('prisma+', ''))
    const apiKey = url.searchParams.get('api_key')
    
    if (apiKey) {
      // Decode the API key which contains the actual database URL
      try {
        const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString())
        if (decoded.databaseUrl) {
          databaseUrl = decoded.databaseUrl
        } else if (decoded.shadowDatabaseUrl) {
          databaseUrl = decoded.shadowDatabaseUrl
        }
      } catch {
        // If decoding fails, try to construct from URL parts
        databaseUrl = `postgresql://${url.hostname}:${url.port || '5432'}${url.pathname || '/postgres'}`
      }
    } else {
      // No api_key, try to use URL directly
      databaseUrl = `postgresql://${url.hostname}:${url.port || '5432'}${url.pathname || '/postgres'}`
    }
  } catch (error) {
    console.warn('Failed to parse Prisma Accelerate URL, using as-is:', error)
    // Fallback: remove prisma+ prefix
    databaseUrl = databaseUrl.replace(/^prisma\+/, '')
  }
}

// Create PostgreSQL connection pool with error handling
const pool = new Pool({
  connectionString: databaseUrl,
  // Add connection timeout and retry settings
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000,
  max: 10, // Maximum number of clients in the pool
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err)
  // Don't throw here - let individual queries handle errors
})

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool)

// Initialize PrismaClient with adapter
// Prisma 7 requires either adapter or accelerateUrl for "client" engine type
export const db: PrismaClient = globalForPrisma.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Cache PrismaClient globally to prevent connection pool exhaustion
// This singleton pattern is critical for both development and production
// Without it, each module execution creates a new PrismaClient instance,
// leading to exhausted database connection pools and runtime failures
globalForPrisma.prisma = db

// Helper function to test database connection
// This can be called during app startup to validate connectivity
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error(
          '\n❌ Database connection refused. Please check:\n' +
          '  1. Is your database running? (If using local Supabase: run `supabase start`)\n' +
          '  2. Is DATABASE_URL correct in your .env.local file?\n' +
          '  3. Can you connect to the database using the connection string?\n'
        )
      }
    }
    return false
  }
}

