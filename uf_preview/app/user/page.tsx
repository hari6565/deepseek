

'use client'
import React, { useEffect } from 'react'
import SetupScreen from './components'
import { AxiosService } from '../components/axiosService'
import {
  deleteAllCookies,
  setCookie
} from '../components/cookieMgment'
import { useRouter } from 'next/navigation'
import decodeToken from '../components/decodeToken'
import { useGlobal } from '@/context/GlobalContext'


function page() {
  const { token } = useGlobal();
  const decodedToken = decodeToken(token)
  const router = useRouter()
  
  const logout = () => {
    localStorage.clear();
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const from = encodeURIComponent(`${basePath}/`);
    window.location.href = `${basePath}/next-api/auth/logout?from=${from}`;
  };

  const securityCheck = async () => {
    try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const res = await fetch(`${basePath}/next-api/auth/introspect?key=Logs Screen`)
    if (!res.ok) {
      logout()
      return
    }
    router.refresh()

    if (!decodedToken.selectedAccessProfile) {
      router.push('/select-context')
    }
      
    } catch (err: any) {
      logout()
    }
  }

  useEffect(() => {
    if (token) {
      securityCheck()
    }
  }, [])

  return (
    <div>
      <SetupScreen />
    </div>
  )
}

export default page