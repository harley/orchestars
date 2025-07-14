// GET /api/checkin-app/monitor
// Performance monitoring endpoint for QR check-in system

import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/utilities/getAdminUser'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { dbConnectionMonitor } from '@/utilities/dbConnectionMonitor'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { sql } from '@payloadcms/db-postgres'

export async function GET(_req: NextRequest) {
  try {
    const adminUser = await getAdminUser()

    if (
      !adminUser ||
      !isAdminOrSuperAdminOrEventAdmin({
        req: { user: adminUser },
      })
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload()

    // Get current connection stats
    const connectionStats = await dbConnectionMonitor.getConnectionStats()
    const avgUsage = dbConnectionMonitor.getAverageUsage(10) // Last 10 minutes

    // Get recent check-in performance metrics
    const recentCheckins = await payload.db.drizzle.execute(sql`
      SELECT 
        COUNT(*) as total_checkins,
        COUNT(*) FILTER (WHERE check_in_time > NOW() - INTERVAL '1 hour') as checkins_last_hour,
        COUNT(*) FILTER (WHERE check_in_time > NOW() - INTERVAL '10 minutes') as checkins_last_10min,
        COUNT(DISTINCT checked_in_by_id) as active_admins
      FROM checkin_records 
      WHERE deleted_at IS NULL 
        AND check_in_time > NOW() - INTERVAL '24 hours'
    `)

    const checkinRows = (recentCheckins as { rows: any[] }).rows || []
    const checkinStats = checkinRows[0] || {}

    // Get database performance metrics
    const dbPerformance = await payload.db.drizzle.execute(sql`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as db_size,
        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
        (SELECT AVG(total_exec_time) FROM pg_stat_statements WHERE query LIKE '%tickets%' LIMIT 5) as avg_ticket_query_time
    `)

    const perfRows = (dbPerformance as { rows: any[] }).rows || []
    const perfStats = perfRows[0] || {}

    // Performance recommendations based on current state
    const recommendations: Array<{
      type: 'critical' | 'warning' | 'info'
      message: string
      action: string
    }> = []
    
    if (connectionStats && connectionStats.poolUsagePercent > 80) {
      recommendations.push({
        type: 'critical',
        message: `Connection pool usage high: ${connectionStats.poolUsagePercent}%`,
        action: 'Consider upgrading Supabase tier or reducing concurrent operations'
      })
    }

    if (avgUsage > 60) {
      recommendations.push({
        type: 'warning', 
        message: `Average connection usage high: ${avgUsage}%`,
        action: 'Monitor for connection pool exhaustion during peak times'
      })
    }

    if (checkinStats.checkins_last_10min > 50) {
      recommendations.push({
        type: 'info',
        message: 'High check-in volume detected',
        action: 'Monitor system performance and connection usage'
      })
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      connectionStats: {
        current: connectionStats,
        averageUsage: avgUsage,
        history: dbConnectionMonitor.getConnectionHistory().slice(-20) // Last 20 data points
      },
      checkinStats: {
        totalCheckins: parseInt(checkinStats.total_checkins) || 0,
        checkinsLastHour: parseInt(checkinStats.checkins_last_hour) || 0,
        checkinsLast10Min: parseInt(checkinStats.checkins_last_10min) || 0,
        activeAdmins: parseInt(checkinStats.active_admins) || 0
      },
      databaseStats: {
        size: perfStats.db_size || 'unknown',
        activeConnections: parseInt(perfStats.active_connections) || 0,
        idleConnections: parseInt(perfStats.idle_connections) || 0,
        avgTicketQueryTime: parseFloat(perfStats.avg_ticket_query_time) || null
      },
      recommendations,
      optimizationTips: {
        singleApiCall: 'Use /api/checkin-app/scan/ for combined validation + check-in',
        clientCaching: 'Client-side debouncing and caching implemented',
        indexes: 'Optimized database indexes for QR scanning',
        monitoring: 'Connection pool monitoring active'
      }
    })

  } catch (error) {
    console.error('Monitor endpoint error:', error)
    return NextResponse.json({ 
      error: 'Failed to get monitoring data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 