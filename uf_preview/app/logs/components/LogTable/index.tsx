'use client'
import React, { SetStateAction, useMemo, useRef, useState } from 'react'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import { FilterIcon } from '@/app/components/svgApplication'
import FilterModal from './FilterModal'
import { Table } from '@/components/Table'
import { Pagination } from '@/components/Pagination'
import { Text } from '@/components/Text'
import { Button } from '@/components/Button'
import { Tabs } from '@/components/Tabs'
import { Modal } from '@/components/Modal'
import { TbCopy } from 'react-icons/tb'
import { TbCopyCheckFilled } from 'react-icons/tb'
import { twMerge } from 'tailwind-merge'
import { useTheme } from '@/hooks/useTheme'
import { useGlobal } from '@/context/GlobalContext'
import { Spin } from '@/components/Spin'
import i18n from '@/app/components/i18n'
import { getFontSizeForSubHeader } from '@/app/utils/branding'
import { isLightColor } from '@/app/components/utils'
import clsx from 'clsx'

interface TableHeaderProps {
  loading: boolean
  jsonData: {
    data: Array<any>
    page: number
    limit: number
    totalDocuments: number
    totalPages: number
  }
  setJsonData: React.Dispatch<React.SetStateAction<any>>
  onPageChange: (page: number, pageSize: number) => void
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  activeTab: string
  setActiveTab: React.Dispatch<SetStateAction<'process' | 'torus'>>
  setNodeData: React.Dispatch<SetStateAction<any>>
  range: any
  setRange: React.Dispatch<React.SetStateAction<any>>
  fabrics: Array<string>
  setFabrics: React.Dispatch<React.SetStateAction<Array<string>>>
  user: Array<string>
  setUser: React.Dispatch<React.SetStateAction<Array<string>>>
  jsonViewerData: any
  setJsonViewerData: React.Dispatch<React.SetStateAction<any>>
  localSortOrder: string
  setLocalSortOrder: React.Dispatch<React.SetStateAction<string>>  
}

