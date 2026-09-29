'use server'
import vault from 'node-vault';
import { publicEncrypt } from 'crypto';
import * as crypto from 'crypto';
import getEnvData from '../getEnvData';
import { localEncrypt } from '../utils/localCrypto';


export async function decryptData(value:any, dpdKey:string) {
      try {       
        let Credentials: any = {};
        let deploymentData =  await getEnvData(dpdKey,"vault");
        for (let i = 0; i < deploymentData.encryptionInfo.items.length; i++) {
        if (deploymentData.encryptionInfo.items[i].type === "vault") {
          Credentials = deploymentData.encryptionInfo.items[i];       
          }
        }
        const Method = Credentials.type;
        const context = "ct001_tgw01_tgw004_v1";
        let getCredentials: any = {
          encCredentials:Credentials,
          encMethod:Method
          }
        if (getCredentials) {
          let encryptCredentials = getCredentials?.encCredentials
          let encMethod = getCredentials?.encMethod
    
          if (encMethod && encryptCredentials) {
            if (encMethod === 'vault') {
              const vaultClient = vault({
                apiVersion: 'v1',
                endpoint: encryptCredentials.url,
                token: encryptCredentials.token
              })
              let ciphertext = value.ciphertext
              const result = await vaultClient.write(
                `transit/decrypt/${encryptCredentials.key}`,
                {
                  ciphertext, // value should be the ciphertext string from Vault
                  context: Buffer.from(context).toString(
                    'base64'
                  )
                }
              )
    
              let decoded = Buffer.from(result.data.plaintext, 'base64').toString(
                'utf8'
              )
              let res = JSON.parse(JSON.parse(decoded))    
              res = await localEncrypt(res)
              return res
            } else {
              throw 'Invalied Decryption Method'
            }
          }
        }
      } catch (error: any) {
        return{ error: 'Decryption failed' , status: 500 }
      }
}