export const generateCode = (prefix: string, options?: { timestampLength?: number }): string => {
  let timestampLength = options?.timestampLength || 6
  timestampLength = timestampLength > 13 || timestampLength < 1 ? 6 : timestampLength
  timestampLength = -timestampLength

  const timestamp = Date.now().toString().slice(timestampLength) // Last 6 digits of the timestamp
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() // 4-character random string

  return `${prefix}-${timestamp}-${randomPart}`
}
