import { FaRegFolderOpen } from 'react-icons/fa'
import { DownArrow } from '@/app/components/svgApplication'
import { useOPRList } from '../OprList'
import { useGlobal } from '@/context/GlobalContext'
import { useTheme } from '@/hooks/useTheme'
import { hexWithOpacity } from '@/app/components/utils'
import { Text } from '@/components/Text'

// ============= RENDER GROUP (REUSABLE) =============
const RenderGroup = ({
  itemId,
  displayName,
  displayCode,
  codePrefix,
  children,
}: {
  itemId: string
  displayName: string
  displayCode: string
  codePrefix: string
  children: React.ReactNode
}) => {
  const {
    toggleDropdown,
    collapsedItems,
  } = useOPRList()

  const isOpen = !collapsedItems[itemId]
  const { branding } = useGlobal()
  const { isDark } = useTheme()
  const { brandColor } = branding

  return (
    <div
      style={{ backgroundColor: hexWithOpacity(brandColor, 0.1) }}
      className='flex w-full cursor-pointer flex-col gap-[1vh] rounded-lg px-[1vw] py-[1.5vh]'
    >
      <div
        onClick={e => {
          toggleDropdown(itemId)
          e.stopPropagation()
        }}
        className='flex items-center justify-between'
      >
        <div
          className='flex items-center gap-[.5vw]'
          style={{ fontSize: '0.7vw' }}
        >
          <span
            className={`transition-transform duration-300 ease-in-out ${
              isOpen ? 'rotate-[360deg]' : 'rotate-[270deg]'
            }`}
          >
            <DownArrow fill={isDark ? "white" : "black"} />
          </span>
          <FaRegFolderOpen />
          <Text className='flex gap-2'>
            {displayName} -{' '}
            <div className='flex text-nowrap'>
              <Text>{displayCode.replace(codePrefix, '')}</Text>
            </div>
          </Text>
        </div>
      </div>
      {isOpen && children}
    </div>
  )
}

export default RenderGroup
