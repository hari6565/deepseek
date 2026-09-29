'use client'
import React, { useEffect, useState } from 'react'
import ForgotPassword from './ForgotPassword'
import { AxiosService } from '../components/axiosService'

const Page = () => {
  const isSaasApp = process.env.NEXT_PUBLIC_IS_SAAS_APPLICATION
  const [appTenantList, setAppTenantList] = useState([])

  const handleGetAppSubTenants = async () => {
    const appTenants = await AxiosService.get('UF/app-tenant-app', {
      validateStatus: () => true
    })
    if (appTenants.status == 200) {
      setAppTenantList(appTenants.data)
      return
    }
    setAppTenantList([])
    return
  }
  useEffect(() => {
    if (isSaasApp) {
      handleGetAppSubTenants()
    }
  }, [])

  return (
    <ForgotPassword
      logo=""  
      appName="TGW4"
      appTenantList={appTenantList}
    />
  )
}

export default Page