import { toZonedTime, format as tzFormat } from 'date-fns-tz'

export const formatLocalizedDate = (
  dateTime: string | Date,
  options?: {
    timezone?: string
    format?: string
  },
): string => {
  const timezone = options?.timezone || 'Asia/Ho_Chi_Minh'
  const format = options?.format || 'dd/MM/yyyy'
  return tzFormat(toZonedTime(new Date(dateTime), timezone), format)
}
