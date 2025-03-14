export function generatePassword(length: number = 12): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?'
  let password = ''
  const randomValues = new Uint32Array(length)
  if (crypto && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
  }

  for (let i = 0; i < length; i++) {
    password += chars[(randomValues[i] || 1) % chars.length]
  }

  return password
}
