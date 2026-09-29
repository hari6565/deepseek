'use server'
import vault from 'node-vault';
import { localDecrypt } from '../utils/localCrypto';
import getEnvData from '../getEnvData';

// dpdKey identifies the tenant/deployment only — it carries no secret.
// The Vault url/key/token are resolved here, server-side, via getEnvData;
// they are never accepted from (or trusted from) the caller.
export async function encryptData(dpdKey: string, ciphertext: any) {
    try {
        const body = await localDecrypt(ciphertext)
        const { value, context } = body;

        let Credentials: any = {};
        let deploymentData: any = await getEnvData(dpdKey, "vault");
        for (let i = 0; i < deploymentData.encryptionInfo.items.length; i++) {
          if (deploymentData.encryptionInfo.items[i].type === "vault") {
            Credentials = deploymentData.encryptionInfo.items[i];
          }
        }

        if (Credentials?.type === 'vault') {
          const vaultClient = vault({
            apiVersion: 'v1',
            endpoint: Credentials.url,
            token: Credentials.token,
          });
          const result = await vaultClient.write(`transit/encrypt/${Credentials.key}`, {
            plaintext: Buffer.from(JSON.stringify(value)).toString('base64'),
            context:Buffer.from(context).toString('base64')
          });
          return  result.data.ciphertext ;
        }else{
          throw 'Invalied Encryption Method'
        }
      } catch (error: any) {
        console.error('Vault encryption error:', error);
        return { error: 'Encryption failed' ,status: 500 };
      }
}
