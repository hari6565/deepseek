'use client'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { ArrowBackward } from '../utils/svgApplications'
import { isLightColor } from '../components/utils'
import { AxiosService } from '../components/axiosService'
import { useInfoMsg } from '../components/infoMsgHandler'
import { BsEyeFill, BsEyeSlash } from 'react-icons/bs'
import { useRouter } from 'next/navigation'
import { Text } from '@/components/Text'
import { Button } from '@/components/Button'
import { useTheme } from '@/hooks/useTheme'
import { getFontSizeForHeader } from '../utils/branding'
import { useGlobal } from '@/context/GlobalContext'

interface Props {
  email: string
  brandColor?: string
  setIsOtpReceive: React.Dispatch<React.SetStateAction<boolean>>
  otpResetToken: string
  setOtpResetToken: React.Dispatch<React.SetStateAction<string>>
  selectedAppTenant?: string
  appTenantList?: any
}

const OtpVerification = ({
  email,
  brandColor = '#76C432',
  setIsOtpReceive,
  selectedAppTenant,
  appTenantList,
  otpResetToken,
  setOtpResetToken
}: Props) => {
  const router = useRouter()
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const toast = useInfoMsg()
  const [showPassword, setShowPassword] = useState(false)
  const { branding } = useGlobal()
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({
    password: '',
    confirmPassword: ''
  })
  const [validation, setvalidation] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false
  })
  const { isDark } = useTheme()
  const [resetToken, setResetToken] = useState<string | null>(null)

  const handleVerifyOtp = async () => {
    try {
      const res = await AxiosService.post(`UF/verifyOtp`, {
        email: email,
        otp: otp.join(''),
        id: otpResetToken
      })
      if (res.status === 201) {
        setIsOtpVerified(true)
        setOtpResetToken('')
        setResetToken(res.data?.resetToken)
      }
    } catch (error: any) {
      toast(error?.response?.data?.message, 'danger')
    }
  }

  const handleGetOtp = async () => {
    try {
      const res = await AxiosService.post(`UF/getResetPasswordOtp`, {
        email: email,
        tenantId: selectedAppTenant ? appTenantList?.find((item: any) => item.tenant_name == selectedAppTenant)?.at_id : undefined
      })
      if (res.status === 201) {
        setOtpResetToken(res.data.id)
        return res.data
      }
    } catch (error: any) {
      toast(error?.response?.data?.message, 'danger')
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newOtp = [...otp]
    newOtp[index] = e.target.value
    setOtp(newOtp)
    if (e.target.value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: any) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (pastedData.length === otp.length) {
      setOtp(pastedData.split('')) // Set OTP directly if the pasted data is valid
    }
    if (pastedData.length > otp.length) {
      setOtp(pastedData.slice(0, otp.length).split(''))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name == 'password') {
      setvalidation(true)
      if (value.length == 0) {
        setvalidation(false)
      }
      setPasswordErrors({
        length: value.length >= 8,
        lowercase: /[a-z]/.test(value),
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value)
      })
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async () => {
    if (formData.password != formData.confirmPassword) {
      toast('Password does not match', 'danger')
      return
    }
    if(Object.values(passwordErrors).some((t) => !t)){
      toast('Password must meet all the required criteria.', 'danger')
      return
    }
    try {
      const res = await AxiosService.patch(`UF/resetPassword`, {
        email: email,
        password: formData.password,
        app_tenant: selectedAppTenant ? appTenantList?.find((item: any) => item.tenant_name == selectedAppTenant)?.tenant_id : undefined,
        tenantId: selectedAppTenant ? appTenantList?.find((item: any) => item.tenant_name == selectedAppTenant)?.at_id : undefined,
        resetToken: resetToken
      })
      if (res.status == 200) {
        toast(typeof res.data == "string" ? res.data : 'Password updated successfully', 'success')
        setIsOtpVerified(false)
        setIsOtpReceive(false)
        router.push('/')
      }
    } catch (error: any) {
      toast(error?.response?.data?.message, 'danger')
    }
  }

  return (
    <>
      {isOtpVerified ? (
        <>
          <div className='flex h-[100px] w-full flex-col items-center justify-center py-[1vh] gap-[2px]'>
            <Text
              variant={getFontSizeForHeader(branding.fontSize)}
              className='font-bold text-[1.5vw]'
            >
              Set New Password
            </Text>
           <span color='secondary' className='flex w-[12vw] text-center text-[.7vw]'>
              Your new password must be different from previous used passwords
            </span>
          </div>
          <div
            className={`flex w-full flex-col gap-[1.5vh] items-center justify-center`}
          >
            <label className='flex w-[18vw] flex-col gap-[1vh] text-[.8vw] font-medium'>
              Password
              <span
                style={{
                  backgroundColor: 'var(--g-color-base-float)',
                  color: 'var(--g-color-text-primary)',
                  borderColor: 'var(--g-color-line-generic)'
                }}
                className='flex w-full justify-between rounded-lg border px-[.5vw] py-[1vh] text-[.8vw] font-medium outline-none'
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  className='text-[.8vw] font-medium outline-none'
                  placeholder='Enter password'
                  style={{
                    backgroundColor: 'var(--g-color-base-float)',
                    color: 'var(--g-color-text-primary)',
                    borderColor: 'var(--g-color-line-generic)'
                  }}
                  onChange={handleInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleFormSubmit()
                    }
                  }}
                />
                <Button
                  onClick={() => setShowPassword(prev => !prev)}
                  className='text-[0.7vw] focus:outline-none !w-[1.5vw]'
                >
                  {showPassword ? (
                    <BsEyeFill className='h-[1vw] w-[1vw]' />
                  ) : (
                    <BsEyeSlash className='h-[1vw] w-[1vw]' />
                  )}
                </Button>
              </span>
            </label>

            {Object.values(passwordErrors).includes(true) && (
              <div className='mb-[10px] flex  gap-[0.87vw]'>
                <div
                  style={{
                    backgroundColor: `${Object.values(passwordErrors).includes(true) ? brandColor : 'var(--g-color-base-float)'}`
                  }}
                  className={`bottom-0 left-0 mt-[0.87vw] h-1 w-[5vw] rounded-sm py-1`}
                />
                <div
                  style={{
                    backgroundColor: `${Object.values(passwordErrors).filter(val => val == true).length >= 2 ? brandColor : 'var(--g-color-base-float)'}`
                  }}
                  className={`bottom-0 left-0 mt-[0.87vw] h-1 w-[5vw] rounded-sm py-1`}
                />
                <div
                  style={{
                    backgroundColor: `${Object.values(passwordErrors).filter(val => val == true).length >= 4 ? brandColor : 'var(--g-color-base-float)'}`
                  }}
                  className={`bottom-0 left-0 mt-[0.87vw] h-1 w-[5vw] rounded-sm py-1`}
                />
              </div>
            )}

            {validation && (
              <div className='flex flex-col gap-[5px] font-medium leading-[1.04vw]'>
                <div className='flex items-center gap-[0.29vw]'>
                  <input
                    type='checkbox'
                    style={{ accentColor: brandColor, color: brandColor }}
                    checked={passwordErrors.length}
                    readOnly
                    className='form-checkbox h-3 w-3 rounded'
                  />
                  <span className='text-[15px]'>
                    Must be at least 8 characters
                  </span>
                </div>

                <div className='flex items-center gap-1 font-medium'>
                  <input
                    type='checkbox'
                    style={{ accentColor: brandColor, color: brandColor }}
                    checked={passwordErrors.lowercase}
                    readOnly
                    className='form-checkbox h-3 w-3 rounded'
                  />
                  <span className='text-[15px]'>
                    Should contain lowercase letters (a-z)
                  </span>
                </div>

                <div className='flex items-center gap-[0.29vw]'>
                  <input
                    type='checkbox'
                    style={{ accentColor: brandColor, color: brandColor }}
                    checked={passwordErrors.uppercase}
                    readOnly
                    className='form-checkbox h-3 w-3 rounded'
                  />
                  <span className='text-[15px]'>
                    Should contain uppercase letters (A-Z)
                  </span>
                </div>

                <div className='flex items-center gap-[0.29vw]'>
                  <input
                    type='checkbox'
                    style={{ accentColor: brandColor, color: brandColor }}
                    checked={passwordErrors.number}
                    readOnly
                    className='form-checkbox h-3 w-3 rounded'
                  />
                  <span className='text-[15px]'>
                    Should contain numbers (i.e., 0-9)
                  </span>
                </div>
              </div>
            )}

            <label className='flex w-[18vw] flex-col gap-[1vh] text-[.8vw] font-medium'>
              Confirm Password
              <span
                style={{
                  backgroundColor: 'var(--g-color-base-float)',
                  color: 'var(--g-color-text-primary)',
                  borderColor: 'var(--g-color-line-generic)'
                }}
                className='flex w-full justify-between rounded-lg border px-[.5vw] py-[1vh] text-[.8vw] font-medium outline-none'
              >
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name='confirmPassword'
                  className='text-[.8vw] font-medium outline-none'
                  placeholder='Enter password'
                  style={{
                    backgroundColor: 'var(--g-color-base-float)',
                    color: 'var(--g-color-text-primary)',
                    borderColor: 'var(--g-color-line-generic)'
                  }}
                  onChange={handleInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleFormSubmit()
                    }
                  }}
                />
                <Button
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className='text-[0.7vw] focus:outline-none !w-[1.5vw]'
                >
                  {showConfirmPassword ? (
                    <BsEyeFill className='h-[1vw] w-[1vw]' />
                  ) : (
                    <BsEyeSlash className='h-[1vw] w-[1vw]' />
                  )}
                </Button>
              </span>
            </label>

            <Button
              className='!w-[18vw] rounded-lg text-[.8vw] py-[1vh] font-medium'
              onClick={handleFormSubmit}
              disabled={!formData.password || !formData.confirmPassword}
            >
              Set Password
            </Button>
            <Link
              href='/'
              className='flex items-center gap-[.5vw] text-[.8vw] font-medium mb-[2vh]'
            >
              <ArrowBackward
                opacity='1'
                fill={isDark ? '#ffffff' : '#000000'}
              />{' '}
              Back to Login
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className='flex w-full flex-col items-center justify-center py-[2vh]'>
            <Text className='font-bold text-[1.5vw]'>Verification Code</Text>
            <Text color='secondary' className='text-center text-[.75vw]'>
              We&apos;ve sent a code to {email}
            </Text>
          </div>
          <div className='flex w-full flex-col items-center justify-center gap-[1.5vh]'>
            <label className='flex w-[18vw] flex-col gap-[1vh] text-[.8vw] font-medium'>
              Verification Code
              <div className='flex gap-[1.2vw]'>
                {otp.map((_, index) => (
                  <input
                    key={index}
                    type='text'
                    maxLength={1}
                    value={otp[index]}
                    onPaste={handlePaste}
                    onChange={e => handleChange(e, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    ref={el => (inputRefs.current[index] = el) as any}
                    style={{
                      backgroundColor: 'var(--g-color-base-float)',
                      color: 'var(--g-color-text-primary)',
                      borderColor: 'var(--g-color-line-generic)'
                    }}
                    className={`h-[2.1vw] w-[2.1vw] rounded-md border-[0.1vw] text-center text-lg focus:outline-none focus:ring-2`}
                  />
                ))}
              </div>
            </label>
            <div>
              <Button
                // style={{
                //   backgroundColor: brandColor,
                //   color: isLightColor(brandColor)
                // }}
                className='!w-[18.7vw] px-[.3vw] rounded-lg py-[1vh] text-[1vw] font-medium'
                onClick={() => handleVerifyOtp()}
                disabled={otp.join('').length !== 6}
              >
                Verify
              </Button>
            </div>
            <span className='flex w-[15vw] items-center text-nowrap'>
              <Text color='secondary' className='text-[.8vw] text-nowrap'>
                Didn&apos;t get a code?
              </Text>
              <Button
                onClick={handleGetOtp}
                className='text-[.8vw] font-semibold text-nowrap'
              >
                Click to resend code
              </Button>
            </span>
            <Link
              href='/'
              className='flex items-center gap-[.5vw] text-[.8vw] font-medium mb-[2vh]'
            >
              <ArrowBackward
                opacity='1'
                fill={isDark ? '#ffffff' : '#000000'}
              />{' '}
              Back to Login
            </Link>
          </div>
        </>
      )}
    </>
  )
}

export default OtpVerification