const TableHeader: React.FC<TableHeaderProps> = ({
  loading,
  jsonData,
  setJsonData,
  onPageChange,
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  setNodeData,
  range,
  setRange,
  fabrics,
  setFabrics,
  user,
  setUser,
  jsonViewerData,
  setJsonViewerData,
  localSortOrder,
  setLocalSortOrder
}) => {
  const headerProcessRowsItem = [
    'artifactName',
    'user',
    'version',
    'fabric',
    'status',
    'node',
    'time'
  ]
  const headerTorusRowsItem = [
    'Artifact Name',
    'Version',
    'Fabric',
    'Session Info',
    'Time Stamp',
    'Error Code',
    'Error Description'
  ]
  const [copied, setCopied] = useState<string | null>(null)
  const handleUpdate = (newPage: number, newPageSize: number) => {
    onPageChange(newPage, newPageSize)
  }
  const [open, setOpen] = useState(false)
  const buttonElement = useRef<HTMLButtonElement>(null)
  const { isDark, borderColor, textColor } = useTheme()
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const { branding } = useGlobal()
  const { selectionColor } = branding
  const keyset = i18n.keyset('language')

  const displayNodeData = (data: any, type: 'node' | 'time' | 'status') => {
    switch (type) {
      case 'node':
        return (
          <div className='flex h-full w-full flex-col items-center justify-center gap-1'>
            {(data?.node ?? []).map((item: any, indexOfNode: number) => (
              <Text key={indexOfNode} color='secondary'>
                {item.name}
              </Text>
            ))}
          </div>
        )
      case 'time':
        return (
          <div className='flex h-full w-full flex-col items-center justify-center gap-1'>
            {(data?.time ?? []).map((item: any, indexOfTime: number) => (
              <Text key={indexOfTime} color='secondary'>
                {item}
              </Text>
            ))}
          </div>
        )
      case 'status':
        if (data.status == 'Failed') {
          return (
            <Text
              className='rounded-full bg-red-500 px-3 py-1 text-center text-white'
            >
              Failed
            </Text>
          )
        } else {
          return (
            <Text
              className={`rounded-full bg-green-500 px-3 py-1 text-center text-white`}
            >
              Success
            </Text>
          )
        }
      default:
        return <></>
    }
  }

  const displayArtifactName = (artifactName: any, nodeData: any) => {
    const { artifact, grpDetails, processId, artifactKey } = artifactName
    const handleCopyToClipboard = async (upId: string) => {
      try {
        await navigator.clipboard.writeText(upId)
        setCopied(upId)
        setTimeout(() => {
          setCopied(null)
        }, 1000)
      } catch (err) {
        console.error('Failed to copy text: ', err)
      }
    }
    return (
      <div
        className='flex w-full flex-col gap-1 justify-start'
        onClick={() => setNodeData(nodeData)}
      >
        <Text contentAlign='left' variant={getFontSizeForSubHeader(branding.fontSize)}>{artifact}</Text>
        <Text contentAlign='left' color='secondary'>
          {grpDetails}
        </Text>
        {processId && (
          <div
            className={twMerge('flex w-fit rounded-full py-[.4vh] px-[.5vw] gap-[0.3vw] items-center')}
            style={{
              backgroundColor: selectionColor
            }}
          >
            <Text>UID: {processId}</Text>
            <Button
              view='flat'
              className='!w-4 rounded-md p-1'
              onClick={e => {
                e.stopPropagation()
                handleCopyToClipboard(processId)
              }}
            >
              {copied && copied === processId ? (
                <TbCopyCheckFilled className='text-green-500' />
              ) : (
                <TbCopy />
              )}
            </Button>
          </div>
        )}
      </div>
    )
  }

  const getRowData = (item: any, column: any) => {
    switch (column?.id) {
      case 'artifactName':
        return displayArtifactName(item, item)
      case 'version':
        return (
          <Text className='block text-center'>
            {item.version}
          </Text>
        )
      case 'user':
        return (
          <Text className='block text-center'>
            {item.user}
          </Text>
        )
      case 'fabric':
        return (
          <Text className='block text-center'>
            {item.fabric}
          </Text>
        )
      case 'jobType':
        return (
          <Text className='block text-center'>
            {item.jobType}
          </Text>
        )
      case 'status':
        return displayNodeData(item, 'status')
      case 'node':
        return displayNodeData(item, 'node')
      case 'time':
        return displayNodeData(item, 'time')

      default:
        return 'none'
    }
  }

  const processRow = (jsonData.data || []).map(item => {
    let result: any = {}
    headerProcessRowsItem.forEach(key => {
      result = { ...result, [key]: getRowData(item, { id: key }) }
    })
    result = { ...result, id: item.processId }
    return result
  })

  const torusRow = (jsonData.data || []).map((item, index) => ({
    'Artifact Name': (
      <>
        <div className='flex w-full flex-col gap-[0.29vw] px-[1vw] text-left'>
          <Text>{item.artifact}</Text>
          <Text color='secondary'>{item.grpDetails}</Text>
        </div>
      </>
    ),
    Version: (
      <div className='text-center'>
        <Text color='secondary'>{item.version}</Text>
      </div>
    ),
    Fabric: (
      <>
        <RowElementContainer item={item.fabric} />
      </>
    ),
    'Session Info': (
      <>
        {item?.user ? (
          <div>
            <Text>
              {item?.user}
            </Text>
            {item.accessProfile && Array.isArray(item.accessProfile) ? (
              item.accessProfile.map((profile: string, i: number) => (
                <Text key={i} color='secondary'>
                  {profile} {item.accessProfile.length - 1 === i ? '' : ','}
                </Text>
              ))
            ) : (
              <></>
            )}
          </div>
        ) : (
          <div className='text-center'>N/A</div>
        )}
      </>
    ),
    'Time Stamp': (
      <Text key={index} className='block py-1.5 text-center'>
        {item?.timeStamp}
      </Text>
    ),
    'Error Code': (
      <Text key={index} className='block text-center'>
        {item?.errorCode}
      </Text>
    ),
    'Error Description': (
      <Text key={index} className='block py-1.5 text-center max-w-[300px] text-wrap'>
        {item?.errorDescription}
      </Text>
    ),
    id: index + 1
  }))

  const capitalize = (val: string) => {
    return val.charAt(0).toUpperCase() + val.slice(1)
  }

  function camelCaseToParagraphCase(str: string) {
    // Step 1: Insert spaces before capital letters
    let result = str.replace(/([A-Z])/g, ' $1')

    result = result
      .split(' ')
      .map(word => capitalize(word))
      .join(' ')

    return result
  }

  const processColumn = useMemo(() => {
    const items = headerProcessRowsItem.map((item: string, index: number) => {
      return {
        id: item,
        name: keyset(camelCaseToParagraphCase(item)),
        className: index === 0 ? 'text-left' : 'text-center'
      }
    })
    return items
  }, [jsonData, searchTerm])

  const torusColumn = useMemo(() => {
    const items = headerTorusRowsItem.map((item: string, index: number) => {
      return {
        id: item,
        name: keyset(camelCaseToParagraphCase(item)),
        className: index === 0 ? 'text-left' : 'text-center'
      }
    })
    return items
  }, [jsonData, searchTerm])

  const handleRowClick = (row: any) => {
    const value = jsonData.data.find((item, index) => index + 1 == row.id)
    if (value?.errorDetails) {
      setJsonViewerData(value.errorDetails)
    } else {
      setJsonViewerData([])
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab === 'process' ? 'process' : 'torus')
    setFabrics([])
  }

  return (
    <div className={`g-root grid h-full grid-cols-12`}>
      <div className='col-span-12 overflow-hidden'>
        <div className='flex flex-col rounded-md'>
          <div className='flex w-full items-center justify-between p-2'>
            <div className=' ml-3.5 flex items-center justify-start gap-1.5 '>
              <LogsHub fill={isDark ? '#fff' : '#000'} width='23' height='23' />
              <HeaderElementContainer header='Logs Hub' rounded='' />
            </div>
            <div className='flex w-[70%] items-center justify-center gap-2'>
              <input
                type='text'
                placeholder='Search...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value.trim())}
                className={twMerge(
                  'w-[50%] rounded-md border px-2 shadow-md outline-none focus:border py-1.5 xl:py-1 2xl:py-2',
                  borderColor,
                  textColor,
                  bgColor
                )}
              />

              <div>
                <Button
                  ref={buttonElement}
                  onClick={() => setOpen(!open)}
                  className='rounded-md p-2'
                >
                  <span className='flex items-center gap-2'>
                    Filter <FilterIcon fill={isLightColor(branding.brandColor)} />
                  </span>
                </Button>
                <Modal
                  className='w-[50vw] lg:w-[30vw]'
                  open={open}
                  onClose={() => setOpen(!open)}
                  showCloseButton={false}
                >
                  <FilterModal
                    setOpen={setOpen}
                    range={range}
                    setRange={setRange}
                    fabrics={fabrics}
                    setFabrics={setFabrics}
                    user={user}
                    setUser={setUser}
                    activeTab={activeTab}
                    localSortOrder={localSortOrder}
                    setLocalSortOrder={setLocalSortOrder}
                    setJsonData={setJsonData}
                  />
                </Modal>
              </div>
            </div>

            {/* { PLS DON'T DELETE } */}
            <LogSwitcher
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              borderColor={borderColor}
            />
          </div>
          <div className={clsx('flex w-full' , bgColor)}>
            <div className={`${activeTab === 'torus' ? 'block w-1/2 md:w-3/4' : 'w-full'}`}>
              <div
                className={`overflow-auto transition-all delay-0 duration-300 ease-out h-[83vh]`}
              >
                <Table
                  columns={activeTab === 'torus' ? torusColumn : processColumn}
                  data={
                    activeTab === 'torus'
                      ? loading
                        ? []
                        : torusRow
                      : loading
                      ? []
                      : (processRow as any)
                  }
                  onRowClick={e => handleRowClick(e)}
                  isRowclick={true}
                  // width='auto'
                  wordWrap={false}
                  edgePadding={true}
                  // verticalAlign='middle'
                  emptyMessage={
                    loading ? <Spin spinning style='dots' /> : 'No data found'
                  }
                  pagination={{
                   page: jsonData?.page,
                   pageSize: jsonData?.limit,
                   pageSizeOptions: [3, 5, 10, 20, 50, 100],
                   total: jsonData?.totalDocuments,
                   onUpdate: data => handleUpdate(data.page, data.pageSize),
                  }}
                  showPagination={true}
                />
              </div>
            </div>
            <div
              className={`${
                activeTab === 'torus' ? 'block w-1/2 md:w-1/4 ' : 'hidden'
              } h-[100%] `}
            >
              <div className='flex w-full items-center justify-center'>
                <JsonViewer tabdata={jsonViewerData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableHeader

const RowElementContainer = ({ item }: { item: string }) => {
  return (
    <Text className='text-start'>
      {item}
    </Text>
  )
}

const HeaderElementContainer = ({
  header,
  rounded
}: {
  header: string
  rounded: string
}) => {
  const keyset = i18n.keyset('language')
  const {branding} = useGlobal()

  return (
    <div
      className={`h-full w-full px-1 py-1 text-center ${
        rounded ? rounded : 'rounded-none'
      } `}
    >
      <Text className='text-nowrap font-semibold' variant={getFontSizeForSubHeader(branding.fontSize)}>{keyset(header.toLocaleUpperCase())}</Text>
    </div>
  )
}

const LogSwitcher = ({
  activeTab,
  setActiveTab,
  borderColor
}: {
  activeTab: string
  setActiveTab: (item: string) => void
  borderColor: string
}) => {
  const keyset = i18n.keyset('language')
  return (
    <div>
      <Tabs
        security={["process" , "torus"]}
        className={twMerge('', borderColor)}
        items={[
          {
            id: 'process',
            title: keyset('Process Log')
          },
          {
            id: 'torus',
            title: keyset('System Log')
          }
        ]}
        onChange={setActiveTab}
        direction='horizontal'
      ></Tabs>
    </div>
  )
}

const JsonViewer = ({ tabdata }: any) => {
  const keyset = i18n.keyset('language')
  const {branding} = useGlobal()

  return (
    <div
      className={`mt-2
      h-full w-full items-center rounded-lg`}
    >
      <Text variant={getFontSizeForSubHeader(branding.fontSize)} className='p-2'>
        {keyset('Error Details')}
      </Text>
      <div className={`ml-2 h-[92%] w-[100%]`}>
        {tabdata ? (
          <JsonView
            theme='atom'
            enableClipboard={false}
            src={tabdata ?? { data: 'data not available' }}
            className='max-h-[60vh] overflow-y-scroll md:max-h-[80vh]'
          />
        ) : (
          <Text className='p-2 text-center'>
            {keyset('No Data available')}
          </Text>
        )}
      </div>
    </div>
  )
}
const LogsHub = ({ width = '18', height = '18', fill = 'black' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M7.971 1.88397C8.16743 2.10839 8.26672 2.40162 8.24703 2.69921C8.22734 2.9968 8.09029 3.27439 7.866 3.47097L5.8335 5.24997L7.866 7.02897C7.98145 7.12499 8.07651 7.24314 8.14558 7.37647C8.21464 7.50981 8.25632 7.65562 8.26815 7.80531C8.27998 7.955 8.26172 8.10555 8.21445 8.24807C8.16718 8.3906 8.09186 8.52222 7.99292 8.63517C7.89399 8.74813 7.77344 8.84014 7.63838 8.90577C7.50333 8.9714 7.3565 9.00934 7.20655 9.01733C7.05661 9.02533 6.90658 9.00323 6.76531 8.95233C6.62404 8.90143 6.49439 8.82276 6.384 8.72097L3.384 6.09597C3.26354 5.99038 3.16702 5.86029 3.10089 5.71439C3.03477 5.56849 3.00056 5.41016 3.00056 5.24997C3.00056 5.08979 3.03477 4.93145 3.10089 4.78555C3.16702 4.63965 3.26354 4.50956 3.384 4.40397L6.384 1.77897C6.60841 1.58254 6.90165 1.48326 7.19924 1.50294C7.49683 1.52263 7.77442 1.65968 7.971 1.88397ZM10.779 1.88397C10.5826 2.10839 10.4833 2.40162 10.503 2.69921C10.5227 2.9968 10.6597 3.27439 10.884 3.47097L12.9165 5.24997L10.884 7.02897C10.7685 7.12499 10.6735 7.24314 10.6044 7.37647C10.5354 7.50981 10.4937 7.65562 10.4819 7.80531C10.47 7.955 10.4883 8.10555 10.5355 8.24807C10.5828 8.3906 10.6581 8.52222 10.7571 8.63517C10.856 8.74813 10.9766 8.84014 11.1116 8.90577C11.2467 8.9714 11.3935 9.00934 11.5434 9.01733C11.6934 9.02533 11.8434 9.00323 11.9847 8.95233C12.126 8.90143 12.2556 8.82276 12.366 8.72097L15.366 6.09597C15.4865 5.99038 15.583 5.86029 15.6491 5.71439C15.7152 5.56849 15.7494 5.41016 15.7494 5.24997C15.7494 5.08979 15.7152 4.93145 15.6491 4.78555C15.583 4.63965 15.4865 4.50956 15.366 4.40397L12.366 1.77897C12.1416 1.58254 11.8484 1.48326 11.5508 1.50294C11.2532 1.52263 10.9756 1.65968 10.779 1.88397ZM4.125 11.25C3.82663 11.25 3.54048 11.3685 3.3295 11.5795C3.11853 11.7905 3 12.0766 3 12.375C3 12.6733 3.11853 12.9595 3.3295 13.1705C3.54048 13.3814 3.82663 13.5 4.125 13.5H19.875C20.1734 13.5 20.4595 13.3814 20.6705 13.1705C20.8815 12.9595 21 12.6733 21 12.375C21 12.0766 20.8815 11.7905 20.6705 11.5795C20.4595 11.3685 20.1734 11.25 19.875 11.25H4.125ZM3 16.875C3 16.5766 3.11853 16.2905 3.3295 16.0795C3.54048 15.8685 3.82663 15.75 4.125 15.75H19.875C20.1734 15.75 20.4595 15.8685 20.6705 16.0795C20.8815 16.2905 21 16.5766 21 16.875C21 17.1733 20.8815 17.4595 20.6705 17.6705C20.4595 17.8814 20.1734 18 19.875 18H4.125C3.82663 18 3.54048 17.8814 3.3295 17.6705C3.11853 17.4595 3 17.1733 3 16.875ZM4.125 20.25C3.82663 20.25 3.54048 20.3685 3.3295 20.5795C3.11853 20.7905 3 21.0766 3 21.375C3 21.6733 3.11853 21.9595 3.3295 22.1705C3.54048 22.3814 3.82663 22.5 4.125 22.5H13.875C14.1734 22.5 14.4595 22.3814 14.6705 22.1705C14.8815 21.9595 15 21.6733 15 21.375C15 21.0766 14.8815 20.7905 14.6705 20.5795C14.4595 20.3685 14.1734 20.25 13.875 20.25H4.125Z'
        fill={fill}
        stroke='white'
        strokeWidth='0.5'
      />
    </svg>
  )
}
