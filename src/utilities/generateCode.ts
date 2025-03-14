export const generateCode = (prefix: string): string => {
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits of the timestamp
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() // 4-character random string

  return `${prefix}-${timestamp}-${randomPart}`
}
