const sanitize = <T>(value: T, seen = new WeakSet()): T => {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string') {
    return value.replace(/[\r\n]/g, '') as any
  }

  if (typeof value !== 'object') {
    return value
  }

  if (seen.has(value as object)) {
    return '[Circular Reference]' as any
  }
  seen.add(value as object)

  if (Array.isArray(value)) {
    return value.map(item => sanitize(item, seen)) as any
  }

  const newObj: { [key: string]: any } = {}
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      newObj[key] = sanitize((value as any)[key], seen)
    }
  }
  return newObj as any
}

export const sanitizeLog = (error: unknown): string => {
  if (error instanceof Error) {
    const sanitizedError = new Error()
    sanitizedError.message = sanitize(error.message)
    sanitizedError.name = sanitize(error.name)
    sanitizedError.stack = sanitize(error.stack)

    // Using JSON.stringify to get a string representation of the sanitized error
    return JSON.stringify(sanitize(sanitizedError))
  }
  if (typeof error === 'object') {
    return JSON.stringify(sanitize(error))
  }
  return String(sanitize(error))
} 