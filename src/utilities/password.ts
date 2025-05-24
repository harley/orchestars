import crypto from 'crypto'

const ITERATIONS = 25000
const KEYLEN = 512
const DIGEST = 'sha256'
const SALT_BYTES = 32

export async function generateSalt() {
  return new Promise<string>((resolve, reject) => {
    crypto.randomBytes(SALT_BYTES, (err, saltBuffer) => {
      if (err) return reject(err)
      resolve(saltBuffer.toString('hex'))
    })
  })
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS, KEYLEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err)
      resolve(derivedKey.toString('hex'))
    })
  })
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password, salt)
  return hashed === hash
} 