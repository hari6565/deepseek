import {
  FilterIcon,
  Multiply,
  SearchIcon
} from '@/app/components/svgApplication'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { checkDataAccess } from '@/app/utils/checkDAP'
import { AxiosService } from '@/app/components/axiosService'
import { CiCalendarDate } from 'react-icons/ci'
import { Button } from '@/components/Button'
import Popup from '@/components/Popup'
import Spin from '@/components/Spin'
import { Text } from '@/components/Text'
import { Checkbox } from '@/components/Checkbox'
import { Avatar } from '@/components/Avatar'
import { useTheme } from '@/hooks/useTheme'
import { twMerge } from 'tailwind-merge'
import { RangeCalendar } from '@/components/RangeCalendar'
import { getCdnImage } from '@/app/utils/getAssets'
import { getFontSizeForSubHeader } from '@/app/utils/branding'
import { get } from 'lodash'
import clsx from 'clsx'
import { useGlobal } from '@/context/GlobalContext'

const FilterModal = ({
  range,
  setRange,
  setOpen,
  fabrics,
  setFabrics,
  user,
  setUser,
  activeTab,
  localSortOrder,
  setLocalSortOrder,
  setJsonData
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  range: any
  setRange: React.Dispatch<React.SetStateAction<any>>
  fabrics: Array<string>
  setFabrics: React.Dispatch<React.SetStateAction<Array<string>>>
  user: Array<string>
  setUser: React.Dispatch<React.SetStateAction<Array<string>>>
  activeTab: string
  localSortOrder: string
  setLocalSortOrder: React.Dispatch<React.SetStateAction<string>>
  setJsonData: React.Dispatch<React.SetStateAction<any>>
}) => {
  const [isDateRangeOpen, setDateRangeOpen] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<any>(range)
  const [selectedKeys, setSelectedKeys] = useState<string[]>(fabrics)
  const [selectedUsers, setSelectedUsers] = useState<string[]>(user)
  const [searchTerm, setSearchTerm] = useState('')
  const [userList, setuserList] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const { token } = useGlobal();


  const isAdminUser = useMemo(() => checkDataAccess(token), [token])
  const { isDark, borderColor, textColor, bgColor, branding } = useTheme()

  const calendarTriggerRef = useRef<HTMLDivElement>(null)
  const sortbutton = ['Newest', 'Oldest']

  const fabricList = [
    { key: 'DF', label: 'Data Fabric' },
    { key: 'UF', label: 'UI Fabric' },
    { key: 'PF', label: 'Process Fabric' },
    { key: 'API', label: 'API Fabric' },
    { key: 'AIF', label: 'AI Fabric' },
    { key: 'CDF', label: 'Deployment Fabric' }
  ]

  const formatDate = (d: any) => ({
    year: d.year,
    month: String(d.month).padStart(2, "0"),
    day: String(d.day).padStart(2, "0"),
  });

  const normalizeRange = (range: any) => ({
  start: {
    year: Number(range.start.year),
    month: Number(range.start.month),
    day: Number(range.start.day),
  },
  end: {
    year: Number(range.end.year),
    month: Number(range.end.month),
    day: Number(range.end.day),
  },
});

  const handleUpdateFilterInputs = () => {
    const formattedRange = selectedDateRange
      ? {
        start: formatDate(selectedDateRange.start),
        end: formatDate(selectedDateRange.end),
      }
      : null;

    setRange(formattedRange);
    setFabrics(selectedKeys);
    setUser(selectedUsers);
    setOpen(false);
    setJsonData((prev: any) => ({
      ...prev, page: 1
    }))
  };

  const getOrgAndUserData = async () => {
    setuserList([])
    setLoading(true)
    try {
      if (!isAdminUser) return
      const response = await AxiosService.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/UF/getAppSecurityData`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (response.status === 200) {
        if (response.data.users && Array.isArray(response.data.users)) {
          setuserList(response.data.users)
          setLoading(false)
        }
      }
    } catch (error) {
      setLoading(false)
      console.error(error)
    }
  }

  useEffect(() => {
    getOrgAndUserData()
  }, [])

  const showDate = (date: any) => {
    if (!date) return ''
    const { year, month, day } = date
    const formttedDay = day < 10 ? `0${day}` : day
    const formttedMonth = month < 10 ? `0${month}` : month
    return `${formttedDay}/${formttedMonth}/${year}`
  }

  const toggleFabric = (key: string) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  return (
    <div className='h-fit w-full'>
      <div className='flex w-full items-center justify-between px-2 py-1'>
        <Text
          contentAlign='left'
          variant={getFontSizeForSubHeader(branding.fontSize)}
          className='flex !w-fit gap-2 items-center'
        >
          <FilterIcon fill={isDark ? '#fff' : '#000'} /> Filter
        </Text>
        <Button
          className='!w-fit rounded-md p-2'
          onClick={() => setOpen(false)}
        >
          {' '}
          <Multiply width='12' height='12' fill={isDark ? '#fff' : '#000'} />
        </Button>
      </div>
      <hr className={`w-full ${borderColor}`} />
      <div className='flex flex-col gap-[1.24vh] px-[0.58vw] py-[1.24vh]'>
        <Text
          contentAlign='left'
          variant={getFontSizeForSubHeader(branding.fontSize)}
          className='flex !w-fit items-center gap-2'
        >
          SORT BY
        </Text>
        <div className='flex flex-wrap gap-[0.58vw] text-nowrap'>
          {sortbutton.map(item => (
            <button
              onClick={() => setLocalSortOrder(item)}
              key={item}
              style={{
                backgroundColor:
                localSortOrder == item ? branding.brandColor : "#fff",
              }}
              className={clsx(
                `text-torus-text flex rounded-md border px-[0.29vw] py-[0.62vh] leading-[2.22vh] outline-none`,
                {
                  'text-white': localSortOrder == item
                }
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {/* Date Range Selection */}
      <div className='flex flex-col gap-3 px-2 py-3'>
        <Text contentAlign='left' variant={getFontSizeForSubHeader(branding.fontSize)}>
          SORT BY DATE
        </Text>
        <div
          onClick={e => {
            setDateRangeOpen(!isDateRangeOpen)
            e.stopPropagation()
          }}
          ref={calendarTriggerRef}
          className={twMerge(
            'flex w-fit cursor-pointer items-center gap-[2vw] rounded border px-[0.5vw] py-[0.5vh]',
            borderColor
          )}
        >
          <div className='flex flex-col gap-1'>
            <Text contentAlign='left' color='secondary'>
              Select Date{' '}
            </Text>
            <Text contentAlign='left'>
              {showDate(normalizeRange(selectedDateRange).start)} -{' '}
              {showDate(normalizeRange(selectedDateRange).end)}
            </Text>
          </div>
          <span className='flex self-end'>
            <CiCalendarDate color={isDark ? '#fff' : '#000'} opacity={0.5} />
          </span>
        </div>
        <Popup
          anchorRef={calendarTriggerRef}
          open={isDateRangeOpen}
          onClose={() => setDateRangeOpen(false)}
          size='xl'
        >
          <RangeCalendar
            value={selectedDateRange ? normalizeRange(selectedDateRange) : undefined}
            onChange={val => setSelectedDateRange(val)}
            maxValue={{
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              day: new Date().getDate()
            }}
            minValue={{
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              day: new Date().getDate()
            }}
          />
        </Popup>
      </div>

      {/* Fabric Selection */}
      <div className='flex flex-col gap-3 px-2 py-3'>
        <Text contentAlign='left' variant={getFontSizeForSubHeader(branding.fontSize)}>
          FABRICS
        </Text>

        <div className='flex flex-col gap-2'>
          {(activeTab === 'process'
            ? fabricList.filter(item => ['DF', 'PF'].includes(item.key))
            : fabricList
          ).map(item => (
            <label
              key={item.key}
              className='flex cursor-pointer items-center gap-2'
            >
              <input
                type='checkbox'
                className='h-4 w-4 cursor-pointer'
                style={{ accentColor: branding.selectionColor }}
                checked={selectedKeys.includes(item.key)}
                onChange={() => toggleFabric(item.key)}
              />
              <Text contentAlign='left'>{item.label}</Text>
            </label>
          ))}
        </div>
      </div>

      {/* if admin User  */}
      {isAdminUser && (
        <div className='flex flex-col gap-3 px-2 py-3'>
          <Text contentAlign='left' variant={getFontSizeForSubHeader(branding.fontSize)}>
            USERS
          </Text>
          {/* Search section */}
          <div
            className={twMerge(
              'flex w-full items-center gap-[0.5vw] rounded border px-2',
              borderColor,
              bgColor,
              textColor
            )}
          >
            <span>
              <SearchIcon
                fill={isDark ? '#fff' : '#000'}
                height='16'
                width='16'
              />
            </span>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={'Search'}
              className={twMerge(
                `h-8 w-full rounded-md border-none font-medium outline-none`,
                bgColor,
                textColor
              )}
            />
          </div>
          {/* user list section */}
          <div
            className='scrollbar-none flex flex-col gap-[1vh] overflow-scroll'
            style={{
              height: userList.length > 3 ? '160px' : 'auto'
            }}
          >
            {loading ? (
              <Spin
                className='flex w-full justify-center'
                spinning
                color='success'
                style='dots'
              />
            ) : (
              userList
                .filter(u =>
                  (u.loginId + u.firstName + u.lastName)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((userObj: any) => (
                  <label
                    key={userObj?.loginId}
                    className='flex cursor-pointer items-center gap-2'
                  >
                    <input
                      type='checkbox'
                      style={{ accentColor: branding.selectionColor }}
                      className='h-4 w-4'
                      onChange={e =>
                        setSelectedUsers(prev => {
                          if (!prev.includes(userObj?.loginId)) {
                            return [...prev, userObj?.loginId]
                          } else {
                            return prev.filter(id => id !== userObj?.loginId)
                          }
                        })
                      }
                      checked={selectedUsers.includes(userObj?.loginId)}
                    />
                    <div
                      key={userObj?.loginId}
                      className='flex items-center gap-[0.5vw]'
                    >
                      <div className='h-11 w-11 rounded-full'>
                        <Avatar
                          theme='normal'
                          view='filled'
                          imageUrl={getCdnImage(userObj?.profile)}
                          icon='FaRegUser'
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <Text
                          className='text-nowrap'
                          contentAlign='left'
                        >
                          {userObj?.firstName + ' ' + userObj?.lastName}
                        </Text>
                        <Text contentAlign='left'>
                          {userObj?.loginId}
                        </Text>
                      </div>
                    </div>
                  </label>
                ))
            )}
          </div>
        </div>
      )}
      <hr className={twMerge('w-full', borderColor)} />

      <div className='flex justify-end gap-[1vw] pt-2'>
        <Button
          className='!w-fit rounded-md p-2'
          view='raised'
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdateFilterInputs}
          className='!w-fit rounded-md p-2'
        >
          Save
        </Button>
      </div>
    </div>
  )
}

export default FilterModal
