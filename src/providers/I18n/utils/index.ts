export const translate = (key: string, messages: Record<string, any>) => {
  if (!key || !messages) return key

  // Handle nested keys like 'user.greeting'
  const parts = key.split('.')
  let result = messages

  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part]
    } else {
      return key // Fallback to key if translation not found
    }
  }

  return typeof result === 'string' ? result : key
}
