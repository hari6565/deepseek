'use client'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Logo } from '@/app/components/Logo'
import i18n from '@/app/components/i18n'
import { useLanguage } from './languageContext'
import { AxiosService } from '@/app/components/axiosService'
import { useInfoMsg } from '@/app/components/infoMsgHandler'
import { uf_authorizationCheckDto } from '../interfaces/interfaces'
import { TotalContext, TotalContextProps } from '../globalContext'
import { Button } from '@/components/Button'
import { DropdownMenu } from '@/components/DropdownMenu'
import { useGlobal } from '@/context/GlobalContext'
//import ThemeSwitcher from './ThemeSwitcher'

const Navbar = ({ data }: any) => {
  const routes = useRouter()
  const [screenNames, setScreenNames] = useState<any[]>([])
  const language = useLanguage()
  const { token } = useGlobal();
  const keyset: any = i18n.keyset('language')
  const toast: any = useInfoMsg()
  const baseUrl: any = process.env.NEXT_PUBLIC_API_BASE_URL
  const { accessProfile, setAccessProfile, encAppFalg } = useContext(
    TotalContext
  ) as TotalContextProps

  const getScreenAccess = async () => {
    let screenData: any = []
    let allScreenDetails: any = []
    data.map((group: any) => {
      let details: any = {}
      details.menuGroup = group?.menuGroup

      let screenDetails: any = []
      group?.screenDetails?.map((screens: any) => {
        screenDetails.push({
          screenName: screens?.name,
          ufKey: screens?.key,
          version: screens?.key?.split(':').at(-1)
        })
      })

      allScreenDetails.push({
        menuGroup: group?.menuGroup,
        screenDetails: screenDetails
      })
    })
    data[0].screenDetails.map((value: any, index: any) => {
      screenData.push({
        screenName: value.name,
        ufKey: value.key,
        version: value.key.split(':').at(-1)
      })
    })
    let allNames: any = []

    for (let i = 0; i < allScreenDetails.length; i++) {
      let screenDetails: any = []
      for (let j = 0; j < allScreenDetails[i]?.screenDetails.length; j++) {
        let specificGroup: any = allScreenDetails[i]?.screenDetails
        try {
          let orchestrationDataBody: uf_authorizationCheckDto = {
            key: specificGroup[j].ufKey,
            accessProfile: accessProfile
          }
          if (encAppFalg.flag) {
            orchestrationDataBody['dpdKey'] = encAppFalg.dpd
            orchestrationDataBody['method'] = encAppFalg.method
          }
          const orchestrationData = await AxiosService.post(
            '/UF/Orchestration',
            orchestrationDataBody,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
          const security: string = orchestrationData?.data?.security
          if (security == 'AA') {
            screenDetails.push({
              action: () =>
                routes.push(
                  '/' +
                    specificGroup[j].screenName +
                    '_' +
                    specificGroup[j].version
                ),
              text: keyset(specificGroup[j].screenName)
            })
          }
        } catch (err) {
          console.log(err)
        }
      }

      allNames.push({
        group: allScreenDetails[i]?.menuGroup,
        screenDetails: screenDetails
      })
    }

    setScreenNames(allNames)
  }

  useEffect(() => {
    getScreenAccess()
  }, [])

  return (
    <div className='flex gap-4 bg-gray-300 p-4 text-white'>
      <Logo />
      {data.map((group: any, id: any) => {
        return (
          <DropdownMenu
            key={id}
            renderSwitcher={props => (
              <Button
                {...props}
                view='flat'
                ref={props.ref as React.Ref<HTMLButtonElement>}
              >
                {keyset(group.menuGroup)}
              </Button>
            )}
            items={
              screenNames
                .filter((item: any) => item?.group === group.menuGroup) // Correct filter condition
                .map((filteredItem: any) => filteredItem.screenDetails) // Assuming you want to map to screenDetails
            }
          />
        )
      })}
      {/* <ThemeSwitcher /> */}
    </div>
  )
}

export default Navbar
