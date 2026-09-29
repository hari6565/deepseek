'use server'

//import { signIn } from '@/auth'
import { AxiosService } from '../components/axiosService'
import { cookies } from 'next/headers'

export const singleSignOn = async (provider: 'google' | 'github' | 'fusionauth')  => {
  try {
   // await signIn(provider)
  } catch (error) {
    console.log(`this is error ${error}`)
    throw error
  }
}

export const postOauthUser = async (user: any) => {
  const cookieStore = await cookies()
  try {

    const response = await AxiosService.post(
      'UF/oauthSignIn',
      {
        user
      },
      {
        validateStatus: () => true
      }
    )

    if (response.status == 201) {
      cookieStore.set('token', response.data.token)
      return true
    } else {
      cookieStore.set(
        'server_error',
        response?.data?.message || 'oauth signin failed'
      )
      return false
    }
  } catch (error) {
    cookieStore.set('server_error', error ? `${error}` : 'oauth signin failed')
    return false
  }
}
