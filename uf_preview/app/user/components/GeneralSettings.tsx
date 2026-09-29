import React, { useEffect, useMemo, useState } from 'react'
import {
  DarkHCTheme,
  DarkTheme,
  LightHCTheme,
  LightTheme
} from '../../components/svgApplication'
import { fetchAMDKey } from '../../utils/fetchAMDKey.api'
import { getCookie, setCookie } from '../../components/cookieMgment'
import { getLanguagesJson } from '../../utils/getLanguagesJson.api'
import { useGlobal } from '@/context/GlobalContext'
import { useTheme } from '@/hooks/useTheme'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'
import i18n from '../../components/i18n'
import { twMerge } from 'tailwind-merge'
import { getFontSizeForHeader, getFontSizeForSubHeader } from '@/app/utils/branding'

const GeneralSettings = ({ currentLang, setCurrentLang }: {
  currentLang: string
  setCurrentLang: React.Dispatch<React.SetStateAction<string>>
}) => {
  const [languageOptions, setLanguageOptions] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState([
    getCookie('cfg_lang')
  ])
  const { branding , token } = useGlobal()
  const { borderColor, theme, setTheme } = useTheme()
  const { brandColor } = branding
  // const [currentLang, setCurrentLang] = useState(getCookie('cfg_lang')) // 'en'
  const keyset = useMemo(() => {
    return i18n.keyset('language')
  }, [currentLang]) // i18n.keyset('language')

  const themeOptions = [
    {
      label: 'Light',
      icon: <LightTheme width='200px' />,
      code: 'light'
    },
    {
      label: 'Dark',
      icon: <DarkTheme width='200px' />,
      code: 'dark'
    },
    {
      label: 'Light with High Contrast',
      icon: <LightHCTheme width='200px' />,
      code: 'light-hc'
    },
    {
      label: 'Dark with High Contrast',
      icon: <DarkHCTheme width='200px' />,
      code: 'dark-hc'
    }
  ]

  const fetchLanguages = async () => {
    const key = `CK:TGA:FNGK:SETUP:FNK:SF:CATK:TENANT:AFGK:${process.env.NEXT_PUBLIC_TENANT_CODE}:AFK:PROFILE:AFVK:v1:tpc`
    const response = await fetchAMDKey(key, token, {})
    if (response.languages && Array.isArray(response['languages'])) {
      const updatedLangResponse = response['languages'].map(({ name, code }: { name: string; code: string }) => ({
        content: name,
        value: code
      }));
      setLanguageOptions(updatedLangResponse as any)
    }
  }

  useEffect(() => {
    fetchLanguages()
  }, [])

  const handleLanguageChange = async (value: any) => {
    setSelectedLanguage(value)
    setCookie('cfg_lang', value)
    const languageJson = await getLanguagesJson(value, token)
    i18n.registerKeysets(value, languageJson);
    i18n.setLang(value);
    setCurrentLang(value) // Add this to trigger re-render
  }

  const handleThemeChange = (value: any) => {
    setTheme(value)
    setCookie('cfg_theme', value)
  }

  return (
    <div className={`g-root h-full w-full overflow-auto`}>
      <div className='flex w-full items-center justify-between'>
        <div className='flex flex-col gap-2'>
          <Text contentAlign='left' variant={getFontSizeForHeader(branding.fontSize)}>{keyset('General')}</Text>
          <Text color='secondary'>
            {' '}
            {keyset('Manage appearance, language, and basic preferences.')}
          </Text>
        </div>
      </div>
      {/* Divider Line */}
      <hr className={twMerge('my-2 w-full border border-0.5', borderColor)} />
      {/* Theme Selection */}
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <Text contentAlign='left' variant={getFontSizeForSubHeader(branding.fontSize)}>{keyset('Interface Theme')}</Text>
          <Text contentAlign='left' color='secondary'>
            {keyset('Select the Theme of the application.')}
          </Text>
        </div>
        <div className='flex flex-wrap gap-2'>
          {themeOptions.map(val => (
            <div
              key={val.label}
              className='flex cursor-pointer flex-col gap-[2.25vh] text-center '
              onClick={() => handleThemeChange(val.code)}
            >
              <div
                key={val.code}
                className={`relative rounded-md rounded-tl-xl outline-none`}
                style={{
                  border:
                    theme == val.code
                      ? `4px solid ${brandColor}`
                      : 'none'
                }}
              >
                {val.icon}
                <div className='absolute bottom-3 right-4'>
                  {theme === val.code && (
                    <input
                      type='checkbox'
                      readOnly
                      checked={true}
                      className='transition-color fade-in h-4 w-4 cursor-pointer rounded-lg outline-none duration-700'
                      style={{
                        color: `${brandColor}`,
                        borderColor: `${brandColor}`,
                        accentColor: `${brandColor}`
                      }}
                    />
                  )}
                </div>
              </div>
              <Text color='secondary'>
                {keyset(val.label)}
              </Text>
            </div>
          ))}
        </div>
      </div>
      {/* Divider Line */}
      <hr className={twMerge('my-2 w-full border border-0.5', borderColor)} />
      {/* Language Selection */}
      <div className='flex flex-wrap items-center'>
        <div className='flex flex-col w-1/3'>
          <Text contentAlign='left' variant={getFontSizeForSubHeader(branding.fontSize)}>{keyset('Language')}</Text>
          <Text contentAlign='left' color='secondary' className='text-nowrap'>
            {keyset('Select the language of the application.')}
          </Text>
        </div>
        <div className='w-[200px]'>
          <Select
            size='s'
            value={selectedLanguage}
            onChange={handleLanguageChange}
            options={languageOptions.map((item: any) => ({
              value: item.value,
              label: item.content
            }))}
            placeholder={keyset('Select Language')}
          />
        </div>
      </div>
      {/* Divider Line */}
      <hr className={twMerge('my-2 w-full border border-0.5', borderColor)} />
    </div>
  )
}

export default GeneralSettings
