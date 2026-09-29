'use client'
import React, { useState } from 'react'
import { ArrowBackward, TorusLogo } from '../utils/svgApplications'
import Link from 'next/link'
import { isLightColor } from '../components/utils'
import OtpVerification from './OtpVerification'
import { AxiosService } from '../components/axiosService'
import { useInfoMsg } from '../components/infoMsgHandler'
import { Text } from '@/components/Text'
import { useTheme } from '@/hooks/useTheme'
import { useGlobal } from '@/context/GlobalContext'
import { getCdnImage } from '../utils/getAssets'
import { getFontSizeForHeader } from '../utils/branding'
import { Dropdown } from '@/components/Dropdown'
import i18n from '../components/i18n'
import clsx from 'clsx'
import Image from "next/image";

interface Props {
  logo: string
  appName: string
  appTenantList?: any[]
}

const ForgotPassword = ({ logo, appName, appTenantList }: Props) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    email: ''
  })
  const toast = useInfoMsg()
  const [isOtpReceive, setIsOtpReceive] = useState(false)
  const { isDark } = useTheme()
  const bgColor = isDark ? 'bg-black' : 'bg-white'
  const { branding } = useGlobal()
  const { brandColor } = branding
  const isSaasApp = process.env.NEXT_PUBLIC_IS_SAAS_APPLICATION
  const [selectedAppTenant , setSelectedAppTenant] = useState('')
  const keyset: any = i18n.keyset('language')
  const [otpResetToken, setOtpResetToken] = useState('')

  const handleGetOtp = async () => {
    try {
      const res = await AxiosService.post(`UF/getResetPasswordOtp`, {
        email: formData.email,
        tenantId: selectedAppTenant ? appTenantList?.find(item => item.tenant_name == selectedAppTenant)?.at_id : undefined
      })
      if (res.status === 201) {
        setOtpResetToken(res.data.id)
        setIsOtpReceive(true)
      }
    } catch (error: any) {
      toast(error?.response?.data?.message, 'danger')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className={(`g-root flex h-screen w-screen flex-col gap-[1vh] justify-center items-center`)}>
      <div className='flex w-full justify-center items-center font-semibold text-[1.5vw]'>
        {logo ? (
          <Image
            className='h-[3.5vw] w-[3.5vw] object-cover'
            width={100}
            height={100}
            src={getCdnImage(logo)}
            alt='logo'
          />
        ) : (
          <TorusLogo height='3.5vw' width='3.5vw' />
        )}
        {appName}
      </div>
      <div className={clsx("w-[23vw] rounded-lg shadow-2xl", bgColor)}>
        {isOtpReceive ? (
          <div>
            <OtpVerification
              email={formData.email}
              setIsOtpReceive={setIsOtpReceive}
              selectedAppTenant={selectedAppTenant}
              appTenantList={appTenantList}
              otpResetToken={otpResetToken}
              setOtpResetToken={setOtpResetToken}
            />
          </div>
        ) : (
          <div className={clsx('flex w-full h-full rounded-lg flex-col items-center justify-center py-[3vh] gap-[1.5vh]', bgColor)}>
            <div className='flex w-full flex-col items-center justify-center gap-[.5vh]'>
              <span className='font-bold text-[1.5vw]'>Forgot Password</span>
              <Text color='secondary' className='text-[.8vw]'>
                No worries, we&apos;ll send you instructions
              </Text>
            </div>
            <>
              {isSaasApp == 'true' && (
                <div className='flex flex-col gap-[1vh] w-[18vw]'>
                  <Dropdown
                    staticProps={appTenantList?.map(
                      (item: any) => item?.tenant_name
                    )}
                    value={selectedAppTenant}
                    onChange={val => setSelectedAppTenant(val as string)}
                    placeholder={keyset('Select Tenant')}
                    hasClear
                    static
                  />
                </div>
              )}
              <label className='flex w-[18vw] flex-col gap-[1vh] text-[.8vw] py-[1vh] font-medium'>
                Email
                <input
                  type='text'
                  name='email'
                  className='rounded-lg border px-[0.83vw] py-[1vh] text-[.8vw] font-medium outline-none'
                  placeholder='Enter your email'
                  onChange={handleInputChange}
                //   onKeyDown={e => {
                //     if (e.key === 'Enter') {
                //       handleFormSubmit()
                //     }
                //   }}
                />
              </label>
              <button
                style={{
                  backgroundColor: brandColor,
                  color: isLightColor(brandColor)
                }}
                className='w-[18vw] rounded-lg px-[0.83vw] py-[1vh] text-[15px] font-medium'
                onClick={() => handleGetOtp()}
                disabled={!formData.email}
              >
                Get Code
              </button>
              <Link
                href='/'
                className='flex items-center gap-[.5vw] text-[.8vw] py-[1vh] font-medium'
              >
                <ArrowBackward
                  opacity='1'
                  fill={isDark ? '#ffffff' : '#000000'}
                />{' '}
                Back to Login
              </Link>
            </>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
