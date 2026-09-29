'use client'
import React, { useMemo, useState } from 'react'
import {
  GeneralSettingsIcon,
} from '../../components/svgApplication'
import { getCookie } from '@/app/components/cookieMgment'
import { isLightColor } from '@/app/components/utils'
import GeneralSettings from './GeneralSettings'
import { useGlobal } from '@/context/GlobalContext'
import { useTheme } from '@/hooks/useTheme'
import { Text } from '@/components/Text'
import { Menu } from '@/components/Menu'
import { twMerge } from 'tailwind-merge'
import i18n from '../../components/i18n'
import clsx from 'clsx'
import { getFontSizeForHeader } from '@/app/utils/branding'

const SetupScreen = () => {
  const { branding } = useGlobal()
  const { borderColor, isDark } = useTheme()
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const { brandColor } = branding
  const [currentLang, setCurrentLang] = useState(getCookie('cfg_lang')) // 'en'
  const keyset = useMemo(() => {
    return i18n.keyset('language')
  }, [currentLang])
  const selectedTextColor = useMemo(() => {
    return isLightColor(brandColor)
  } , [brandColor])


 const menuItems = useMemo(() => {
      return [
        {
          name: 'General',
          svg: <GeneralSettingsIcon fill={selectedTextColor} />,
          code: 'general'
        }
      ]
  }, [selectedTextColor ])

  return (
          <div
            className={clsx(`g-root flex h-[90%] w-full flex-col overflow-hidden`, bgColor)}
          >
            <div className={'flex w-full items-center justify-between px-2 py-[0.8vh]'}>
              {/* LEFT : TITLE */}
              <Text
                contentAlign='left'
                variant={getFontSizeForHeader(branding.fontSize)}
                className='whitespace-nowrap font-semibold'
              >
                {keyset('Settings')}
              </Text>
            </div>

            <hr className={twMerge('w-full', borderColor)}></hr>
            <div
              className={clsx(`flex h-[87vh]`)}
            >
              <div
                style={{
                  minWidth: '200px'
                }}
                className={twMerge(`border-r`, borderColor)}
              >
                <Menu size='s' className='h-full'>
                  {menuItems.map(item => (
                    <Menu.Item
                      iconStart={item.svg}
                      key={item.code}
                      className='truncate text-nowrap'
                      active={item.code == 'general'}
                    >
                      <Text contentAlign='left'>{(item.name)}</Text>
                    </Menu.Item>
                  ))}
                </Menu>
              </div>
              <div className='flex-1 min-w-0 overflow-auto px-2 py-3'>
                  <GeneralSettings
                    currentLang={currentLang}
                    setCurrentLang={setCurrentLang}
                  />
              </div>
            </div>
          </div>
  )
}

export default SetupScreen
