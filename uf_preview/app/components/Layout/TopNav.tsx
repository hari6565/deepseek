
import { deleteAllCookies, getCookie } from '@/app/components/cookieMgment'
import decodeToken from '@/app/components/decodeToken'
import { Logo } from '@/app/components/Logo'
import { usePathname, useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MenuItem, MenuStructure } from '../../interfaces/interfaces'
import { Text } from '@/components/Text'
import { Button } from '@/components/Button'
import { Avatar } from '@/components/Avatar'
import { BsThreeDots } from 'react-icons/bs'
import { DropdownMenu } from '@/components/DropdownMenu'
import { getCdnImage } from '../../utils/getAssets'
import OPRTopNavSelector from './OPRTopNavSelector'
import { twMerge } from 'tailwind-merge'
import { useTheme } from '@/hooks/useTheme'
import Popup from '@/components/Popup'
import { LogoutIcon, RotateIcon, SettingsIcon } from '../../utils/svgApplications'
import clsx from 'clsx'
import { OrgStructure, ProdStructure, RoleStructure } from '../svgApplication'
import { isLightColor } from '../utils'
import Image from "next/image";
import { AxiosService } from '@/app/components/axiosService'
import { useGlobal } from '@/context/GlobalContext'

const TopNav = ({
  navData,
  listMenuItems = true,
  mode,
  brandColor = '#fff',
  appName,
  navigationStyles,
  logo,
  appLogo,
  userDetails,
  navBarItemsOrder
}: {
  navData: MenuStructure
  listMenuItems?: boolean
  mode: string
  brandColor: string
  appName: string
  navigationStyles?: string
  logo?: string
  appLogo?: string
  userDetails: any
  navBarItemsOrder?: {
    name: string
    gridColumn?: string
    gridRow?: string
  }[]
}) => {
  const router = useRouter()
  const { token } = useGlobal()
  const decodedTokenObj: any = decodeToken(token)
  const user = decodedTokenObj?.loginId
  const selectedAccessProfile = decodedTokenObj?.selectedAccessProfile
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const { borderColor, isDark , textStyle } = useTheme()
  const bgStyle = isDark ? "#1f2937" : "#ffffff"
  const [visibleItems, setVisibleItems] = useState<MenuItem[]>(navData || [])
  const [hiddenItems, setHiddenItems] = useState<MenuItem[]>([])
  const tp_ps = getCookie('tp_ps')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const popoverButtonElement = useRef(null)
  const brandTextColor = useMemo(() => {
    return isLightColor(brandColor)
  } , [brandColor])
  const menuBgColor =""
  const menuTextColor =""
  const menuSelectionBgColor =""
  const menuSelectionTextColor =""

  useEffect(() => {
    const checkOverflow = () => {
      if (!menuRef.current) return
      const containerWidth = menuRef.current.clientWidth
      let totalWidth = 0
      let newVisible = []
      let newHidden = []

      for (let menu of navData) {
        const testElement = document.createElement('div')
        testElement.style.visibility = 'hidden'
        testElement.style.position = 'absolute'
        testElement.style.whiteSpace = 'nowrap'
        testElement.textContent = menu.menuGroup || menu.screenDetails[0]?.name
        document.body.appendChild(testElement)

        const itemWidth = testElement.clientWidth + 120 // Add padding/margin
        document.body.removeChild(testElement)

        if (totalWidth + itemWidth < containerWidth) {
          newVisible.push(menu)
          totalWidth += itemWidth
        } else {
          newHidden.push(menu)
        }
      }

      setVisibleItems(newVisible)
      setHiddenItems(newHidden)
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [navData])

  const getNestedMenu = (menu: MenuItem): any => {
    const nestedMenu = []
    for (const screen of menu.screenDetails) {
      nestedMenu.push({
        text: screen.label ?? screen.name.split('-')[0].replace('_', ' '),
        action: () => {
          if (screen.static) {
            router.push('/' + screen.name.replace(/ /g, '_'))
          } else {
            router.push(
              '/' +
                screen.name.replace(/ /g, '_') +
                '_' +
                screen.key.split(':').at(-1)
            )
          }
        }
      })
    }

    if (menu.items) {
      for (const item of menu.items) {
        nestedMenu.push({
          text: item.menuGroupLabel,
          items: getNestedMenu(item)
        })
      }
    }
    return nestedMenu
  }

//  async function logout() {
//    localStorage.clear()
//    deleteAllCookies()
//    window.location.href = '/ct001/tgw01/tgw004/v1'
//  }

  async function logout() {
    try {
      if (token) {
        await AxiosService.post('/UF/release-all-locks', null, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch (e) {
      // ignore error, proceed with logout
    }
    localStorage.clear()
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
    const from = encodeURIComponent(`${basePath}/`)
    window.location.href = `${basePath}/next-api/auth/logout?from=${from}`
  }
  
  const hasMatchingName = (obj: any, input: string): boolean => {
    if (typeof obj !== 'object' || obj === null) return false

    for (const key in obj) {
      if (key === 'name' && obj[key] === input) {
        return true
      }
      if (typeof obj[key] === 'object') {
        if (hasMatchingName(obj[key], input)) {
          return true
        }
      }
    }

    return false
  }

  const isSelectedMenuGroup = useCallback(
    (menuGroup: any) => {
      const menuGrp = navData.find(item => item.menuGroup === menuGroup)
      const currentScreen = pathname.includes('_')
        ? pathname.split('/').pop()?.split('_').slice(0, -1).join(' ') || ''
        : pathname.split('/').pop() || ''

      const selectedRoute = hasMatchingName(menuGrp, currentScreen)
      if (selectedRoute) {
        return true
      }
      return false
    },
    [brandColor]
  )

  const getMenuStyle = (selected: boolean): React.CSSProperties => {
  const style: React.CSSProperties = {}

  if (selected) {
    if (menuSelectionBgColor) {
      style.backgroundColor = menuSelectionBgColor
    } else {
      style.backgroundColor = brandColor
    }

    if (menuSelectionTextColor) {
      style.color = menuSelectionTextColor
    } else {
      style.color = brandTextColor
    }
  } else {
    if (menuBgColor) {
      style.backgroundColor = menuBgColor
    }else{
      style.backgroundColor = bgStyle
    }

    if (menuTextColor) {
      style.color = menuTextColor
    }else{
      style.color = textStyle
    }
  }

  return style
}

  // Helper function to get grid style for a section
  const getGridStyle: (sectionName: string) => React.CSSProperties = (
    sectionName: string
  ) => {
    if (!navBarItemsOrder?.length) return {}

    const item = navBarItemsOrder.find(
      order => order.name.toLowerCase() === sectionName.toLowerCase()
    )

    if (!item) return { display: 'none' }

    return {
      gridColumn: item['gridColumn'],
      gridRow:  '1'
    }
  }

   // Logo section
  const LogoSection = useCallback(() => (
    <div className='flex items-center gap-1 min-w-[100px]' style={navigationStyles == 'vertical' ? undefined : getGridStyle('logo')}>
      {logo ? (
        <Image
          className='min-h-[3vh] max-h-[5vh] h-auto w-auto'
          width={100}
          height={100}
          src={getCdnImage(logo)}
          alt='logo'
        />
      ) : (
        <Logo />
      )}
      <Text className='text-nowrap text-start font-bold w-full truncate text-[var(--brand-color)]' contentAlign='left'>
          <span title={appName}>
          {appName}
          </span>
      </Text>
    </div>
  ) , [logo, appName])

      const AppLogoSection = useCallback(() => (
    <div className='flex items-center gap-1' style={navigationStyles == 'vertical' ? undefined : getGridStyle('app logo')}>
      {appLogo && (
        <Image
          width={100}
          height={100}
          className='min-h-[3vh] max-h-[5vh] h-auto w-auto'
          src={getCdnImage(appLogo)}
          alt='appLogo'
        />
      )}
    </div>
  ), [appLogo])

  // Menu Items section
  const MenuItemsSection = useCallback(() => (
    <div
      className='flex w-full justify-start items-center gap-1 pl-4'
      style={getGridStyle('menu items')}
      ref={menuRef}
    >
      <div className='flex max-w-[62%] items-center gap-[0.5vw]'>
        {navData &&
          visibleItems.map((menu, index) => {
            if (menu.menuGroup) {
              const selected = isSelectedMenuGroup(menu.menuGroup)
              return (
                <div key={index}>
                  <DropdownMenu
                    renderSwitcher={(props: any) => (
                      <button
                        {...props}
                        className={twMerge(
                            'px-[1vw] py-[0.5vh] !text-nowrap rounded-[1vw] hover:bg-[var(--hover-color)] text-fsbase'
                          )}
                        style={getMenuStyle(selected)} 
                      >
                        {menu.menuGroupLabel}
                      </button>
                    )}
                    key={index}
                    items={getNestedMenu(menu)}
                  />
                </div>
              )
            } else {
              const routingName =
                '/' +
                menu.screenDetails[0].name.replace(/ /g, '_') +
                '_' +
                menu.screenDetails[0].key.split(':').at(-1)
              const selected = routingName == pathname  
              return (
                <button
                 className={twMerge(
                            'px-[1vw] py-[0.5vh] !text-nowrap rounded-[1vw] hover:bg-[var(--hover-color)] text-fsbase'
                          )}
                  style={getMenuStyle(selected)}
                  key={index}
                  onClick={() => router.push(routingName)}
                >
                  {menu.menuGroupLabel}
                </button>
              )
            }
          })}
      </div>
      <div>
        {hiddenItems.length > 0 && (
          <DropdownMenu
            renderSwitcher={(props: any) => (
              <Button {...props} view='action' className='px-2 rotate-90'>
                <BsThreeDots />
              </Button>
            )}
            items={hiddenItems.map(menu => {
              if (menu.menuGroup) {
                return {
                  text: menu.menuGroupLabel,
                  items: getNestedMenu(menu)
                }
              } else {
                return {
                  text: menu.menuGroupLabel,
                  action: () => {
                    if (menu.screenDetails) {
                      const routingName =
                        '/' +
                        menu.screenDetails[0].name.replace(/ /g, '_') +
                        '_' +
                        menu.screenDetails[0].key.split(':').at(-1)
                      router.push(routingName)
                    }
                  }
                }
              }
            })}
          />
        )}
      </div>
    </div>
  ) , [visibleItems , hiddenItems])

  // OPR Matrix section
  const OPRMatrixSection = useCallback(() => (
    <div
      className={clsx('flex w-full justify-end gap-2', {
        hidden: !tp_ps
      })}
      style={getGridStyle('opr matrix')}
    >
      <OPRTopNavSelector
        selectedAccessProfile={selectedAccessProfile}
        fullView
      />
    </div>
  ), [selectedAccessProfile])

  // Profile section
  const ProfileSection = useCallback(() => (
    <div style={{...getGridStyle('profile') , justifySelf : 'end'}}>
      <div
        onClick={() => setIsPopoverOpen(prev => !prev)}
        ref={popoverButtonElement}
        className='h-11 w-12 cursor-pointer rounded-full'
      >
        <Avatar
          theme='brand'
          view='filled'
          imageUrl={getCdnImage(userDetails?.profile)}
          icon='FaRegUser'
        />
      </div>
      <div>
        <Popup
          anchorRef={popoverButtonElement}
          open={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          placement='bottom'
          hasArrow={false}
        >
          <div className='flex flex-col items-center gap-1'>
            {/* Profile section */}
            <div className='h-11 w-11 rounded-full'>
              <Avatar
                theme='brand'
                view='filled'
                imageUrl={getCdnImage(userDetails?.profile)}
                icon='FaRegUser'
              />
            </div>

            <Text className='font-medium'>
              {`${userDetails.firstName} ${userDetails.lastName}`}
            </Text>
          </div>

          <hr className={twMerge('mt-1 w-full border', borderColor)} />

          <div className='mt-2 flex flex-col gap-2'>
            <Text contentAlign='left'>
              ORGANIZATION MATRIX
            </Text>
            <div className='flex items-center gap-1'>
              <OrgStructure
                height='20'
                width='20'
                fill={isDark ? 'white' : 'black'}
              />
              <Text contentAlign='left'>
                Organization
              </Text>
            </div>
            <Text
              color='brand'
              contentAlign='left'
              className='block w-full truncate text-left'
            >
              {decodedTokenObj.orgName}
            </Text>
            <div className='flex items-center gap-1'>
              <ProdStructure
                height='20'
                width='20'
                fill={isDark ? 'white' : 'black'}
              />
              <Text contentAlign='left'>
                Products
              </Text>
            </div>
            <Text
              color='brand'
              contentAlign='left'
              className='block w-full truncate text-left'
            >
              {decodedTokenObj.psName}
            </Text>
            <div className='flex items-center gap-1'>
              <RoleStructure
                height='20'
                width='20'
                fill={isDark ? 'white' : 'black'}
              />
              <Text contentAlign='left'>
                Roles
              </Text>
            </div>
            <Text
              color='brand'
              contentAlign='left'
              className='block w-full truncate text-left'
            >
              {decodedTokenObj.roleName}
            </Text>
          </div>

          <hr className={twMerge('mt-1 w-full border', borderColor)} />

          <div className='flex flex-col gap-2 pt-2'>
            {pathname !== '/select-context' && (
              <div
                onClick={() => router.push('/select-context')}
                className='flex cursor-pointer items-center gap-2'
              >
                <RotateIcon fill={isDark ? 'white' : 'black'} />
                <div>
                  <Text>Change Profile</Text>
                </div>
              </div>
            )}

            {pathname !== '/app-hub' && (
            <div
              onClick={() => router.push('/app-hub')}
              className='flex cursor-pointer items-center gap-2'
            >
              <RotateIcon fill={isDark ? 'white' : 'black'} />
               <div>
                <Text>Switch Application</Text>
               </div>
               </div>
               )}

            {pathname !== '/select-context' && pathname !== '/user' && pathname !== '/app-hub' && (
              <div
                onClick={() => router.push('/user')}
                className='flex cursor-pointer items-center gap-2'
              >
                <SettingsIcon fill={isDark ? 'white' : 'black'} />
                <div>
                  <Text>Settings</Text>
                </div>
              </div>
            )}
            <div
              onClick={logout}
              className='flex cursor-pointer items-center gap-2'
            >
              <LogoutIcon />
              <div>
                <Text className='text-[#F44336]'>
                  Log out
                </Text>
              </div>
            </div>
          </div>
        </Popup>
      </div>
    </div>
  ) , [userDetails, isPopoverOpen])

  // Default layout (without grid)
    if (
    !navBarItemsOrder ||
    navBarItemsOrder?.length === 0 ||
    navigationStyles === 'vertical'
  ) {
    return (
      <div
        suppressHydrationWarning
        className={clsx(
          `flex items-center justify-between p-2 ${
            mode === 'detached' && navigationStyles == 'vertical' ? 'shadow-md' : ''
          }`
        )}
      >
        <LogoSection />
        {listMenuItems && (
          <>
            <MenuItemsSection />
            <OPRMatrixSection />
            <ProfileSection />
          </>
        )}
        {
          pathname === '/select-context' || pathname == '/app-hub' ?
          ( <ProfileSection />) : <></>
        }
      </div>
    )
  }

  // Grid layout (with navBarItemsOrder)
  return (
    <div
      suppressHydrationWarning
      className={clsx(
        `grid items-center px-[1vw] py-[0.5vh] ${mode === 'detached' && navigationStyles == "vertical" ? 'shadow-md' : ''}`
      )}
      style={{
        gridTemplateColumns: 'repeat(12,  minmax(0, 1fr))',
        gap: '0.5rem'
      }}
    >
      <LogoSection />
      <AppLogoSection />
      {listMenuItems && (
        <>
          <MenuItemsSection />
          <OPRMatrixSection />
          <ProfileSection />
        </>
      )}
      {
        pathname === '/select-context' || pathname == '/app-hub' ?
        ( <ProfileSection />) : <></>
      }
    </div>
  )
}

export default TopNav
