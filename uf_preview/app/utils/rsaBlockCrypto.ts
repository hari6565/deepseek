import * as crypto from 'crypto'

const OAEP_HASH = 'sha1'
const OAEP_HASH_LEN = 20 // sha1 digest length in bytes
const PADDING = crypto.constants.RSA_PKCS1_OAEP_PADDING

function keyByteLength(key: crypto.KeyObject): number {
  const modulusLength = key.asymmetricKeyDetails?.modulusLength
  if (!modulusLength) throw new Error('Unable to determine RSA modulus length')
  return Math.ceil(modulusLength / 8)
}

export function rsaEncryptChunked(publicKeyPem: string, plaintext: Buffer): Buffer {
  const key = crypto.createPublicKey(publicKeyPem)
  const blockSize = keyByteLength(key)
  const maxMessageLength = blockSize - 2 * OAEP_HASH_LEN - 2

  const bufferSize = plaintext.length
  const buffersCount = Math.ceil(bufferSize / maxMessageLength) || 1
  const dividedSize = Math.ceil(bufferSize / buffersCount || 1)

  const chunks: Buffer[] = []
  if (buffersCount === 1) {
    chunks.push(plaintext)
  } else {
    for (let i = 0; i < buffersCount; i++) {
      chunks.push(plaintext.subarray(i * dividedSize, (i + 1) * dividedSize))
    }
  }

  return Buffer.concat(
    chunks.map((chunk) =>
      crypto.publicEncrypt(
        { key, padding: PADDING, oaepHash: OAEP_HASH },
        Uint8Array.from(chunk)
      )
    )
  )
}

export function rsaDecryptChunked(privateKeyPem: string, ciphertext: Buffer): Buffer {
  const key = crypto.createPrivateKey(privateKeyPem)
  const blockSize = keyByteLength(key)

  if (ciphertext.length % blockSize > 0) {
    throw new Error('Incorrect data or key')
  }

  const buffersCount = ciphertext.length / blockSize
  const chunks: Buffer[] = []
  for (let i = 0; i < buffersCount; i++) {
    const offset = i * blockSize
    chunks.push(
      crypto.privateDecrypt(
        { key, padding: PADDING, oaepHash: OAEP_HASH },
        Uint8Array.from(ciphertext.subarray(offset, offset + blockSize))
      )
    )
  }

  return Buffer.concat(chunks)
}
