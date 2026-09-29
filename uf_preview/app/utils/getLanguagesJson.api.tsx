'use server'

import { fetchAMDKey } from './fetchAMDKey.api'

export const getLanguagesJson = async (languageCode: string, token: string) => {
  const languageJsonKey = `CK:TGA:FNGK:SETUP:FNK:LOCALE:CATK:${process.env.NEXT_PUBLIC_TENANT_CODE}:AFGK:${process.env.NEXT_PUBLIC_APPGROUPCODE}:AFK:${process.env.NEXT_PUBLIC_APPCODE}:AFVK:v1:${languageCode}`
  const language = await fetchAMDKey(languageJsonKey, token, {})
  return {language}
}
