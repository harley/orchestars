import { BasePayload } from 'payload'
import { Log } from '@/payload-types'
import { userAgent } from 'next/server'
import { headers } from 'next/headers'

type LogStatus = 'success' | 'error' | 'warning' | 'info'

interface WriteLogParams {
  payload: BasePayload
  action: string
  description?: string
  status?: LogStatus
  data?: Record<string, any>
  order?: number | null
  payment?: number | null
  user?: number | { id: number } | null
  ipAddress?: string
  req?: any // Optional request object to extract IP address
}

/**
 * Creates a log entry in the Logs collection
 *
 * @param params - Parameters for creating the log entry
 * @returns The created log entry or null if an error occurred
 */
export const writeLog = async ({
  payload,
  action,
  description,
  status = 'info',
  data,
  order,
  payment,
  user,
  ipAddress,
  req,
}: WriteLogParams): Promise<Log | null> => {
  try {
    // Extract user ID if user is an object
    const userId = user && typeof user === 'object' ? user.id : user

    // Extract IP address from request if provided and not explicitly set
    const headersList = await headers()
    const ip = ipAddress || headersList.get('request-ip') || headersList.get('x-forwarded-for')

    const userAgentData = req && (userAgent(req) || req.headers.get('user-agent') || '')

    // Create log data object with all fields that match the Log type
    const logData: Record<string, any> = {
      action,
      description,
      status,
      timestamp: new Date().toISOString(),
      data,
      order: order || undefined,
      payment: payment || undefined,
      ipAddress: ip,
      userAgent: userAgentData && JSON.stringify(userAgentData),
    }

    // Add user field if provided (will be handled by Payload even if not in the type)
    if (userId) {
      logData.user = userId
    }

    // Remove undefined values
    Object.keys(logData).forEach((key) => {
      if (logData[key as keyof typeof logData] === undefined) {
        delete logData[key as keyof typeof logData]
      }
    })

    const result = await payload.create({
      collection: 'logs',
      data: logData as any,
    })

    return result
  } catch (error) {
    console.error('Error creating log entry:', error)

    // todo
    // if write log error should be write to file or sentry log or honeybadger

    return null
  }
}

/**
 * Creates a success log entry
 */
export const logSuccess = (params: Omit<WriteLogParams, 'status'>) =>
  writeLog({ ...params, status: 'success' })

/**
 * Creates an error log entry
 */
export const logError = (params: Omit<WriteLogParams, 'status'>) =>
  writeLog({ ...params, status: 'error' })

/**
 * Creates a warning log entry
 */
export const logWarning = (params: Omit<WriteLogParams, 'status'>) =>
  writeLog({ ...params, status: 'warning' })

/**
 * Creates an info log entry
 */
export const logInfo = (params: Omit<WriteLogParams, 'status'>) =>
  writeLog({ ...params, status: 'info' })
