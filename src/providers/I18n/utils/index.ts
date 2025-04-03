export const translate = (
  key: string,
  messages: Record<string, any>,
  params?: Record<string, any>,
) => {
  if (!key || !messages) return key

  // Handle nested keys like 'user.greeting'
  const parts = key.split('.')
  let result: any = messages

  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part]
    } else {
      return key // Fallback to key if translation not found
    }
  }

  if (typeof result !== 'string') return key

  // Replace parameters in the translation string
  if (params) {
    return result.replace(/\{\{(\w+)\}\}/g, (_match: string, paramName: string) => {
      return params[paramName] !== undefined ? String(params[paramName]) : _match
    })
  }

  return result
}
