import React, { useCallback, useContext, useMemo, useState } from 'react'
import _ from 'lodash'
import { Text } from '@/components/Text'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/Button'
import { twMerge } from 'tailwind-merge'
import i18n from '../../components/i18n'
import { SearchIcon, Multiply } from '../../components/svgApplication'
import RenderGroup from './OrgTree/RenderGrp'
import RenderChild from './OrgTree/RenderChild'
import RenderSubOrg from './OrgTree/RenderSubOrgGrp'

interface OprListContextType {
  isSearchOpen: string
  searchTerm: string
  collapsedItems: Record<string, boolean>
  toggleDropdown: (code: string) => void
}

const OprListContext = React.createContext<OprListContextType | null>(null)

// ============= REUSABLE COLUMN HEADER COMPONENT =============
interface ColumnHeaderProps {
  title: string
  searchKey: string
  isSearchOpen: string
  searchTerm: string
  setSearchTerm: (term: string) => void
  setIsSearchOpen: (key: string) => void
  borderColor: string
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  title,
  searchKey,
  isSearchOpen,
  searchTerm,
  setSearchTerm,
  setIsSearchOpen,
  borderColor
}) => {
  const { isDark } = useTheme()
  const bgHeaderColor = isDark ? "bg-gray-700" : "bg-gray-100"

  return (
    <div
      className={twMerge(
        'flex w-full items-center justify-between rounded-tl-lg rounded-tr-lg border-b px-[.5vw] py-[1vh]',
        borderColor,
        bgHeaderColor
      )}
    >
      <Text contentAlign='left' className='font-semibold'>
        {title}
      </Text>
      <>
        {isSearchOpen === searchKey ? (
          <div className='flex h-full items-center gap-2'>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search...'
              className={`w-full rounded-xl border border-[var(--g-color-line-generic)] bg-[var(--g-color-base-background)] px-2 py-0.5 text-sm text-[var(--g-color-text-primary)] focus:outline-none`}
            />
            <Button
              className={'!w-4 !bg-[unset]'}
              onClick={() =>{
                 setIsSearchOpen('')
                 setSearchTerm('')
                }}
            >
              <Multiply
                height='12px'
                width='12px'
                fill={isDark ? 'white' : 'black'}
              />
            </Button>
          </div>
        ) : (
          <div className='flex'>
            <Button
              onClick={() => setIsSearchOpen(searchKey)}
              className={'!bg-[unset]'}
            >
              <SearchIcon
                height='16px'
                width='16px'
                fill={isDark ? 'white' : 'black'}
              />
            </Button>
          </div>
        )}
      </>
    </div>
  )
}

