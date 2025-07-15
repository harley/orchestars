import { getPayload } from '@/payload-config/getPayloadConfig'
import { sql } from '@payloadcms/db-postgres'

interface ConnectionStats {
  activeConnections: number
  totalConnections: number
  maxConnections: number
  poolUsagePercent: number
  timestamp: number
}

class DatabaseConnectionMonitor {
  private stats: ConnectionStats[] = []
  private maxHistorySize = 100

  /**
   * Get current connection pool status from Supabase
   */
  async getConnectionStats(): Promise<ConnectionStats | null> {
    try {
      const payload = await getPayload()
      
      // Query pg_stat_activity to get connection info  
      const result = await payload.db.drizzle.execute(sql`
        SELECT 
          COUNT(*) as active_connections,
          (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
        FROM pg_stat_activity 
        WHERE state = 'active'
      `)

      const rows = (result as { rows: any[] }).rows
      if (!rows.length) return null

      const stats: ConnectionStats = {
        activeConnections: rows[0].active_connections,
        totalConnections: rows[0].active_connections, // Approximation for Supabase
        maxConnections: rows[0].max_connections || 15, // Default to Supabase small tier
        poolUsagePercent: Math.round((rows[0].active_connections / (rows[0].max_connections || 15)) * 100),
        timestamp: Date.now()
      }

      // Store in history
      this.stats.push(stats)
      if (this.stats.length > this.maxHistorySize) {
        this.stats.shift()
      }

      return stats
    } catch (error) {
      console.error('Failed to get connection stats:', error)
      return null
    }
  }

  /**
   * Check if connection pool is under stress
   */
  async isPoolUnderStress(): Promise<boolean> {
    const stats = await this.getConnectionStats()
    return stats ? stats.poolUsagePercent > 80 : false
  }

  /**
   * Log connection warning when pool usage is high
   */
  async logConnectionWarning(): Promise<void> {
    const stats = await this.getConnectionStats()
    if (stats && stats.poolUsagePercent > 80) {
      console.warn(`🔴 Database connection pool warning: ${stats.poolUsagePercent}% usage (${stats.activeConnections}/${stats.maxConnections})`)
      
      if (stats.poolUsagePercent > 95) {
        console.error(`🚨 CRITICAL: Connection pool near exhaustion! Consider upgrading Supabase tier or optimizing queries.`)
      }
    }
  }

  /**
   * Get connection history for monitoring
   */
  getConnectionHistory(): ConnectionStats[] {
    return [...this.stats]
  }

  /**
   * Get average pool usage over last N minutes
   */
  getAverageUsage(minutes: number = 5): number {
    const cutoff = Date.now() - (minutes * 60 * 1000)
    const recentStats = this.stats.filter(s => s.timestamp > cutoff)
    
    if (!recentStats.length) return 0
    
    const sum = recentStats.reduce((acc, stat) => acc + stat.poolUsagePercent, 0)
    return Math.round(sum / recentStats.length)
  }
}

// Singleton instance
export const dbConnectionMonitor = new DatabaseConnectionMonitor()

/**
 * Middleware to monitor connection usage during check-in operations
 */
export async function withConnectionMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string = 'unknown'
): Promise<T> {
  const startTime = Date.now()
  
  try {
    // Check pool status before operation
    await dbConnectionMonitor.logConnectionWarning()
    
    const result = await operation()
    
    const duration = Date.now() - startTime
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation '${operationName}' took ${duration}ms`)
    }
    
    return result
  } catch (error) {
    console.error(`❌ Operation '${operationName}' failed after ${Date.now() - startTime}ms:`, error)
    throw error
  }
}

/**
 * Connection Pool Optimization Recommendations
 */
export const CONNECTION_POOL_TIPS = {
  SUPABASE_SMALL_TIER: {
    maxConnections: 15,
    recommendations: [
      'Use connection pooling middleware for API routes',
      'Implement query batching where possible', 
      'Use read replicas for non-critical queries',
      'Consider upgrading to Pro tier (25 connections) for high-traffic events',
      'Monitor connection usage during peak check-in times'
    ]
  },
  
  QUERY_OPTIMIZATION: [
    'Use indexes on frequently queried columns (ticket_code, etc.)',
    'Avoid N+1 queries by using JOINs or batching',
    'Use LIMIT clauses to reduce result set size',
    'Implement proper connection timeout settings',
    'Use prepared statements for repeated queries'
  ],

  VERCEL_SERVERLESS: [
    'Each Vercel function can hold connections open',
    'Cold starts may create new connections',
    'Consider using connection pooling services like PgBouncer',
    'Monitor function concurrency during events'
  ]
}

/**
 * Log optimization recommendations
 */
export function logOptimizationTips(): void {
  console.log('📊 Database Connection Pool Optimization Tips:')
  console.log('1. Current Supabase small tier: 15 max connections')
  console.log('2. Upgrade to Pro tier for 25 connections during events')
  console.log('3. Monitor pool usage with dbConnectionMonitor.getConnectionStats()')
  console.log('4. Optimize queries with proper indexes')
  console.log('5. Use connection monitoring middleware for critical operations')
} 