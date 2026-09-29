import axios from 'axios'
// encrypt/decrypt/clientEncrypt/clientDecrypt are 'use server' actions: their
// bodies (and the getEnvData() key lookups inside them) run only on the
// server. This file never imports getEnvData or resolves key material itself
// — it only ever forwards the tenant-identifying dpdKey/method across the
// server action boundary.
import { encryptData } from '../utils/encrypt'
import { decryptData } from '../utils/decrypt'
import { clientDecrypt } from '../utils/clientDecrypt'
import { clientEncrypt } from '../utils/clientEncrypt'
import {localEncrypt, localDecrypt} from '../utils/localCrypto'
const url = process.env.NEXT_PUBLIC_API_BASE_URL

const AxiosService = axios.create({
  baseURL: url,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

AxiosService.interceptors.request.use(
  async (config) => {
     if (config.data && ['post', 'put', 'patch'].includes(config.method || '') && config.data.dpdKey && config.data.method ) {
      let dpdKey = config.data.dpdKey
      let method = config.data.method
      let authTag: any
      let iv: any
      delete config.data.dpdKey
      delete config.data.method
      let ciphertext : any;
      if(method == "vault"){
        const wrapped = await localEncrypt({ value: config.data, context: "ct001_tgw01_tgw004_v1" })
        ciphertext = await encryptData(dpdKey, wrapped)
      }else{
        ciphertext = await clientEncrypt(dpdKey, method, config.data, "ct001_tgw01_tgw004_v1")
      }
      if(method == "AESGCM" || method == "AESCTR"){
        // clientEncrypt now generates a fresh random IV per call instead of
        // reusing the static per-tenant config IV, so it must travel with
        // the ciphertext for clientDecrypt to reverse it.
        authTag = ciphertext?.authTag
        iv = ciphertext?.iv
        ciphertext = ciphertext?.ciphertext
      }
      config.data = JSON.stringify({ ciphertext, dpdKey , method, authTag, iv}) // send { encrypted: <value> }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

AxiosService.interceptors.response.use(
  async(response:any) => {
    if ( response.data.dpdKey && response.data.method ) {
      let dpdKey = response.data.dpdKey
      let method = response.data.method
      delete response.data.dpdKey
      delete response.data.method

      if(method == "vault"){
        let vault = await decryptData(response.data, dpdKey)
        response.data = await localDecrypt(vault)
      }else{
        response.data = await clientDecrypt(dpdKey, method, response.data, "ct001_tgw01_tgw004_v1")
      }
    }
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

export { AxiosService }