// ============= MAIN COMPONENT =============
const OPRList = ({
  orgData,
  setOrgData,
  selectedOrg,
  setSelectedOrg,
  selectedPs,
  setSelectedPs,
  selectedRole,
  setSelectedRole
}: {
  orgData: any
  setOrgData: any
  selectedOrg: Record<string, string>
  setSelectedOrg: React.Dispatch<React.SetStateAction<Record<string, string>>>
  selectedPs: Record<string, string>
  setSelectedPs: React.Dispatch<React.SetStateAction<Record<string, string>>>
  selectedRole: Record<string, string>
  setSelectedRole: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>(
    {}
  )
  const { borderColor , isDark } = useTheme()
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const keyset = i18n.keyset('language')

  // ============= UTILITY FUNCTIONS =============
  const assignOriginalIndex = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map((item, index) => {
        const updatedItem = { ...item, originalIndex: index }
        for (const key in updatedItem) {
          if (
            Array.isArray(updatedItem[key]) ||
            typeof updatedItem[key] === 'object'
          ) {
            updatedItem[key] = assignOriginalIndex(updatedItem[key])
          }
        }
        return updatedItem
      })
    } else if (typeof data === 'object' && data !== null) {
      const result: any = {}
      for (const key in data) {
        const value = data[key]
        if (Array.isArray(value) || typeof value === 'object') {
          result[key] = assignOriginalIndex(value)
        } else {
          result[key] = value
        }
      }
      return result
    }
    return data
  }

  const organizationDataWithIndexing = useMemo(() => {
    return assignOriginalIndex(orgData)
  }, [orgData])

  const toggleDropdown = (code: string) => {
    setCollapsedItems(prev => ({ ...prev, [code]: !prev[code] }))
  }

  const handleResetSearchFilters = () => {
    setIsSearchOpen('')
    setSearchTerm('')
  }

  const getResource = (requestedPath: string, desiredDataType: [] | {}) => {
    const copyOfOrgData = structuredClone(organizationDataWithIndexing)
    const requestedResource = _.get(copyOfOrgData, requestedPath)
    return requestedResource ? requestedResource : desiredDataType
  }

  const setResource = (path: string, value: any) => {
    const copyOfOrgData = structuredClone(orgData)
    _.set(copyOfOrgData, path, value)
    setOrgData(copyOfOrgData)
  }

  const checkCodeExist = (data: Record<string, any>[], code: string) => {
    return data.find(val =>
      Object.entries(val).find(([key, value]) => {
        if (
          key.toLowerCase().includes('code') &&
          value.split('-').pop() == code.split('-').pop()
        ) {
          return true
        }
        return false
      })
    )
  }

  // ============= SELECTION HANDLERS =============
  const handleOrgClick = (obj: Record<string, string>) => {
    handleResetSearchFilters()
    setSelectedOrg(obj)
    const requiredPsGroup = getResource(`${obj['path']}.0`, {})
    if (requiredPsGroup && typeof requiredPsGroup?.['ps']?.[0] == 'object') {
      handlePsClick({
        psGrpName: requiredPsGroup.psGrpName,
        psGrpCode: requiredPsGroup.psGrpCode,
        psName: requiredPsGroup?.['ps'][0]['psName'],
        psLogo: requiredPsGroup?.['ps'][0]['psLogo'],
        psCode: requiredPsGroup?.['ps'][0]['psCode'],
        path: `${obj['path']}.0.ps.0.roleGrp`,
        id: requiredPsGroup?.['ps'][0]['psId']
      })
    } else {
      setSelectedPs({})
      setSelectedRole({})
    }
  }

  const handlePsClick = (obj: Record<string, string>) => {
    handleResetSearchFilters()
    setSelectedPs(obj)
    const requiredRoleGrp = getResource(`${obj['path']}.0`, {})
    if (requiredRoleGrp && typeof requiredRoleGrp?.['roles']?.[0] == 'object') {
      handleRoleClick({
        roleGrpName: requiredRoleGrp.roleGrpName,
        roleGrpCode: requiredRoleGrp.roleGrpCode,
        roleName: requiredRoleGrp?.['roles'][0]['roleName'],
        roleCode: requiredRoleGrp?.['roles'][0]['roleCode'],
        roleCount: requiredRoleGrp?.['roles']?.length ?? 0,
        path: `${obj['path']}.0.roles.0`,
        id: requiredRoleGrp?.['roles'][0]['roleId']
      })
    } else {
      setSelectedRole({})
    }
  }

  const handleRoleClick = (obj: Record<string, string>) => {
    handleResetSearchFilters()
    setSelectedRole(obj)
  }

  // ============= GET SELECTED GROUPS =============
  const getSelectedPsGrps = useCallback(() => {
    if (selectedOrg && selectedOrg?.path) {
      return getResource(selectedOrg?.path, [])
    }
    return []
  }, [selectedOrg])

  const getSelectedRoleGrps = useCallback(() => {
    if (selectedPs && selectedPs?.path) {
      return getResource(selectedPs?.path, [])
    }
    return []
  }, [selectedPs])

  // ============= AGGREGATE ALL PRODUCTS/ROLES =============
  const allProducts = useMemo(() => {
    const result: any[] = []
    organizationDataWithIndexing.forEach((orgGrp: any) => {
      orgGrp?.org?.forEach((org: any) => {
        org?.psGrp?.forEach((psGrp: any) => {
          const existingGroup = result.find(
            g =>
              g.orgGrpCode === orgGrp.orgGrpCode &&
              g.orgCode === org.orgCode &&
              g.psGrpCode === psGrp.psGrpCode
          )

          const products = psGrp?.ps?.map((ps: any) => ({
            orgGrpCode: orgGrp.orgGrpCode,
            orgCode: org.orgCode,
            psGrpCode: psGrp.psGrpCode,
            psGrpName: psGrp.psGrpName,
            ...ps
          }))

          if (existingGroup) {
            existingGroup.ps.push(...products)
          } else {
            result.push({
              orgGrpCode: orgGrp.orgGrpCode,
              orgCode: org.orgCode,
              psGrpCode: psGrp.psGrpCode,
              psGrpName: psGrp.psGrpName,
              psGrpId: psGrp.psGrpId,
              originalIndex: psGrp.originalIndex,
              ps: products
            })
          }
        })
      })
    })
    return result
  }, [organizationDataWithIndexing])

  const classifiedProducts = useMemo(() => {
    const selectedPsGrps = getSelectedPsGrps()
    return allProducts.map(group => {
      const match = selectedPsGrps.find(
        (g: any) =>
          g?.psGrpCode?.split('-')?.pop() ===
          group?.psGrpCode?.split('-')?.pop()
      )

      const psWithFlags = group.ps.map((ps: any) => {
        const exists = match?.ps?.some(
          (p: any) => p.psCode.split('-').pop() === ps.psCode.split('-').pop()
        )
        return { ...ps, existsInCurrentOrg: !!exists }
      })

      return {
        ...group,
        ps: psWithFlags,
        existsInCurrentOrg: !!match
      }
    })
  }, [allProducts, selectedOrg, organizationDataWithIndexing])

  const psGroupsToRender =
    isSearchOpen === 'product' && searchTerm
      ? classifiedProducts.filter(group => {
          const term = searchTerm.toLowerCase()
          const matchesGroup = group.psGrpName.toLowerCase().includes(term)
          const matchesProduct = group.ps.some((p: any) =>
            p.psName.toLowerCase().includes(term)
          )
          return matchesGroup || matchesProduct
        })
      : getSelectedPsGrps() ?? []

  const allRoles = useMemo(() => {
    const result: any[] = []
    organizationDataWithIndexing.forEach((orgGrp: any) => {
      orgGrp.org.forEach((org: any) => {
        org.psGrp.forEach((psGrp: any) => {
          psGrp.ps.forEach((ps: any) => {
            ps.roleGrp.forEach((roleGrp: any) => {
              const existingGroup = result.find(
                g =>
                  g.orgGrpCode === orgGrp.orgGrpCode &&
                  g.orgCode === org.orgCode &&
                  g.psGrpCode === psGrp.psGrpCode &&
                  g.psCode === ps.psCode &&
                  g.roleGrpCode === roleGrp.roleGrpCode
              )

              const roles =
                roleGrp.roles?.map((role: any) => ({
                  orgGrpCode: orgGrp.orgGrpCode,
                  orgCode: org.orgCode,
                  psGrpCode: psGrp.psGrpCode,
                  psGrpName: psGrp.psGrpName,
                  psCode: ps.psCode,
                  psName: ps.psName,
                  psLogo: ps.psLogo,
                  roleGrpCode: roleGrp.roleGrpCode,
                  roleGrpName: roleGrp.roleGrpName,
                  ...role
                })) || []

              if (existingGroup) {
                existingGroup.roles.push(...roles)
              } else {
                result.push({
                  orgGrpCode: orgGrp.orgGrpCode,
                  orgCode: org.orgCode,
                  psGrpCode: psGrp.psGrpCode,
                  psGrpName: psGrp.psGrpName,
                  psCode: ps.psCode,
                  psName: ps.psName,
                  psLogo: ps.psLogo,
                  roleGrpCode: roleGrp.roleGrpCode,
                  roleGrpName: roleGrp.roleGrpName,
                  roleGrpId: roleGrp.roleGrpId,
                  originalIndex: roleGrp.originalIndex,
                  roles
                })
              }
            })
          })
        })
      })
    })
    return result
  }, [organizationDataWithIndexing])

  const classifiedRoles = useMemo(() => {
    const selectedRoleGrps = getSelectedRoleGrps()
    return allRoles.map(group => {
      const matchRoleGrp = selectedRoleGrps.find(
        (rg: any) =>
          rg.roleGrpCode.split('-').pop() === group.roleGrpCode.split('-').pop()
      )

      const rolesWithFlags = group.roles.map((role: any) => {
        const exists = matchRoleGrp?.roles?.some(
          (r: any) =>
            r.roleCode.split('-').pop() === role.roleCode.split('-').pop()
        )
        return { ...role, existsInCurrentRoleGrp: !!exists }
      })

      return {
        ...group,
        roles: rolesWithFlags,
        existsInCurrentRoleGrp: !!matchRoleGrp
      }
    })
  }, [allRoles, selectedPs, organizationDataWithIndexing])

  const roleGroupsToRender =
    isSearchOpen === 'role' && searchTerm
      ? classifiedRoles.filter(group => {
          const term = searchTerm.toLowerCase()
          const matchesGroup = group.roleGrpName.toLowerCase().includes(term)
          const matchesRole = group.roles.some((r: any) =>
            r.roleName.toLowerCase().includes(term)
          )
          return matchesGroup || matchesRole
        })
      : getSelectedRoleGrps() ?? []

  return (
    <OprListContext.Provider
      value={{
        collapsedItems,
        toggleDropdown,
        isSearchOpen,
        searchTerm
      }}
    >
      <div className='flex h-full w-full flex-col gap-[2vh]'>
        <div className='flex w-full items-center gap-[1vw]'>
          {/* ============= ORGANIZATION COLUMN ============= */}
          <div
            className={twMerge('h-full w-1/3 rounded-lg border', borderColor , bgColor)}
          >
            <ColumnHeader
              title={keyset('Organization')}
              searchKey='org'
              isSearchOpen={isSearchOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setIsSearchOpen={setIsSearchOpen}
              borderColor={borderColor}
            />

            <div className='flex h-[55vh] w-full flex-col gap-[1vh] overflow-y-auto px-[.5vw] py-[1.5vh]'>
              {organizationDataWithIndexing.length ? (
                organizationDataWithIndexing
                  .filter((group: any) => {
                    if (isSearchOpen !== 'org') return group
                    const term = searchTerm.toLowerCase()
                    const matchesGroup = group.orgGrpName
                      .toLowerCase()
                      .includes(term)
                    const matchesProduct = group.org.some((org: any) =>
                      org.orgName.toLowerCase().includes(term)
                    )
                    return matchesGroup || matchesProduct
                  })
                  .map((orgGrp: any, orgGrpIndex: number) => (
                    <React.Fragment key={orgGrpIndex}>
                      <RenderGroup
                        displayCode={orgGrp.orgGrpCode}
                        displayName={orgGrp.orgGrpName}
                        codePrefix={''}
                        itemId={orgGrp.orgGrpId}
                      >
                        {orgGrp.org.map((org: any, orgIndex: number) => (
                          <RenderChild
                            displayName={org.orgName}
                            displayCode={org.orgCode}
                            codePrefix={`${orgGrp.orgGrpCode}-`}
                            isSelected={selectedOrg.id === org.orgId}
                            existsInContext={true}
                            onClick={() =>
                              handleOrgClick({
                                orgGrpCode: orgGrp.orgGrpCode,
                                orgGrpName: orgGrp.orgGrpName,
                                orgName: org.orgName,
                                orgCode: org.orgCode,
                                path: `${orgGrp?.originalIndex}.org.${org?.originalIndex}.psGrp`,
                                id: org.orgId
                              })
                            }
                            key={org.orgId}
                          >
                            {org?.subOrgGrp?.map(
                              (sub: any, suborgIndex: number) => {
                                return (
                                  <RenderSubOrg
                                    key={sub.subOrgGrpId}
                                    subOrgGrp={sub}
                                    subOrgGrpIndex={suborgIndex}
                                    parentPath={`${orgGrp?.originalIndex}.org.${org?.originalIndex}.subOrgGrp`}
                                    parentCode={org.orgCode}
                                    handleOrgClick={handleOrgClick}
                                    isSearchOpen={isSearchOpen}
                                    searchTerm={searchTerm}
                                    orgGrpCode={orgGrp.orgGrpCode}
                                    orgGrpName={orgGrp.orgGrpName}
                                    orgName={org.orgName}
                                    orgCode={org.orgCode}
                                    selectedOrg={selectedOrg}
                                  />
                                )
                              }
                            )}
                          </RenderChild>
                        ))}
                      </RenderGroup>
                    </React.Fragment>
                  ))
              ) : (
                <Text color='secondary'>
                  Please select an access profile to continue
                </Text>
              )}
            </div>
          </div>

          {/* ============= PRODUCTS/SERVICES COLUMN ============= */}
          <div
            className={twMerge('h-full w-1/3 rounded-lg border', borderColor , bgColor)}
          >
            <ColumnHeader
              title={keyset('Products/Services')}
              searchKey='product'
              isSearchOpen={isSearchOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setIsSearchOpen={setIsSearchOpen}
              borderColor={borderColor}
            />

            <div className='flex h-[55vh] w-full flex-col gap-[1vh] overflow-y-auto px-[.5vw] py-[1.5vh]'>
              {psGroupsToRender.length ? (
                psGroupsToRender.map((psg: any, psgIndex: number) => (
                  <React.Fragment key={psgIndex}>
                    <RenderGroup
                      displayCode={psg.psGrpCode}
                      displayName={psg.psGrpName}
                      codePrefix={`${selectedOrg.orgCode}-`}
                      itemId={psg.psGrpId}
                    >
                      {psg.ps
                        .filter((ps: any) =>
                          isSearchOpen === 'product' && searchTerm
                            ? ps.psName
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            : true
                        )
                        .map((ps: any) => {
                          const isExist =
                            isSearchOpen === 'product'
                              ? ps.existsInCurrentOrg
                              : true

                          return (
                            <RenderChild
                              key={ps.psId}
                              displayName={ps.psName}
                              displayCode={ps.psCode}
                              codePrefix={`${psg.psGrpCode}-`}
                              isSelected={selectedPs.id === ps.psId}
                              existsInContext={isExist}
                              onClick={() =>
                                handlePsClick({
                                  psGrpCode: psg.psGrpCode,
                                  psGrpName: psg.psGrpName,
                                  psCode: ps.psCode,
                                  psName: ps.psName,
                                  psLogo: ps.psLogo,
                                  path: `${selectedOrg.path}.${psg.originalIndex}.ps.${ps.originalIndex}.roleGrp`,
                                  id: ps.psId
                                })
                              }
                            />
                          )
                        })}
                    </RenderGroup>
                  </React.Fragment>
                ))
              ) : (
                <Text color='secondary'>
                  Please select a organization to continue
                </Text>
              )}
            </div>
          </div>

          {/* ============= ROLES COLUMN ============= */}
          <div
            className={twMerge('h-full w-1/3 rounded-lg border', borderColor , bgColor)}
          >
            <ColumnHeader
              title={keyset('Roles')}
              searchKey='role'
              isSearchOpen={isSearchOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setIsSearchOpen={setIsSearchOpen}
              borderColor={borderColor}
            />

            <div className='flex h-[55vh] w-full flex-col gap-[1vh] overflow-y-auto px-[.5vw] py-[1.5vh]'>
              {roleGroupsToRender.length ? (
                roleGroupsToRender.map((roleGrp: any, roleGrpIndex: number) => (
                  <React.Fragment key={roleGrpIndex}>
                    <RenderGroup
                      displayCode={roleGrp.roleGrpCode}
                      displayName={roleGrp.roleGrpName}
                      codePrefix={`${selectedPs.psCode}-`}
                      itemId={roleGrp.roleGrpId}
                    >
                      {roleGrp.roles.map((role: any) => {
                        const isExist =
                          isSearchOpen === 'role'
                            ? role.existsInCurrentRoleGrp
                            : true

                        return (
                          <RenderChild
                            key={role.roleId}
                            displayName={role.roleName}
                            displayCode={role.roleCode}
                            codePrefix={`${roleGrp.roleGrpCode}-`}
                            isSelected={selectedRole.id === role.roleId}
                            existsInContext={isExist}
                            onClick={() =>
                              handleRoleClick({
                                roleGrpCode: roleGrp.roleGrpCode,
                                roleGrpName: roleGrp.roleGrpName,
                                roleCode: role.roleCode,
                                roleName: role.roleName,
                                roleCount: roleGrp.roles?.length ?? 0,
                                path: `${selectedPs.path}.${roleGrp.originalIndex}.roles.${role.originalIndex}`,
                                id: role.roleId
                              })
                            }
                          />
                        )
                      })}
                    </RenderGroup>
                  </React.Fragment>
                ))
              ) : (
                <Text color='secondary'>
                  Please select a product/service to continue
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </OprListContext.Provider>
  )
}

export default OPRList

export function useOPRList() {
  const context = useContext(OprListContext)
  if (!context) {
    throw new Error(
      'useOPRMatrix must be used within a OprMatrixContext Provider'
    )
  }
  return context
}
