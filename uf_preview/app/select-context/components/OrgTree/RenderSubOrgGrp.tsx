import React from 'react'
import { FaRegFolderOpen } from 'react-icons/fa'
import RenderChild from './RenderChild'
import { useOPRList } from '../OprList'
import { twMerge } from 'tailwind-merge'
import { DownArrow } from '@/app/components/svgApplication'
import { useTheme } from '@/hooks/useTheme'
import { hexWithOpacity } from '@/app/components/utils'

interface RenderSubOrgProps {
  subOrgGrp: any
  subOrgGrpIndex: number
  parentPath: string
  parentCode: string
  handleOrgClick: (obj: Record<string, string>) => void
  isSearchOpen: string
  searchTerm: string
  orgGrpCode: string
  orgGrpName: string
  selectedOrg: Record<string, string>
  orgCode: string
  orgName: string
}

const RenderSubOrg: React.FC<RenderSubOrgProps> = ({
  subOrgGrp,
  subOrgGrpIndex,
  parentPath,
  parentCode,
  handleOrgClick,
  isSearchOpen,
  searchTerm,
  orgGrpCode,
  orgGrpName,
  selectedOrg,
  orgCode,
  orgName
}) => {
  const { toggleDropdown, collapsedItems } = useOPRList()
  const { isDark, branding , borderColor } = useTheme()
  const isOpen = !collapsedItems[subOrgGrp.subOrgGrpId]

  return (
    <div
      className={twMerge(
        'mt-[1vh] flex w-full flex-col gap-[1vh] rounded-lg border bg-[var(--g-color-base-background)] px-[.5vw] py-[1vh] font-semibold hover:border-[var(--brand-color)] hover:shadow',
        borderColor
      )}
      style={{
        backgroundColor: hexWithOpacity(branding.brandColor, 0.1)
      }}
    >
      {/* Sub Org Group Header */}
      <div
        onClick={e => {
          toggleDropdown(subOrgGrp.subOrgGrpId)
          e.stopPropagation()
        }}
        className='flex cursor-pointer items-center justify-between'
      >
        <div className='flex items-center gap-[.5vw]'>
          <span
            className={`transition-transform duration-300 ease-in-out ${
              isOpen ? 'rotate-[360deg]' : 'rotate-[270deg]'
            }`}
          >
            <DownArrow fill={isDark ? 'white' : 'black'} />
          </span>
          <FaRegFolderOpen color={isDark ? 'white' : 'black'} />
          <span className='text-torus-text'>
            {subOrgGrp.subOrgGrpName} -{' '}
            <span className='text-torus-text-opacity-50'>
              {subOrgGrp.subOrgGrpCode.replace(`${parentCode}-`, '')}
            </span>
          </span>
        </div>
      </div>

      {/* Sub Organizations */}
      {isOpen && (
        <div className='ml-[1vw] flex flex-col gap-[1vh]'>
          {subOrgGrp.subOrg?.map((subOrg: any, subOrgIndex: number) => (
            <RenderChild
              key={subOrg.subOrgId}
              displayName={subOrg.subOrgName}
              displayCode={subOrg.subOrgCode}
              codePrefix={`${subOrgGrp.subOrgGrpCode}-`}
              isSelected={selectedOrg.id === subOrg.subOrgId}
              onClick={() => {
                handleOrgClick({
                  orgGrpCode: subOrgGrp.subOrgGrpCode,
                  orgGrpName: subOrgGrp.subOrgGrpName,
                  orgName: subOrg.subOrgName,
                  orgCode: subOrg.subOrgCode,
                  path: `${parentPath}.${subOrgGrpIndex}.subOrg.${subOrg.originalIndex}.psGrp`,
                  id: subOrg.subOrgId,
                  mainOrgGrpName: orgGrpName,
                  mainOrgGrpCode: orgGrpCode,
                  mainOrgCode: orgCode,
                  mainOrgName: orgName
                })
              }}
              existsInContext={true}
            >
              {/* Recursively render nested subOrgGrp */}
              {subOrg.subOrgGrp?.map(
                (nestedSubOrgGrp: any, nestedIndex: number) => (
                  <RenderSubOrg
                    key={nestedSubOrgGrp.subOrgGrpId}
                    subOrgGrp={nestedSubOrgGrp}
                    subOrgGrpIndex={nestedIndex}
                    parentPath={`${parentPath}.${subOrgGrpIndex}.subOrg.${subOrg.originalIndex}.subOrgGrp`}
                    parentCode={subOrg.subOrgCode}
                    handleOrgClick={handleOrgClick}
                    isSearchOpen={isSearchOpen}
                    searchTerm={searchTerm}
                    orgGrpCode={orgGrpCode}
                    orgGrpName={orgGrpName}
                    selectedOrg={selectedOrg}
                    orgCode={subOrg.subOrgCode}
                    orgName={subOrg.subOrgName}
                  />
                )
              )}
            </RenderChild>
          ))}
        </div>
      )}
    </div>
  )
}

export default RenderSubOrg
