'use server'

import * as crypto from 'crypto';
import getEnvData from '../getEnvData'
import { normalizePem } from './normalizePem'
import { rsaDecryptChunked } from './rsaBlockCrypto'

// Runs as a Next.js Server Action: the function body — including the
// getEnvData() lookup that resolves the tenant's AES key / RSA private key —
// executes only on the server. The browser bundle only ever sees an RPC
// stub, never the key material or getEnvData's contents.
export async function clientDecrypt(dpdKey: string, method: string, value: any, context: string) {
      try {
        const deploymentData: any = await getEnvData(dpdKey, method)
        let encryptCredentials: any
        for (let i = 0; i < deploymentData.encryptionInfo.items.length; i++) {
          if (deploymentData.encryptionInfo.items[i].type === method) {
            encryptCredentials = deploymentData.encryptionInfo.items[i]
          }
        }

        if (encryptCredentials) {
            if (method == 'AESCTR') {
              const key = Buffer.from(encryptCredentials.Key, 'base64')
              // value.iv is only present for ciphertexts produced after the
              // per-call random IV fix; fall back to the legacy static
              // config IV for anything encrypted before it.
              const iv = value?.iv
                ? Buffer.from(value.iv, 'base64')
                : Buffer.from(encryptCredentials.IVlength, 'base64')

              const encryptedBase64 = value.ciphertext
              const decipher = crypto.createDecipheriv(
                encryptCredentials.mode,
                key,
                iv
              )

              let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8')
              decrypted += decipher.final('utf8')

              return   JSON.parse(JSON.parse(decrypted))
            } else if (method == 'AESGCM') {
              const key = Buffer.from(encryptCredentials.Key, 'base64')
              // See AESCTR branch above — legacy fallback for pre-fix data.
              const iv = value?.iv
                ? Buffer.from(value.iv, 'base64')
                : Buffer.from(encryptCredentials.IVlength, 'base64')
              const encryptedBase64 = value.ciphertext
              const authTag = value?.authTag

              const decipher = crypto.createDecipheriv(encryptCredentials.mode,key,iv)
              decipher.setAuthTag(Uint8Array.from(Buffer.from(authTag, 'base64')));
              let decrypted = decipher.update(JSON.stringify(encryptedBase64),'base64','utf8')

              decrypted += decipher.final('utf8')

              return   JSON.parse(JSON.parse(decrypted))
            } else if (method == 'RSA') {
              try {
              const encryptedBase64 = value.ciphertext
              const decrypted = rsaDecryptChunked(
                normalizePem(encryptCredentials.privateKey),
                Buffer.from(encryptedBase64, 'base64')
              ).toString('utf8')
              return JSON.parse(JSON.parse(decrypted))
              } catch (error) {
              console.error('Decryption error:', error)
              throw error
              }
            } else {
              throw 'Invalied Decryption Method'
            }
        }
      } catch (error: any) {
        return{ error: 'Decryption failed' , status: 500 }
      }
}
