import { twMerge } from 'tailwind-merge'
import { useTheme } from '@/hooks/useTheme'
import { Text } from '@/components/Text'
import { ReactNode } from 'react'
import { hexWithOpacity } from '@/app/components/utils'

const RenderChild = ({
  displayName,
  displayCode,
  codePrefix,
  isSelected,
  onClick,
  existsInContext = true,
  children
}: {
  displayName: string
  displayCode: string
  codePrefix: string
  isSelected: boolean
  onClick: () => void
  existsInContext: boolean
  children?: ReactNode
}) => {
  const { borderColor, bgColor, branding } = useTheme()

  return (
    <div
      style={{
        fontSize: `0.7vw`
      }}
      className={twMerge(
        'flex w-full items-center justify-between  rounded-lg px-[.5vw] py-[1vh] font-semibold',
        children
          ? 'rounded-lg border bg-[var(--g-color-base-background)]  hover:border-[var(--brand-color)] hover:shadow'
          : 'cursor-pointer',
        bgColor ,borderColor
      )}
      key={displayCode}
    >
      <div className={'flex w-full flex-col'}>
        <div
          className={twMerge(
            'flex items-center gap-[0.5vw] rounded-lg border bg-[var(--g-color-base-background)] px-[.5vw] py-[1vh]',
            isSelected
              ? 'bg-unset border-[var(--brand-color)]'
              : `${borderColor} ${bgColor}`
          )}
          style={{
            backgroundColor: isSelected
              ? hexWithOpacity(branding.brandColor, 0.1)
              : 'unset'
          }}
          onClick={() => existsInContext && onClick()}
        >
          <div className='flex flex-col'>
            <Text contentAlign='left'>{displayName}</Text>
            <Text contentAlign='left' color='secondary'>
              {displayCode.replace(codePrefix, '')}
            </Text>
          </div>
        </div>
        {/* Render children (nested subOrgGrp) */}
        {children && <div className='w-full'>{children}</div>}
      </div>
    </div>
  )
}

export default RenderChild
