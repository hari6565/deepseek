
'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { api_signinDto } from '../interfaces/interfaces'
import { useInfoMsg } from './infoMsgHandler'
import { setCookie } from './cookieMgment'
import { useRouter } from 'next/navigation'
import { DefaultLoginImage } from '../utils/svgApplications'
import { BsEyeFill, BsEyeSlash } from 'react-icons/bs'
import Link from 'next/link'
import decodeToken from './decodeToken'
import { Text } from '@/components/Text'
import { Button } from '@/components/Button'
import Spin from '@/components/Spin'
import { useGlobal } from '@/context/GlobalContext'
import { useTheme } from '@/hooks/useTheme'
import { twMerge } from 'tailwind-merge'
import i18n from './i18n'
import TorusFooter from '../utils/TorusFooter.png'
import Image from 'next/image'
import { getCdnImage } from '../utils/getAssets'
import { getFontSizeForDisplay, getFontSizeForHeader } from '../utils/branding'
import { Dropdown } from '@/components/Dropdown'

interface LoginProps {
  logo?: string
  appName?: string
  loginType?: 'standard' | 'rightAligned' | 'leftAligned'
  image?: string
  appTenantList?: any[]
}

const LoginForm = ({ logo, appName = "TGW4", loginType = "standard", image, appTenantList }: LoginProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const baseUrl: any = process.env.NEXT_PUBLIC_API_BASE_URL
  const toast = useInfoMsg()
  const router = useRouter()
  const { branding } = useGlobal()
  const { brandColor } = branding
  const { bgColor, borderColor, textColor } = useTheme()
  const onBoardingKey : string = "User Screen"
  const tenant = process.env.NEXT_PUBLIC_TENANT_CODE
  const isSaasApp = process.env.NEXT_PUBLIC_IS_SAAS_APPLICATION;
  const [imageandLogoValid, setImageandLogoValid] = useState({
    image: image ? true : false,
    logo: logo ? true : false
  })
  const [selectedAppTenant , setSelectedAppTenant] = useState('')
  const keyset: any = i18n.keyset('language')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async () => {
    try {
      if (tenant && formData.email && formData.password) {
        setLoading(true)

        setCookie('cfg_theme','light')

        const api_signinBody: api_signinDto = {
          tenant: tenant,
          username: formData.email,
          password: formData.password,
          key: "CK:TGA:FNGK:BLDC:FNK:DEV:CATK:CT001:AFGK:TGW01:AFK:TGW004:AFVK:v1:bldc",
          ufClientType: 'UFW',
          app_tenant: selectedAppTenant ? appTenantList?.find(item => item.tenant_name == selectedAppTenant)?.tenant_id : undefined,
          app_tenant_id: selectedAppTenant ? appTenantList?.find(item => item.tenant_name == selectedAppTenant)?.at_id : undefined
        }
        const api_signin = await axios.post(
          `${baseUrl}/UF/signin`,
          api_signinBody,
          {
            validateStatus: () => true
          }
        )

        if (api_signin.status == 201) {
          if (
            api_signin?.data?.token == null ||
            api_signin?.data?.token == undefined ||
            api_signin?.data?.authorized == null ||
            api_signin?.data?.authorized == undefined ||
            api_signin?.data?.email == null ||
            api_signin?.data?.email == undefined
          ) {
            toast('Invalid credentials', 'danger')
            setLoading(false)
            return
          }
          setCookie('language', 'en')
          let screenDetails: any = {
            keys:[
  {
    "screenName": "dddd",
    "screensName": "dddd-v1",
    "ufKey": "CK:CT001:FNGK:AF:FNK:UF-UFW:CATK:TGW01:AFGK:TGW004:AFK:barchart:AFVK:v1"
  }
]
          }
          const ORM: any = decodeToken(api_signin.data.token)
          sessionStorage.setItem(
            'organizationDetails',
            JSON.stringify({
              orgGrpCode: ORM.orgGrpCode,
              orgCode: ORM.orgCode,
              roleGrpCode: ORM.roleGrpCode,
              roleCode: ORM.roleCode,
              psGrpCode: ORM.psGrpCode,
              psCode: ORM.psCode
            })
          )
          screenDetails = screenDetails.keys
          let defaultScreen = ''
          if (onBoardingKey === 'User Screen') {
            defaultScreen = 'user'
          } else if (onBoardingKey === 'Logs Screen') {
            defaultScreen = 'logs'
          } else {
            screenDetails.forEach((screen: any) => {
              if (onBoardingKey === screen.ufKey) {
                defaultScreen = screen.screensName
              }
            })
            defaultScreen =
              defaultScreen.split('-')[0] +
              '_' +
              defaultScreen.split('-').at(-1)
          }
          setCookie('currentPage', JSON.stringify(defaultScreen))
          if (api_signin?.data?.redirectToORPSelector) {
            router.push('/select-context')
          } else {
            router.push('/' + defaultScreen)
          }
        } else {
          toast(
            api_signin.data.message || 'Error occured during login',
            'danger'
          )
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    } catch (error: any) {
      console.log(error)

      toast(error?.response?.data?.errorDetails, 'danger')
      if (error?.response) {
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
  }

  const bgImage = loginType === 'standard' && image ? getCdnImage(image) : undefined
  // const bgImage = `https://cdndfsdev.toruslowcode.com/buckets/torus/9.1/CT003/resources/images/Login%20-%20%20FinOne.png`

  return (
    <div
      className={'flex h-screen w-screen overflow-y-auto '}
      style={{
        flexDirection: loginType == 'leftAligned' ? 'row-reverse' : 'row'
      }}
    >
      {loginType !== 'standard' && (
        <div className='hidden h-full w-1/2 flex-col items-center justify-center md:flex'>
          {imageandLogoValid.image ? (
            <Image
              className='h-full w-full'
              src={getCdnImage(image as string)}
              alt='login'
              onError={() =>
                setImageandLogoValid({ ...imageandLogoValid, image: false })
              }
            />
          ) : (
            <DefaultLoginImage
              className='h-[80%] w-[80%]'
              brandColor={brandColor}
            />
          )}
        </div>
      )}

      <div
        style={{
          backgroundImage:
            loginType === 'standard' && image
              ? `url('${bgImage}')`
              : `linear-gradient(to bottom, ${brandColor}, #ffffff)`,
          backgroundSize:
            loginType === 'standard' && image ? 'cover' : undefined,
          backgroundPosition:
            loginType === 'standard' && image ? 'center' : undefined
        }}
        className={`flex h-full justify-center overflow-y-auto p-5 ${
          loginType !== 'standard' ? 'w-full md:w-1/2' : 'w-full'
        }`}
      >
        <div className='flex h-full flex-col justify-between'>
          <div className='flex h-4/5 flex-col items-center justify-center lg:gap-4 xl:gap-6 2xl:gap-8'>
            <div className='flex flex-col items-center justify-center gap-2'>
              {imageandLogoValid.logo ? (
                <Image
                  className='h-8 w-12 2xl:h-10 2xl:w-16'
                  width={100}
                  height={100}
                  src={getCdnImage(logo as string)}
                  alt='logo'
                  onError={() =>
                    setImageandLogoValid({ ...imageandLogoValid, logo: false })
                  }
                />
              ) : (
                <></>
              )}
              <Text variant={getFontSizeForDisplay(branding.fontSize)} className='text-center font-bold'>
                {appName}
              </Text>
            </div>
            <div
              className={twMerge(
                `flex h-fit min-w-[20vw] flex-col gap-3 rounded-xl px-5 pb-3 pt-4 2xl:pt-6 2xl:pb-6 shadow 2xl:min-w-[400px]`,
                bgColor,
                borderColor,
                textColor
              )}
            >
              <div className='flex flex-col items-center'>
                <Text variant={getFontSizeForHeader(branding.fontSize)} className='py-2 font-bold'>
                    Log in to your account
                </Text>
                <Text color='secondary'>
                  Enter your details to continue
                </Text>
              </div>
              {isSaasApp == 'true' &&
                <div className='flex flex-col gap-2'>
                  <Dropdown 
                    staticProps={
                      appTenantList?.map((item: any) => item?.tenant_name)
                    } 
                    value={selectedAppTenant}  
                    onChange={(val) => setSelectedAppTenant(val as string)} 
                    placeholder={keyset('Select Tenant')}
                    hasClear
                    static 
                    />
                </div>}
              <div className='flex flex-col gap-2'>
                <input
                  type='text'
                  name='email'
                  style={{ fontSize: branding.fontSize }}
                  className={twMerge(
                    'rounded-lg border px-[0.5vw] py-[1vh] !text-fsbase outline-none',
                    borderColor
                  )}
                  placeholder='Your Email/Username'
                  onChange={handleInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleFormSubmit()
                    }
                  }}
                />
              </div>
              <div className='relative flex flex-col gap-2'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  style={{ fontSize: branding.fontSize }}
                  className={twMerge(
                    'rounded-lg border px-[0.5vw] py-[1vh] !text-fsbase outline-none',
                    borderColor
                  )}
                  placeholder='Password'
                  onChange={handleInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleFormSubmit()
                    }
                  }}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(prev => !prev)}
                  className='absolute bottom-3 right-4 focus:outline-none'
                >
                  {showPassword ? (
                    <BsEyeFill className='h-[17px] w-[17px]' />
                  ) : (
                    <BsEyeSlash className='h-[17px] w-[17px]' />
                  )}
                </button>
              </div>
              <Link href='/forgot-password' className='self-end'>
                <Text color='brand'>Forgot Password</Text>
              </Link>
              <Button
                onClick={handleFormSubmit}
                className='!h-12 rounded-lg !2xl:h-14 w-full'
              >
                {loading ? (
                  <Spin
                    className='flex w-full justify-center'
                    spinning
                    color='success'
                    style='dots'
                  />
                ) : (
                  'Login'
                )}
              </Button>

              <div className='flex justify-center pb-2'>
                <Text className='flex items-center gap-1 text-nowrap'>
                  Don&apos;t have an account?{' '}
                  <a
                    href='https://outlook.office.com/mail/deeplink/compose?to=support@torus.tech'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Text color='brand'>Contact Admin</Text>
                  </a>
                </Text>
              </div>
            </div>
          </div>
          <div className='h-16 w-24 self-center'>
            <Image
              className='mr-auto w-[100%] rounded-tl-[3.5%]  '
              src={TorusFooter}
              alt='bankmaster'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
