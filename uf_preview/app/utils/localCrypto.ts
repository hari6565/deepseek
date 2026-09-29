'use server'
import * as crypto from 'crypto'

const encryptCredentials = {
  Key: process.env.ENCRYPTIONKEY || '',
  IVlength: process.env.ENCRYPTIONIVLENGTH || '',
  mode: process.env.ENCRYPTIONMODE || ''
}
const isGcmMode = encryptCredentials.mode.toLowerCase().includes('gcm')

export async function localEncrypt( encrypt: any ) {
  try {
  const key = Buffer.from(encryptCredentials.Key, 'base64')
  // Fresh random IV per call (not the static per-tenant config value) —
  // reusing the IV/key pair leaks plaintext relationships in CTR mode and
  // is worse for GCM (authentication key recovery). The IV (and, for GCM,
  // the auth tag) is embedded ahead of the ciphertext since this function
  // has no separate metadata channel to carry it in.
  const iv = crypto.randomBytes(16)
  const cipher: any = crypto.createCipheriv(encryptCredentials.mode, key, iv)
  let ciphertext = cipher.update(JSON.stringify(encrypt), 'utf8', 'base64')
  ciphertext += cipher.final('base64')

  if (isGcmMode) {
    const authTag = cipher.getAuthTag().toString('base64')
    return `${iv.toString('base64')}:${authTag}:${ciphertext}`
  }
  return `${iv.toString('base64')}:${ciphertext}`
  } catch (error) {
    throw new Error(`Local Encryption Error: ${error}`)
  }
}
export async function localDecrypt(ciphertext: any) {
    try {
  const key = Buffer.from(encryptCredentials.Key, 'base64')

  // Legacy ciphertexts (encrypted before the per-call random IV fix) carry
  // no embedded IV and fall back to the static per-tenant config IV they
  // were originally encrypted with. ':' never appears in base64 output, so
  // splitting on it safely distinguishes the two formats.
  const parts = String(ciphertext).split(':')
  const expectedParts = isGcmMode ? 3 : 2
  let iv: Buffer
  let authTag: Buffer | undefined
  let encryptedBase64: string
  if (parts.length === expectedParts) {
    iv = Buffer.from(parts[0], 'base64')
    encryptedBase64 = isGcmMode ? parts[2] : parts[1]
    if (isGcmMode) authTag = Buffer.from(parts[1], 'base64')
  } else {
    iv = Buffer.from(encryptCredentials.IVlength, 'base64')
    encryptedBase64 = String(ciphertext)
  }

  const decipher: any = crypto.createDecipheriv(encryptCredentials.mode, key, iv)
  if (isGcmMode && authTag) decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return JSON.parse(decrypted)
  } catch (error) {
    throw new Error(`Local Decryption Error: ${error}`)
  }
}