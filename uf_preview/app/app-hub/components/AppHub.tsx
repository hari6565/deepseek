'use client'
import React, { useContext, useEffect, useState } from 'react'
import TopNav from '@/app/components/Layout/TopNav'
import { TotalContext, TotalContextProps } from '@/app/globalContext'
import { useGlobal } from '@/context/GlobalContext'
import { twMerge } from 'tailwind-merge'
import { useTheme } from '@/hooks/useTheme'
import { getCdnImage } from '@/app/utils/getAssets'
import { AxiosService } from '@/app/components/axiosService'
import { useInfoMsg } from '@/app/components/infoMsgHandler'
import { Button } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'
import { AppHubIcon, SearchIcon } from '@/app/components/svgApplication'
import clsx from 'clsx'
import Image from "next/image";

type VersionInfo = {
  version: string
  accessUrl: string
}

type Application = {
  code: string
  name: string
  logo?: string
  versionInfo?: VersionInfo[]
}

const AppHub = ({ appList }: { appList: Application[] }) => {
  const { userDetails, setUserDetails } = useContext(
    TotalContext
  ) as TotalContextProps
  const { branding , token } = useGlobal()
  const { brandColor } = branding
  const { borderColor, isDark } = useTheme()
  const bgColor = isDark ? "bg-gray-800" : "bg-white"
  const bgCardColor = isDark ? "bg-gray-700" : "bg-gray-100"
  const toast: Function = useInfoMsg()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<VersionInfo | null>(
    null
  )

  const userDetailsData = async () => {
    try {
      let myAccount = await AxiosService.get('/UF/myAccount-for-client', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          key: 'Logs Screen'
        }
      })
      setUserDetails(myAccount?.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    userDetailsData()
  }, [])

  return (
    <div
      className={clsx('h-screen w-full bg-cover bg-center' , bgColor)}
      style={{ backgroundImage: 'var(--app-bg-image)' }}
    >
      {/* Top Navigation */}
      <TopNav
        appName='Application Hub'
        navData={[]}
        userDetails={userDetails}
        brandColor={brandColor}
        mode='closed'
        listMenuItems={false}
      />
      {/* Header Controls */}
      <div className='flex items-center justify-between px-6 py-4'>
        <div
          className={twMerge(
            'flex w-96 items-center gap-[.5vw] rounded-lg border px-[0.5vw] py-[0.85vh] text-fsbase',
            borderColor,
            bgColor
          )}
        >
          <span>
            <SearchIcon
              fill={isDark ? 'white' : 'black'}
              height='0.83vw'
              width='0.83vw'
            />
          </span>
          <input
            type='text'
            placeholder='Search'
            className={clsx('w-full outline-none text-fsbase', bgColor)}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className='flex items-center'>
          <div
            title={selectedVersion?.version ?? 'Select Version'}
            className='w-[10vw]'
          >
            <Dropdown
              placeholder='Select Version'
              disabled={!selectedApp?.versionInfo?.length}
              className='rounded-md outline-none disabled:opacity-50 text-left'
              static
              staticProps={selectedApp?.versionInfo?.map(v => v.version) ?? []}
              value={selectedVersion?.version ?? ''}
              onChange={val => {
                const version = selectedApp?.versionInfo?.find(
                  v => v.version === val
                )
                setSelectedVersion(version ?? null)
              }}
            />
          </div>

          <Button
            className='rounded-md px-4 py-3 disabled:opacity-50'
            disabled={!selectedVersion}
             onClick={() => {
              if (selectedVersion?.accessUrl) {
                const origin = window.location.href
                const url = new URL(`${process.env.NEXT_PUBLIC_BASE_PATH}/next-api/sso-init`, window.location.origin)
                url.searchParams.set('accessUrl', selectedVersion.accessUrl)
                url.searchParams.set('origin', origin)
                url.searchParams.set('token', token)
                
                window.open(url.toString(), '_self') // full navigation, not fetch
              } else {
                toast('Access URL not found for the selected version', 'danger')
              }
            }}
          >
            Next →
          </Button>
        </div>
      </div>

      {/* App Group */}
      <div className='px-6'>
        {/* App Grid */}
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-5 lg:grid-cols-8'>
          {appList
            .filter(a =>
              a.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(app => {
              const isSelected = selectedApp?.code === app.code

              return (
                <div
                  key={app.code}
                  onClick={() => {
                    setSelectedApp(app)
                    if (app.versionInfo && app.versionInfo.length) {
                      setSelectedVersion(app.versionInfo[0])
                    } else {
                      setSelectedVersion(null)
                    }
                  }}
                   className={twMerge(
                    'cursor-pointer rounded-xl border p-4 transition-all hover:bg-[var(--hover-color)] text-fsbase border-none',
                    isSelected ? 'bg-[var(--selection-color)]' : bgCardColor
                  )}
                >
                  <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-gray-100'>
                    {app.logo ? (
                      <Image
                        width={100}
                        height={100}
                        src={getCdnImage(app.logo)}
                        alt={app.name}
                        className='h-6 w-6 object-contain'
                      />
                    ) : (
                      <span
                        className={clsx('font-bold p-2 rounded-lg', bgColor)}
                      >
                         <AppHubIcon fill={isDark ? "white" : "black"}/>
                      </span>
                    )}
                  </div>

                  <p
                    className='text-fsbase w-full truncate'
                    title={app.name}
                  >
                    {app.name}
                  </p>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default AppHub
