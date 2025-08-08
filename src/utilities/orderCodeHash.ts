import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ORDER_CODE_SECRET || 'default-secret-key-32-characters';
const ALGORITHM = 'aes-256-ctr'
const SALT = process.env.ORDER_CODE_SALT || 'orchestars-order-salt-2024'

function getKey(): Buffer {
  return crypto.scryptSync(ENCRYPTION_KEY, SALT, 32);
}

export function encodeOrderCode(orderCode: string, userId: number): string {
  try {
    const combined = `${orderCode}:${userId}`
    const key = getKey()
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(combined, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Combine IV and encrypted data, then base64 encode for URL safety
    const result = iv.toString('hex') + ':' + encrypted
    return Buffer.from(result).toString('base64url') // base64url is URL-safe
  } catch (error) {
    console.error('Error encoding order code:', error)
    throw new Error('Failed to encode order code')
  }
}

export function decodeOrderCode(encodedString: string): { orderCode: string; userId: number } | null {
  try {
    // Decode from base64url
    const decoded = Buffer.from(encodedString, 'base64url').toString('utf8')
    const [ivHex, encrypted] = decoded.split(':')
    
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encoded string format')
    }
    
    const key = getKey()
    const iv = Buffer.from(ivHex, 'hex')
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    // Split back into orderCode and userId
    const [orderCode, userIdStr] = decrypted.split(':')
    const userId = parseInt(userIdStr || '', 10)
    
    if (!orderCode || isNaN(userId)) {
      throw new Error('Invalid decrypted data format')
    }
    
    return { orderCode, userId }
  } catch (error) {
    console.error('Error decoding order code:', error)
    return null
  }
}