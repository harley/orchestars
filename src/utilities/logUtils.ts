const sanitize = (value: any): any => {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string') {
    return value.replace(/[\r\n]/g, '')
  }

  if (typeof value === 'object') {
    const newObj: { [key: string]: any } = {}
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        newObj[key] = sanitize(value[key])
      }
    }
    return newObj
  }

  return value
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