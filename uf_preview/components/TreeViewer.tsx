'use client'
import React, { useContext, useEffect, useState } from 'react'
import i18n from '@/app/components/i18n'
import { useInfoMsg } from '@/app/components/infoMsgHandler'
import { TotalContext, TotalContextProps } from '@/app/globalContext'
import { useGlobal } from '@/context/GlobalContext'
import { HeaderPosition, TooltipProps as TooltipPropsType } from '@/types/global'

import { Icon } from './Icon'
import { TextInput } from './TextInput'
import { TextArea } from './TextArea'
import { Button } from './Button'
import { Modal } from './Modal'
import { Text } from './Text'
import { Tooltip } from './Tooltip'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
function createData(
  mainObject: any,
  data: any,
  mainkey:any,
  handleClick: (val: any, path: string) => void = () => {},
  isDynamic: boolean = false,
  path: string = '',
  setData: any = () => {},
  setModalPath: any = () => {},
  setModalValue: any = () => {},
  setIsModalOpen: any = () => {},
  setModalKey: any = () => {},
  setModalTargetType: any = () => {},
  viewtype: string = 'collapsed'
): React.ReactNode {
  let obj: any = mainObject
  const handleChange = (value: any, path: any) => {
    const keys = path
      .replace(/^\//, '')
      .split('/')
      .filter((key: any) => key !== '')

    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]

      // Check if key is a valid array index
      const index = Number(key)
      if (!isNaN(index) && Number.isInteger(index) && Array.isArray(current)) {
        current = current[index]
      } else {
        current = current[key]
      }

      if (current === undefined) return false // invalid path
    }

    const finalKey = keys[keys.length - 1]
    const finalIndex = Number(finalKey)

    // Check if final key is a valid array index
    if (
      !isNaN(finalIndex) &&
      Number.isInteger(finalIndex) &&
      Array.isArray(current)
    ) {
      current[finalIndex] = value
    } else {
      current[finalKey] = value || " "
    }

    setData({ ...mainObject,[mainkey]:obj[mainkey]})
  }

  const handleDelete = (path: string) => {
    const keys = path
      .replace(/^\//, '')
      .split('/')
      .filter((key: any) => key !== '')
    if (keys.length === 0) return false

    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      const index = Number(key)
      if (!isNaN(index) && Number.isInteger(index) && Array.isArray(current)) {
        current = current[index]
      } else {
        current = current[key]
      }
      if (current === undefined) return false
    }

    const finalKey = keys[keys.length - 1]
    const finalIndex = Number(finalKey)

    if (
      !isNaN(finalIndex) &&
      Number.isInteger(finalIndex) &&
      Array.isArray(current)
    ) {
      current.splice(finalIndex, 1)
    } else {
      delete current[finalKey]
    }

    setData({ ...obj })
  }

  const isUrl = (str: string): boolean => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  if (data) {
    // Primitive types: string, number, boolean
    if (['string', 'number', 'boolean'].includes(typeof data)) {
      const content = String(data)

      return isUrl(content) ? (
        <div className='flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 p-1.5 transition-colors hover:bg-blue-100'>
          <div className='w-[80px]'>
            <Button
              onClick={() => handleClick(content, path + '/' + content)}
              className='cursor-pointer rounded-full p-1 text-blue-600 transition-colors hover:bg-blue-200'
              view={'flat-success'}
              
              icon={'FaSourcetree'}
            ></Button>
          </div>
          <div className='flex-1'>
            <div className='mb-1 text-xs font-medium text-blue-600'>🔗 URL</div>
            <a
              href={content}
              target='_blank'
              rel='noopener noreferrer'
              className='block'
            >
              {isDynamic ? (
                <TextInput
                  value={content || ''}
                  onChange={(e: any) => handleChange(e.target.value, path)}
                  className='w-full  text-black'
                  
                />
              ) : (
                <Text className='rounded border  px-2 py-1 text-black' variant={'body-1'} >
                  {content}
                </Text>
              )}
            </a>
          </div>
          {isDynamic && (
            <div className='w-[80px]'>
            <Button
              onClick={() => handleDelete(path)}
              view={'normal'}
              
              icon={'FaRegTimesCircle'}
              iconDisplay='Icon only'
            ></Button>
            </div>
          )}
        </div>
      ) : (
        <div className='flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1.5 transition-colors hover:bg-gray-100'>
          <div className='w-[80px]'>
          <Button
            onClick={() => handleClick(content, path + '/' + content)}
            view={'flat-success'}
            icon={'FaSourcetree'}
            iconDisplay='Icon only'
          ></Button>
          </div>
          <div className='flex-1'>
            <div className='mb-1 text-xs font-medium'>
              {typeof data === 'string'
                ? '📝 String'
                : typeof data === 'number'
                ? '🔢 Number'
                : typeof data === 'boolean'
                ? '✅ Boolean'
                : '📄 Value'}
            </div>
            {isDynamic ? (
              <TextInput
                value={content || ''}
                onChange={(e: any) => handleChange(e.target.value, path)}
                className='w-full  text-black'
                
              />
            ) : (
              <Text className='rounded border  px-2 py-1 text-black' variant={'body-1'}>
                {content}
              </Text>
            )}
          </div>
          {isDynamic && (
            <div className='w-[80px]'>
            <Button
              onClick={() => handleDelete(path)}
              view={'normal'}
              
              icon={'FaRegTimesCircle'}
              iconDisplay='Icon only'
            ></Button>
            </div>
          )}
        </div>
      )
    }

    // Array
    else if (Array.isArray(data)) {
      return (
        <div className='rounded-lg border border-orange-200 bg-orange-50 p-2'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>📋</span>
              <span className='font-semibold text-orange-800'>Array</span>
              <span className='rounded-full bg-orange-200 px-2 py-1 text-xs text-orange-800'>
                {data.length} items
              </span>
            </div>
            {isDynamic && (
              <div className='w-[80px]'>
              <Button
                onClick={() => {
                  setModalPath(path)
                  setModalValue('')
                  setModalKey('')
                  setModalTargetType('array')
                  setIsModalOpen(true)
                }}
                view={'normal'}
                
                icon={'FaPlus'}
                iconDisplay='Icon only'
              >
                Add Item
              </Button>
              </div>
            )}
          </div>

          <div className='space-y-3'>
            {data.map((item, idx) => (
              <div
                key={idx}
                className='rounded-lg border border-orange-200  p-3 shadow-sm'
              >
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-1'>
                    <span className='rounded bg-orange-100 px-2 py-1 text-sm font-medium text-orange-800'>
                      [{idx}]
                    </span>
                    <Button
                      onClick={() => handleClick(item, path + '/' + idx)}
                     view={'flat-success'}
                      
                      icon={'FaSourcetree'}
                      iconDisplay='Icon only'
                    ></Button>
                  </div>
                  {isDynamic && (
                    <div className='w-[80px]'>
                    <Button
                      onClick={() => handleDelete(path + '/' + idx)}
                      view={'normal'}
                      
                      icon={'FaRegTimesCircle'}
                      iconDisplay='Icon only'
                    >
                    </Button>
                    </div>
                  )}
                </div>
                <div className='pl-4'>
                  {createData(
                    mainObject,
                    item,
                    mainkey,
                    handleClick,
                    isDynamic,
                    path + '/' + idx,
                    setData,
                    setModalPath,
                    setModalValue,
                    setIsModalOpen,
                    setModalKey,
                    setModalTargetType,
                    viewtype
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Nested object
    else if (typeof data === 'object') {
      return (
        <div className='flex flex-col gap-1'>
          <NestedObject
            mainObject={mainObject}
            data={data}
            mainkey={mainkey}
            handleClick={handleClick}
            isDynamic={isDynamic}
            path={path}
            setData={setData}
            setModalPath={setModalPath}
            setModalValue={setModalValue}
            setIsModalOpen={setIsModalOpen}
            setModalKey={setModalKey}
            setModalTargetType={setModalTargetType}
            viewtype={viewtype}
          />
        </div>
      )
    }
  }

  return <div className='italic text-gray-500'>No Data</div>
}

const NestedObject = ({
  mainObject,
  data,
  mainkey,
  handleClick,
  isDynamic = false,
  path,
  setData = () => {},
  setModalPath = () => {},
  setModalValue = () => {},
  setIsModalOpen = () => {},
  setModalKey = () => {},
  setModalTargetType = () => {},
  viewtype = 'collapsed'
}: {
  mainObject: any
  data: any,
  mainkey:any,
  handleClick: (val: any, path: string) => void
  isDynamic?: boolean
  path: string
  setData: any
  setModalPath: any
  setModalValue: any
  setIsModalOpen: any
  setModalKey: any
  setModalTargetType: any
  viewtype?: string
}) => {
  // Initialize expandedKeys based on viewtype
  const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>(() => {
    if (viewtype === 'expanded') {
      // Expand all keys initially
      const allKeys: { [key: string]: boolean } = {}
      Object.keys(data).forEach(key => {
        allKeys[key] = true
      })
      return allKeys
    }
    return {}
  })

  const toggleKey = (key: string) => {
    setExpandedKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleDelete = (path: string) => {
    const keys = path
      .replace(/^\//, '')
      .split('/')
      .filter((key: any) => key !== '')
    if (keys.length === 0) return false

    let current = mainObject
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      const index = Number(key)
      if (!isNaN(index) && Number.isInteger(index) && Array.isArray(current)) {
        current = current[index]
      } else {
        current = current[key]
      }
      if (current === undefined) return false
    }

    const finalKey = keys[keys.length - 1]
    const finalIndex = Number(finalKey)

    if (
      !isNaN(finalIndex) &&
      Number.isInteger(finalIndex) &&
      Array.isArray(current)
    ) {
      current.splice(finalIndex, 1)
    } else {
      delete current[finalKey]
    }

    setData({ ...mainObject })
  }

  return (
    <div className='rounded-lg border border-purple-200 bg-purple-50 p-2'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-lg'>📁</span>
          <span className='font-semibold text-purple-800'>Object</span>
          <span className='rounded-full bg-purple-200 px-2 py-1 text-xs text-purple-800'>
            {Object.keys(data).length} properties
          </span>
        </div>
        {isDynamic && (
          <div className='w-[80px]'>
          <Button
            onClick={() => {
              setModalPath(path)
              setModalValue('')
              setModalKey('')
              setModalTargetType('object')
              setIsModalOpen(true)
            }}
            view={'normal'}
            
            icon={'FaPlus'}
            iconDisplay='Icon only'
          >
          </Button>
          </div>
        )}
      </div>

      <div className='space-y-2'>
        {Object.keys(data).map(key => {
          const isExpanded = expandedKeys[key]
          return (
            <div
              key={key}
              className='overflow-hidden rounded-lg border border-purple-200  shadow-sm'
            >
              <div className='bg-purple-25 flex items-center justify-between border-b border-purple-100 p-3'>
                <div className='flex items-center gap-1'>
                  <Button
                    onClick={() => handleClick(data[key], path + '/' + key)}
                    view={'flat-success'}
                    
                    icon={'FaSourcetree'}
                    iconDisplay='Icon only'
                  ></Button>
                  <span className='rounded bg-purple-100 px-2 py-1 font-medium text-purple-800'>
                    {key}
                  </span>
                  <span className='text-xs text-purple-600'>
                    {Array.isArray(data[key])
                      ? `Array[${data[key].length}]`
                      : typeof data[key] === 'object' && data[key] !== null
                      ? 'Object'
                      : typeof data[key]}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-[80px]'>
                  <Button
                    onClick={() => toggleKey(key)}
                    view={'flat-info'}
                    
                    iconDisplay='Icon only'
                    icon={isExpanded ? 'FaChevronUp':'FaAngleDown' }
                  ></Button>
                  </div>
                  {isDynamic && (
                    <div className='w-[80px]'>
                    <Button
                      onClick={() => handleDelete(path + '/' + key)}
                      view={'normal'}
                      
                        icon={'FaRegTimesCircle'}
                      iconDisplay='Icon only'
                    ></Button>
                    </div>
                  )}
                </div>
              </div>
              {isExpanded && (
                <div className=' p-4'>
                  {createData(
                    mainObject,
                    data[key],
                    mainkey,
                    handleClick,
                    isDynamic,
                    path + '/' + key,
                    setData,
                    setModalPath,
                    setModalValue,
                    setIsModalOpen,
                    setModalKey,
                    setModalTargetType,
                    viewtype
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface TreeViewerProps {
  mainData: any
  data: any
  handleClick?: (val: any, path: string) => void
  isEditable?: boolean
  path?: string
  mainkey?: string
  viewtype?: 'collapsed' | 'expanded'
  setData?: any
  className?: string
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
}

export const TreeViewer = ({
  mainData,
  data,
  handleClick,
  isEditable,
  path,
  mainkey="",
  viewtype = 'expanded',
  setData,
  className = '',
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top'
}: TreeViewerProps) => {
  const { theme } = useGlobal()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalPath, setModalPath] = useState('')
  const [modalValue, setModalValue] = useState<any>('')
  const [modalKey, setModalKey] = useState('')
  const [modalTargetType, setModalTargetType] = useState('') // 'array' or 'object'
  const handleAddFromModal = () => {
    if (modalValue.trim() === '') return

    // For objects, check if key name is provided
    if (modalTargetType === 'object' && modalKey.trim() === '') {
      alert('Please provide a key name for the object property')
      return
    }

    let parsedValue
    try {
      // Try to parse as JSON first
      parsedValue = JSON.parse(modalValue)
    } catch {
      // If parsing fails, treat as string
      parsedValue = modalValue
    }

    const keys = modalPath
      .replace(/^\//, '')
      .split('/')
      .filter((key: any) => key !== '')

    let current: any = data
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const index = Number(key)
      if (!isNaN(index) && Number.isInteger(index) && Array.isArray(current)) {
        current = current[index]
      } else {
        current = current[key]
      }
      if (current === undefined) return false
    }

    if (Array.isArray(current)) {
      current.push(parsedValue)
    } else if (typeof current === 'object' && current !== null) {
      const keyName = modalKey.trim()
      current[keyName] = parsedValue
    }

    setData({ ...data })
    setIsModalOpen(false)
    setModalValue('')
    setModalKey('')
    setModalPath('')
    setModalTargetType('')
  }

  /////////////////
  const isDark = theme === 'dark' || theme === 'dark-hc'

  const treeViewerElement = (
    <div
      className={className}
      style={{
        height: `100%`,
        width: `100%`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Main Content */}
      <div className='flex h-full flex-col gap-3'>
        {/* Tree Viewer Panel */}
        <div
          className='flex h-full w-full flex-col
           rounded-lg border border-gray-200  shadow-lg'
        >
          {/* Fixed Header */}
          <div className='flex-shrink-0 rounded-t-lg border-b border-gray-200 bg-gray-50 px-6 py-4'>
              <h2 className='flex items-center gap-1 text-lg font-semibold text-gray-800'>
                🌳 Tree View
              </h2>
            </div>
          {/* Scrollable Body */}
            <div className='flex-1 overflow-y-auto p-6'>
              {createData(
                mainData,
                data[mainkey],
                mainkey,
                handleClick,
                isEditable,
                mainkey ? `${path}/${mainkey}` : path,
                setData,
                setModalPath,
                setModalValue,
                setIsModalOpen,
                setModalKey,
              setModalTargetType,
              viewtype
              )}
          </div>
        </div>
      </div>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className='mx-auto max-w-2xl rounded-lg  p-2 shadow-2xl'>
          <div className='mb-4 flex items-center gap-2'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
              <span className='text-2xl'>➕</span>
            </div>
            <div>
              <h3 className='text-xl font-bold text-gray-900'>
                {modalTargetType === 'array' ? 'Add to Array' : 'Add to Object'}
              </h3>
              <p className='text-sm text-gray-600'>
                {modalTargetType === 'array'
                  ? 'Add a new item to the array'
                  : 'Add a new property to the object'}
              </p>
            </div>
          </div>

          {modalTargetType === 'object' && (
            <div className='mb-2'>
              <label className='mb-2 block text-sm font-semibold text-gray-800'>
                Property Name
              </label>
              <TextInput
                value={modalKey}
                onChange={(e: any) => setModalKey(e.target.value)}
                placeholder='e.g., "username", "age", "settings"'
                className='w-full'
                
              />
            </div>
          )}

          <div className='mb-3'>
            <label className='mb-3 block text-sm font-semibold text-gray-800'>
              Value
            </label>
            <div className='mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3'>
              <p className='text-sm text-blue-800'>
                💡 <strong>Tip:</strong> Enter any valid JSON value:
              </p>
              <ul className='ml-4 mt-1 list-disc text-xs text-blue-700'>
                <li>
                  String: <code>"Hello World"</code>
                </li>
                <li>
                  Number: <code>42</code> or <code>3.14</code>
                </li>
                <li>
                  Boolean: <code>true</code> or <code>false</code>
                </li>
                <li>
                  Object:{' '}
                  <code>
                    {'{'}"name": "John"{'}'}
                  </code>
                </li>
                <li>
                  Array: <code>[1, 2, 3]</code> or <code>["a", "b"]</code>
                </li>
              </ul>
            </div>
            <TextArea
              value={modalValue}
              onChange={(e: any) => setModalValue(e.target.value)}
              placeholder='Enter your JSON value here...'
              className='w-full font-mono'
            />
          </div>

          <div className='flex justify-end gap-2 border-t border-gray-200 pt-4'>
            <Button
              onClick={() => setIsModalOpen(false)}
              view='outlined'
              
            >
              Cancel
            </Button>
            <Button onClick={handleAddFromModal} view='action'>
              Add {modalTargetType === 'array' ? 'Item' : 'Property'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )

  return (
     <CommonHeaderAndTooltip
       needTooltip={needTooltip}
       tooltipProps={tooltipProps}
       headerText={headerText}
       headerPosition={headerPosition}
       className={className}

     >
       {treeViewerElement}
     </CommonHeaderAndTooltip>
  )
}


