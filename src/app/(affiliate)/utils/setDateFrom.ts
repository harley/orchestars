import { NextRequest, NextResponse } from 'next/server'
export const setDateFrom = async (req: NextRequest) => {
  // Get time range param
  const { searchParams } = new URL(req.url)
  const timeRange = searchParams.get('timeRange')

  // Set dateFrom based on timeRange
  let dateFrom: Date | undefined
  if (timeRange === '6m') {
    dateFrom = new Date()
    dateFrom.setMonth(dateFrom.getMonth() - 6)
  } else if (timeRange === '3m') {
    dateFrom = new Date()
    dateFrom.setMonth(dateFrom.getMonth() - 3)
  } else if (timeRange === '1m') {
    dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - 30)
  } else if (timeRange === '1y') {
    dateFrom = new Date()
    dateFrom.setMonth(dateFrom.getMonth() - 12)
  }
  return dateFrom
}
