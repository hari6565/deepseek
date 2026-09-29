import React from 'react'
import AppHub from './components/AppHub'
import { cookies } from 'next/headers'
import { AxiosService } from '../components/axiosService'
import { COOKIE_PREFIX } from '@/lib/cookies'

const page = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(`${COOKIE_PREFIX}_token`)?.value;

  const getAllAppList = async () => {
    try {
      const response = await AxiosService.get('UF/app-list', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data
      } else {
        return []
      }
    } catch (error) {
      console.error(error)
      return []
    }
  }
  const appList = (await getAllAppList()) ?? []

  return (
    <div>
      <AppHub appList={appList} />
    </div>
  )
}

export default page
