export function getDateRangeFromTimeRange(timeRange: string) {
  const endDate = new Date()
  const startDate = new Date()

  switch (timeRange) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    default:
      startDate.setDate(endDate.getDate() - 30)
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  }
}