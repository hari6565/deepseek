import Popup, { PopupPlacement } from '@/components/Popup'
import React, { useContext, useEffect, useMemo } from 'react'
import { getCookie, setCookie } from '../cookieMgment'
import { AxiosService } from '../axiosService'
import clsx from 'clsx'
import { GoChevronDown, GoChevronUp } from 'react-icons/go'
import { OrgStructure, ProdStructure, RoleStructure } from '../svgApplication'
import { Text } from '@/components/Text'
import { useTheme } from '@/hooks/useTheme'
import { MdClose } from 'react-icons/md'
import { LuSearch } from 'react-icons/lu'
import { TotalContext, TotalContextProps } from '@/app/globalContext'
import { getCdnImage } from '@/app/utils/getAssets'
import { isLightColor } from '../utils'
import Image from "next/image";
import axios from 'axios'
import { useGlobal } from '@/context/GlobalContext'

interface Role {
  roleCode: string
  roleName: string
  roleId: string
  originalIndex?: number
}

interface RoleGroup {
  roleGrpCode: string
  roleGrpName: string
  roleGrpId: string
  roles: Role[]
  originalIndex?: number
}

interface Product {
  psCode: string
  psName: string
  psLogo: string
  psId: string
  roleGrp: RoleGroup[]
  originalIndex?: number
}

interface ProductGroup {
  psGrpCode: string
  psGrpName: string
  psGrpId: string
  ps: Product[]
  originalIndex?: number
}

interface SubOrg {
  subOrgCode: string
  subOrgName: string
  subOrgId: string
  srcId: string
  psGrp: ProductGroup[]
  originalIndex?: number
}

interface SubOrgGroup {
  subOrgGrpCode: string
  subOrgGrpName: string
  subOrgGrpId: string
  srcId: string
  subOrg: SubOrg[]
  originalIndex?: number
}

interface Organization {
  orgCode: string
  orgName: string
  orgId: string
  srcId: string
  psGrp: ProductGroup[]
  subOrgGrp?: SubOrgGroup[]
  originalIndex?: number
}

interface OrgGroup {
  orgGrpCode: string
  orgGrpName: string
  orgGrpId: string
  srcId: string
  org: Organization[]
  originalIndex?: number
}

const RenderOrg = ({
  orgGrpData,
  selectedOrg,
  selectedSubOrg,
  onSelectOrg,
  onSelectSubOrg,
  closeModal
}: {
  orgGrpData: OrgGroup[]
  selectedOrg: any
  selectedSubOrg: any
  onSelectOrg: (org: any, item: any) => void
  onSelectSubOrg: (subOrg: any, org: any, subOrgItem: SubOrg) => void
  closeModal: () => void
}) => {
  const [collapsedOrg, setCollapsedOrg] = React.useState(new Set())
  const { borderColor, isDark, bgColor } = useTheme()
  const [searchTerm, setSearchTerm] = React.useState('')

  // Filter function that checks all levels
  const filterOrgData = (orgGrpData: OrgGroup[], searchTerm: string) => {
    if (!searchTerm) return orgGrpData

    const lowerSearch = searchTerm.toLowerCase()

    return orgGrpData
      .map(orgGrp => {
        // Check if orgGrp matches
        const orgGrpMatches = orgGrp.orgGrpName
          .toLowerCase()
          .includes(lowerSearch)

        // Filter organizations
        const filteredOrgs = orgGrp.org
          .map(org => {
            // Check if org matches
            const orgMatches = org.orgName.toLowerCase().includes(lowerSearch)

            // Filter subOrgGroups
            const filteredSubOrgGrps = org.subOrgGrp
              ?.map(subOrgGrp => {
                // Check if subOrgGrp matches
                const subOrgGrpMatches = subOrgGrp.subOrgGrpName
                  .toLowerCase()
                  .includes(lowerSearch)

                // Filter subOrgs
                const filteredSubOrgs = subOrgGrp.subOrg.filter(subOrg =>
                  subOrg.subOrgName.toLowerCase().includes(lowerSearch)
                )

                // Include subOrgGrp if it matches, or has matching subOrgs
                if (subOrgGrpMatches || filteredSubOrgs.length > 0) {
                  return {
                    ...subOrgGrp,
                    subOrg: subOrgGrpMatches
                      ? subOrgGrp.subOrg
                      : filteredSubOrgs
                  }
                }
                return null
              })
              .filter(Boolean) as SubOrgGroup[]

            // Include org if it matches, or has matching subOrgGrps
            if (orgMatches || filteredSubOrgGrps.length > 0) {
              return {
                ...org,
                subOrgGrp: orgMatches ? org.subOrgGrp : filteredSubOrgGrps
              }
            }
            return null
          })
          .filter(Boolean) as Organization[]

        // Include orgGrp if it matches, or has matching orgs
        if (orgGrpMatches || filteredOrgs.length > 0) {
          return {
            ...orgGrp,
            org: orgGrpMatches ? orgGrp.org : filteredOrgs
          }
        }
        return null
      })
      .filter(Boolean) as OrgGroup[]
  }

  const filteredData = filterOrgData(orgGrpData, searchTerm)

  const isOrgSelected = (org: Organization, orgGrp: OrgGroup) => {
    return (
      selectedOrg?.orgCode === org.orgCode &&
      selectedOrg?.orgGrpCode === orgGrp.orgGrpCode
    )
  }

  const isSubOrgSelected = (subOrg: SubOrg, subOrgGrp: SubOrgGroup) => {
    return (
      selectedSubOrg?.subOrgCode === subOrg.subOrgCode &&
      selectedSubOrg?.subOrgGrpCode === subOrgGrp.subOrgGrpCode
    )
  }

  return (
    <div className='flex flex-col gap-4' role='dialog'>
      <div className='flex w-full justify-between'>
        <Text contentAlign='left'>Organization</Text>
        <button onClick={closeModal}>
          <MdClose />
        </button>
      </div>
      <div
        className={clsx(
          'flex w-full items-center gap-[.5vw] rounded-lg border px-4 py-2',
          borderColor
        )}
      >
        <span>
          <LuSearch />
        </span>
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={'Search'}
          className={clsx(`w-full outline-none`, bgColor)}
        />
      </div>
      <div className='flex max-h-96 min-h-60 flex-col gap-2 overflow-y-scroll scrollbar-hide'>
        {filteredData.map((orgGrp: OrgGroup) => (
          <div key={orgGrp.orgGrpId}>
            <div
              className={clsx(
                'flex w-full items-center gap-1 rounded-lg border px-2 py-1',
                borderColor
              )}
            >
              <span
                onClick={() =>
                  setCollapsedOrg(prev => {
                    const updatedPrev = new Set(prev)
                    if (updatedPrev.has(orgGrp.orgGrpId)) {
                      updatedPrev.delete(orgGrp.orgGrpId)
                    } else {
                      updatedPrev.add(orgGrp.orgGrpId)
                    }
                    return updatedPrev
                  })
                }
                className={clsx(
                  'cursor-pointer transition-transform duration-300',
                  {
                    'rotate-180': collapsedOrg.has(orgGrp.orgGrpId)
                  }
                )}
              >
                <GoChevronUp />
              </span>
              <span>{orgGrp.orgGrpName}</span>
            </div>
            <div
              className={clsx('ml-2 mt-2 flex flex-col gap-2 border-l', {
                hidden: collapsedOrg.has(orgGrp.orgGrpId),
                [borderColor]: isDark
              })}
            >
              {orgGrp.org.map((org: Organization) => (
                <div key={org.orgId}>
                  <div
                    className={clsx(
                      'ml-2 flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 hover:bg-[var(--hover-color)]',
                      borderColor,
                      {
                        'bg-[var(--selection-color)]': isOrgSelected(
                          org,
                          orgGrp
                        ),
                        [borderColor]: isDark
                      }
                    )}
                    onClick={() => {
                      onSelectOrg(
                        {
                          orgGrpCode: orgGrp.orgGrpCode,
                          orgGrpName: orgGrp.orgGrpName,
                          orgCode: org.orgCode,
                          orgName: org.orgName,
                          path: `${orgGrp?.originalIndex}.org.${org?.originalIndex}.psGrp`,
                          id: org.orgId
                        },
                        org
                      )
                    }}
                  >
                    <span
                      onClick={e => {
                        e.stopPropagation()
                        setCollapsedOrg(prev => {
                          const updatedPrev = new Set(prev)
                          if (updatedPrev.has(org.orgId)) {
                            updatedPrev.delete(org.orgId)
                          } else {
                            updatedPrev.add(org.orgId)
                          }
                          return updatedPrev
                        })
                      }}
                      className={clsx(
                        'cursor-pointer transition-transform duration-300',
                        {
                          'rotate-180': collapsedOrg.has(org.orgId),
                          hidden: !org?.subOrgGrp?.length
                        }
                      )}
                    >
                      <GoChevronUp />
                    </span>
                    <span>{org.orgName}</span>
                  </div>
                  <div
                    className={clsx('ml-2 mt-2 flex flex-col gap-2 border-l', {
                      hidden: collapsedOrg.has(org.orgId),
                      [borderColor]: isDark
                    })}
                  >
                    {org?.subOrgGrp?.map((subOrgGrp: SubOrgGroup) => (
                      <div key={subOrgGrp.subOrgGrpId}>
                        <div
                          className={clsx(
                            'ml-2 flex items-center gap-1 rounded-lg border px-2 py-1',
                            borderColor
                          )}
                        >
                          <span
                            onClick={() =>
                              setCollapsedOrg(prev => {
                                const updatedPrev = new Set(prev)
                                if (updatedPrev.has(subOrgGrp.subOrgGrpId)) {
                                  updatedPrev.delete(subOrgGrp.subOrgGrpId)
                                } else {
                                  updatedPrev.add(subOrgGrp.subOrgGrpId)
                                }
                                return updatedPrev
                              })
                            }
                            className={clsx(
                              'cursor-pointer transition-transform duration-300',
                              {
                                'rotate-180': collapsedOrg.has(
                                  subOrgGrp.subOrgGrpId
                                ),
                                hidden: !subOrgGrp?.subOrg?.length
                              }
                            )}
                          >
                            <GoChevronUp />
                          </span>
                          <span>{subOrgGrp.subOrgGrpName}</span>
                        </div>
                        <div
                          className={clsx(
                            'ml-2 mt-2 flex flex-col gap-2 border-l',
                            {
                              hidden: collapsedOrg.has(subOrgGrp.subOrgGrpId),
                              [borderColor]: isDark
                            }
                          )}
                        >
                          {subOrgGrp?.subOrg?.map((subOrg: SubOrg) => (
                            <div key={subOrg.subOrgId}>
                              <div
                                className={clsx(
                                  'ml-2 flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 hover:bg-[var(--hover-color)]',
                                  borderColor,
                                  {
                                    'bg-[var(--selection-color)]':
                                      isSubOrgSelected(subOrg, subOrgGrp)
                                  }
                                )}
                                onClick={() => {
                                  onSelectSubOrg(
                                    {
                                      subOrgGrpCode: subOrgGrp.subOrgGrpCode,
                                      subOrgGrpName: subOrgGrp.subOrgGrpName,
                                      subOrgCode: subOrg.subOrgCode,
                                      subOrgName: subOrg.subOrgName,
                                      path: `${orgGrp?.originalIndex}.org.${org?.originalIndex}.subOrgGrp.${subOrgGrp.originalIndex}.subOrg.${subOrg.originalIndex}.psGrp`,
                                      id: subOrg.subOrgId
                                    },
                                    {
                                      orgGrpCode: orgGrp.orgGrpCode,
                                      orgGrpName: orgGrp.orgGrpName,
                                      orgCode: org.orgCode,
                                      orgName: org.orgName
                                    },
                                    subOrg
                                  )
                                }}
                              >
                                <span>{subOrg.subOrgName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const RenderProd = ({
  prodGrpData,
  selectedProd,
  onSelectProd,
  closeModal
}: {
  prodGrpData: ProductGroup[]
  selectedProd: any
  onSelectProd: (prod: any, prodItem: Product) => void
  closeModal: () => void
}) => {
  const [collapsedProd, setCollapsedProd] = React.useState(new Set())
  const { borderColor, isDark, bgColor } = useTheme()
  const [searchTerm, setSearchTerm] = React.useState('')

  // Filter function for products
  const filterProdData = (prodGrpData: ProductGroup[], searchTerm: string) => {
    if (!searchTerm) return prodGrpData

    const lowerSearch = searchTerm.toLowerCase()

    return prodGrpData
      .map(prodGrp => {
        // Check if prodGrp matches
        const prodGrpMatches = prodGrp.psGrpName
          .toLowerCase()
          .includes(lowerSearch)

        // Filter products
        const filteredProds =
          prodGrp.ps?.filter(prod =>
            prod.psName.toLowerCase().includes(lowerSearch)
          ) || []

        // Include prodGrp if it matches, or has matching products
        if (prodGrpMatches || filteredProds.length > 0) {
          return {
            ...prodGrp,
            ps: prodGrpMatches ? prodGrp.ps : filteredProds
          }
        }
        return null
      })
      .filter(Boolean) as ProductGroup[]
  }

  const filteredData = filterProdData(prodGrpData, searchTerm)

  const isProdSelected = (prod: Product, prodGrp: ProductGroup) => {
    return (
      selectedProd?.psCode === prod.psCode &&
      selectedProd?.psGrpCode === prodGrp.psGrpCode
    )
  }

  return (
    <div className='flex flex-col gap-4' role='dialog'>
      <div className='flex w-full justify-between'>
        <Text contentAlign='left'>Products</Text>
        <button onClick={closeModal}>
          <MdClose />
        </button>
      </div>
      <div
        className={clsx(
          'flex w-full items-center gap-[.5vw] rounded-lg border px-4 py-2',
          borderColor
        )}
      >
        <span>
          <LuSearch />
        </span>
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={'Search'}
          className={clsx(`w-full outline-none`, bgColor)}
        />
      </div>
      <div className='flex max-h-96 min-h-60 flex-col gap-2 overflow-y-scroll pr-2 scrollbar-hide'>
        {filteredData.map((prodGrp: ProductGroup) => (
          <div key={prodGrp.psGrpId}>
            <div
              className={clsx(
                'flex w-full items-center gap-1 rounded-lg border px-2 py-1',
                borderColor
              )}
            >
              <span
                onClick={() =>
                  setCollapsedProd(prev => {
                    const updatedPrev = new Set(prev)
                    if (updatedPrev.has(prodGrp.psGrpId)) {
                      updatedPrev.delete(prodGrp.psGrpId)
                    } else {
                      updatedPrev.add(prodGrp.psGrpId)
                    }
                    return updatedPrev
                  })
                }
                className={clsx(
                  'cursor-pointer transition-transform duration-300',
                  {
                    'rotate-180': collapsedProd.has(prodGrp.psGrpId),
                    hidden: !prodGrp?.ps?.length
                  }
                )}
              >
                <GoChevronUp />
              </span>
              <span>{prodGrp.psGrpName}</span>
            </div>
            <div
              className={clsx('ml-2 mt-2 flex flex-col gap-2 border-l', {
                hidden: collapsedProd.has(prodGrp.psGrpId),
                [borderColor]: isDark
              })}
            >
              {prodGrp.ps?.map((prod: Product) => (
                <div key={prod.psId}>
                  <div
                    className={clsx(
                      'ml-2 flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 hover:bg-[var(--hover-color)]',
                      borderColor,
                      {
                        'bg-[var(--selection-color)]': isProdSelected(
                          prod,
                          prodGrp
                        )
                      }
                    )}
                    onClick={() => {
                      onSelectProd(
                        {
                          psGrpCode: prodGrp.psGrpCode,
                          psGrpName: prodGrp.psGrpName,
                          psCode: prod.psCode,
                          psName: prod.psName,
                          psLogo: prod?.psLogo ?? "",
                        },
                        prod
                      )
                    }}
                  >
                    <span>{prod.psName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const RenderRole = ({
  roleGrpData,
  selectedRole,
  onSelectRole,
  closeModal
}: {
  roleGrpData: RoleGroup[]
  selectedRole: any
  onSelectRole: (role: any) => void
  closeModal: () => void
}) => {
  const [collapsedRole, setCollapsedRole] = React.useState(new Set())
  const { borderColor, isDark, bgColor } = useTheme()
  const [searchTerm, setSearchTerm] = React.useState('')

  const isRoleSelected = (role: Role, roleGrp: RoleGroup) => {
    return (
      selectedRole?.roleCode === role.roleCode &&
      selectedRole?.roleGrpCode === roleGrp.roleGrpCode
    )
  }

  // Filter function for roles
  const filterRoleData = (roleGrpData: RoleGroup[], searchTerm: string) => {
    if (!searchTerm) return roleGrpData

    const lowerSearch = searchTerm.toLowerCase()

    return roleGrpData
      .map(roleGrp => {
        // Check if roleGrp matches
        const roleGrpMatches = roleGrp.roleGrpName
          .toLowerCase()
          .includes(lowerSearch)

        // Filter roles
        const filteredRoles =
          roleGrp.roles?.filter(role =>
            role.roleName.toLowerCase().includes(lowerSearch)
          ) || []

        // Include roleGrp if it matches, or has matching roles
        if (roleGrpMatches || filteredRoles.length > 0) {
          return {
            ...roleGrp,
            roles: roleGrpMatches ? roleGrp.roles : filteredRoles
          }
        }
        return null
      })
      .filter(Boolean) as RoleGroup[]
  }

  const filteredData = filterRoleData(roleGrpData, searchTerm)

  return (
    <div className='flex flex-col gap-4' role='dialog'>
      <div className='flex w-full justify-between'>
        <Text contentAlign='left'>Roles</Text>
        <button onClick={closeModal}>
          <MdClose />
        </button>
      </div>
      <div
        className={clsx(
          'flex w-full items-center gap-[.5vw] rounded-lg border px-4 py-2',
          borderColor
        )}
      >
        <span>
          <LuSearch />
        </span>
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={'Search'}
          className={clsx(`w-full outline-none`, bgColor)}
        />
      </div>
      <div className='flex max-h-96 min-h-60 flex-col gap-2 overflow-y-scroll pr-2 scrollbar-hide'>
        {filteredData.map((roleGrp: RoleGroup) => (
          <div key={roleGrp.roleGrpId}>
            <div
              className={clsx(
                'flex w-full items-center gap-1 rounded-lg border px-2 py-1',
                borderColor
              )}
            >
              <span
                onClick={() =>
                  setCollapsedRole(prev => {
                    const updatedPrev = new Set(prev)
                    if (updatedPrev.has(roleGrp.roleGrpId)) {
                      updatedPrev.delete(roleGrp.roleGrpId)
                    } else {
                      updatedPrev.add(roleGrp.roleGrpId)
                    }
                    return updatedPrev
                  })
                }
                className={clsx(
                  'cursor-pointer transition-transform duration-300',
                  {
                    'rotate-180': collapsedRole.has(roleGrp.roleGrpId),
                    hidden: !roleGrp?.roles?.length
                  }
                )}
              >
                <GoChevronUp />
              </span>
              <span>{roleGrp.roleGrpName}</span>
            </div>
            <div
              className={clsx('ml-2 mt-2 flex flex-col gap-2 border-l', {
                hidden: collapsedRole.has(roleGrp.roleGrpId),
                [borderColor]: isDark
              })}
            >
              {roleGrp?.roles?.map((role: Role) => (
                <div key={role.roleId}>
                  <div
                    className={clsx(
                      'ml-2 flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 hover:bg-[var(--hover-color)]',
                      borderColor,
                      {
                        'bg-[var(--selection-color)]': isRoleSelected(
                          role,
                          roleGrp
                        )
                      }
                    )}
                    onClick={() => {
                      onSelectRole({
                        roleGrpCode: roleGrp.roleGrpCode,
                        roleGrpName: roleGrp.roleGrpName,
                        roleCode: role.roleCode,
                        roleName: role.roleName
                      })
                    }}
                  >
                    <span>{role.roleName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const OPRTopNavSelector = ({
  selectedAccessProfile,
  className,
  fullView = true,
  popupPlacement
}: {
  selectedAccessProfile: any
  fullView: boolean
  className?: string
  popupPlacement?: PopupPlacement
}) => {
  const [activeStage, setActiveStage] = React.useState<
    'org' | 'prod' | 'role' | null
  >(null)
  const orgPopupRef = React.useRef<HTMLButtonElement>(null)
  const prodPopupRef = React.useRef<HTMLButtonElement>(null)
  const rolePopupRef = React.useRef<HTMLButtonElement>(null)
  const { matchedAccessProfileData, setMatchedAccessProfileData } = useContext(
    TotalContext
  ) as TotalContextProps
  const tp_ps = getCookie('tp_ps')
  const [selectedOrg, setSelectedOrg] = React.useState<null | any>(null)
  const [selectedSubOrg, setSelectedSubOrg] = React.useState<null | any>(null)
  const [selectedProd, setSelectedProd] = React.useState<null | any>(null)
  const [selectedRole, setSelectedRole] = React.useState<null | any>(null)
  const { branding } = useTheme()
  const { token } = useGlobal()
  const { brandColor } = branding
  const brandTextColor = useMemo(() => {
    if(brandColor){
      return isLightColor(brandColor)
    }else{
      return '#000'
    }
  } , [brandColor])

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

  const getSecurityTemplate = async () => {
    try {
      const res = await AxiosService.get(`UF/getAccessTemplates`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (res.status === 200 && Array.isArray(res['data'])) {
        const matchedAccessProfile = res['data'].find(
          (item: any) => item['accessProfile'] === selectedAccessProfile
        )
        setMatchedAccessProfileData(matchedAccessProfile ?? {})
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (tp_ps) {
      const selectedCombination = JSON.parse(atob(tp_ps))?.selectedCombination
      if (selectedCombination) {
        setSelectedOrg({
          orgGrpCode: selectedCombination.orgGrpCode,
          orgGrpName: selectedCombination.orgGrpName,
          orgCode: selectedCombination.orgCode,
          orgName: selectedCombination.orgName
          // path: `${orgGrp?.originalIndex}.org.${org?.originalIndex}.psGrp`,
          // id: org.orgId
        })
        if (
          selectedCombination?.subOrgGrpCode &&
          selectedCombination?.subOrgGrpName &&
          selectedCombination?.subOrgCode &&
          selectedCombination?.subOrgName
        ) {
          setSelectedSubOrg({
            subOrgGrpCode: selectedCombination?.subOrgGrpCode,
            subOrgGrpName: selectedCombination?.subOrgGrpName,
            subOrgCode: selectedCombination?.subOrgCode,
            subOrgName: selectedCombination?.subOrgName
          })
        }
        setSelectedProd({
          psGrpCode: selectedCombination?.psGrpCode,
          psGrpName: selectedCombination?.psGrpName,
          psCode: selectedCombination?.psCode,
          psName: selectedCombination?.psName,
          psLogo: selectedCombination?.psLogo
        })
        setSelectedRole({
          roleGrpCode: selectedCombination?.roleGrpCode,
          roleGrpName: selectedCombination?.roleGrpName,
          roleCode: selectedCombination?.roleCode,
          roleName: selectedCombination?.roleName
        })
      }
    }
    if (!Object.keys(matchedAccessProfileData).length) {
      getSecurityTemplate()
    }
  }, [])

  const products = useMemo(() => {
    const orgGrpData: OrgGroup[] = matchedAccessProfileData?.orgGrp
    let productList: ProductGroup[] = []
    if (!matchedAccessProfileData?.orgGrp) return productList
    if (selectedSubOrg && selectedOrg) {
      orgGrpData
        .filter(og => og.orgGrpCode === selectedOrg.orgGrpCode)
        .forEach(og => {
          og.org
            .filter(o => o.orgCode === selectedOrg.orgCode)
            .forEach(o => {
              o.subOrgGrp!.filter(
                sog => sog.subOrgGrpCode === selectedSubOrg.subOrgGrpCode
              ).forEach(sog => {
                sog.subOrg
                  .filter(so => so.subOrgCode == selectedSubOrg.subOrgCode)
                  .forEach(so => {
                    productList = so.psGrp
                  })
              })
            })
        })
    } else if (selectedOrg) {
      orgGrpData
        .filter(og => og.orgGrpCode === selectedOrg.orgGrpCode)
        .forEach(og => {
          og.org
            .filter(o => o.orgCode === selectedOrg.orgCode)
            .forEach(o => {
              productList = o.psGrp
            })
        })
    }
    return productList
  }, [matchedAccessProfileData, selectedOrg, selectedSubOrg])

  const roles = useMemo(() => {
    let roleList: RoleGroup[] = []
    if (products && selectedProd) {
      products
        .filter(ps => ps.psGrpCode === selectedProd.psGrpCode)
        .forEach(ps => {
          ps.ps
            .filter(p => p.psCode === selectedProd.psCode)
            .forEach(p => {
              roleList = p.roleGrp
            })
        })
    }
    return roleList
  }, [products, selectedProd])

  const handleSelectOrg = (org: any, orgItem: Organization) => {
    setSelectedOrg(org)
    setSelectedSubOrg(null)
    const firstProductGrp = orgItem.psGrp[0]
    const firstProduct = orgItem.psGrp[0]?.ps[0]
    if (
      firstProduct &&
      Object.keys(firstProduct).length > 0 &&
      firstProductGrp &&
      Object.keys(firstProductGrp).length > 0
    ) {
      const prodData = {
        psGrpCode: firstProductGrp.psGrpCode,
        psGrpName: firstProductGrp.psGrpName,
        psCode: firstProduct.psCode,
        psName: firstProduct.psName
      }
      handleSelectProd(prodData, firstProduct, org, null)
    } else {
      setSelectedProd(null)
      setSelectedRole(null)
    }
  }

  const handleSelectSubOrg = (subOrg: any, org: any, subOrgItem: SubOrg) => {
    setSelectedOrg(org)
    setSelectedSubOrg(subOrg)
    const firstProductGrp = subOrgItem.psGrp[0]
    const firstProduct = subOrgItem.psGrp[0]?.ps[0]
    if (
      firstProduct &&
      Object.keys(firstProduct).length > 0 &&
      firstProductGrp &&
      Object.keys(firstProductGrp).length > 0
    ) {
      const prodData = {
        psGrpCode: firstProductGrp.psGrpCode,
        psGrpName: firstProductGrp.psGrpName,
        psCode: firstProduct.psCode,
        psName: firstProduct.psName
      }
      handleSelectProd(prodData, firstProduct, org, subOrg)
    } else {
      setSelectedProd(null)
      setSelectedRole(null)
    }
  }

  const handleSelectProd = (
    prod: any,
    prodItem: Product,
    org?: any,
    subOrg?: any
  ) => {
    setSelectedProd(prod)
    const firstRoleGrp = prodItem.roleGrp[0]
    const firstRole = prodItem.roleGrp[0]?.roles[0]
    if (
      firstRole &&
      Object.keys(firstRole).length > 0 &&
      firstRoleGrp &&
      Object.keys(firstRoleGrp).length > 0
    ) {
      const roleData = {
        roleGrpCode: firstRoleGrp.roleGrpCode,
        roleGrpName: firstRoleGrp.roleGrpName,
        roleCode: firstRole.roleCode,
        roleName: firstRole.roleName
      }
      handleSelectRole(roleData, org, subOrg, prod)
    } else {
      setSelectedRole(null)
    }
  }

  const getAccessToken = async (
    role: any,
    org?: any,
    subOrg?: any,
    prod?: any
  ) => {
    try {
      const currentOrg = org || selectedOrg
      const currentSubOrg = subOrg !== undefined ? subOrg : selectedSubOrg
      const currentProd = prod || selectedProd

      const selectedCombo = {
        orgGrpCode: currentOrg?.orgGrpCode,
        orgCode: currentOrg?.orgCode,
        orgGrpName: currentOrg?.orgGrpName,
        orgName: currentOrg?.orgName,
        roleGrpCode: role?.roleGrpCode,
        roleCode: role?.roleCode,
        roleGrpName: role?.roleGrpName,
        roleName: role?.roleName,
        psGrpCode: currentProd?.psGrpCode,
        psCode: currentProd?.psCode,
        psGrpName: currentProd?.psGrpName,
        psName: currentProd?.psName,
        psLogo: currentProd?.psLogo,
        subOrgGrpCode: currentSubOrg ? currentSubOrg?.subOrgGrpCode : '',
        subOrgGrpName: currentSubOrg ? currentSubOrg?.subOrgGrpName : '',
        subOrgCode: currentSubOrg ? currentSubOrg?.subOrgCode : '',
        subOrgName: currentSubOrg ? currentSubOrg?.subOrgName : '',
        orgPath: currentSubOrg ? currentSubOrg?.path : currentOrg?.path,
        id: currentSubOrg ? currentSubOrg?.id : currentOrg?.id
      }

     const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''; 
     const res = await axios.post(`${basePath}/next-api/auth/get-access-token`, {
          selectedCombination: selectedCombo,
          selectedAccessProfile: matchedAccessProfileData?.accessProfile,
          dap: matchedAccessProfileData?.dap,
          ufClientType: 'UFW'
        },
      )
      if (res.status == 200) {
        setCookie(
          'tp_ps',
          btoa(
            JSON.stringify({
              selectedCombination: selectedCombo,
              selectedAccessProfile: [matchedAccessProfileData?.accessProfile]
            })
          )
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectRole = (role: any, org?: any, subOrg?: any, prod?: any) => {
    setSelectedRole(role)
    const currentOrg = org || selectedOrg
    const currentSubOrg = subOrg !== undefined ? subOrg : selectedSubOrg
    const currentProd = prod || selectedProd
    // Uncomment to call API
    getAccessToken(role, currentOrg, currentSubOrg, currentProd)
  }

  const handleStageClick = (stage: 'org' | 'prod' | 'role') => {
    setActiveStage(prev => (prev === stage ? null : stage))
  }

  return (
    <div className={clsx(`h-full flex items-center gap-2  ${fullView ? "justify-evenly" : "justify-around px-4"} overflow-visible min-w-0`, className)}>
      <>
        <button
          ref={orgPopupRef}
          onClick={() => handleStageClick('org')}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-full bg-[var(--brand-color)]',
            {
              'w-[unset] px-3 py-1': !fullView,
              'max-w-[8vw] min-w-[7vw] px-[1vw] py-[0.3vh]': fullView
            }
          )}
          style={{
            color : brandTextColor
          }}
          title={selectedOrg?.orgName ? `Organization: \n${selectedOrg?.orgName}` : 'Select Organization'}
        >
          {fullView ? (
            <>
              <div className='w-[90%]'>
                <div className='flex items-center gap-1'>
                  <OrgStructure height='1vw' width='1vw'/>
                  <Text contentAlign='left' className='!text-[0.6vw]'>
                    Organization
                  </Text>
                </div>
                <Text
                  contentAlign='left'
                  className='block w-full truncate text-left'
                >
                  {selectedOrg?.orgName}
                </Text>
              </div>
              <div
                className={clsx('w-[10%] transition-transform duration-300', {
                  'rotate-180': activeStage == 'org'
                })}
              >
                <GoChevronDown />
              </div>
            </>
          ) : (
            <div>
              <OrgStructure height='18' width='18' />
            </div>
          )}
        </button>
      </>
      <>
        <button
          ref={prodPopupRef}
          onClick={() => handleStageClick('prod')}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-full bg-[var(--brand-color)]',
            {
              'w-[unset] px-3 py-1': !fullView,
              'max-w-[8vw] min-w-[7vw] px-[1vw] py-[0.3vh]': fullView
            }
          )}
          style={{
            color : brandTextColor
          }}
          title={selectedProd?.psName ? `Product: \n${selectedProd?.psName}` : 'Select Product'}
        >
          {fullView ? (
            <>
              <div className='w-[90%]'>
                <div className='flex items-center gap-1'>
                  <ProdStructure height='1vw' width='1vw'/>
                  <Text contentAlign='left' className='!text-[0.6vw]'>
                    Products
                  </Text>
                </div>
                <Text
                  contentAlign='left'
                  className='block w-full truncate text-left'
                >
                  {selectedProd?.psName}
                </Text>
              </div>
              <div
                className={clsx('w-[10%] transition-transform duration-300', {
                  'rotate-180': activeStage == 'prod'
                })}
              >
                <GoChevronDown />
              </div>
            </>
          ) : (
            <div>
              <ProdStructure height='18' width='18' />
            </div>
          )}
        </button>
      </>
      <>
        <button
          ref={rolePopupRef}
          onClick={() => handleStageClick('role')}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-full bg-[var(--brand-color)]',
            {
              'w-[unset] px-3 py-1': !fullView,
              'max-w-[8vw] min-w-[7vw] px-[1vw] py-[0.3vh]': fullView
            }
          )}
          style={{
            color : brandTextColor
          }}
          title={selectedRole?.roleName ? `Role: \n${selectedRole?.roleName}` : 'Select Role'}
        >
          {fullView ? (
            <>
              <div className='w-[90%]'>
                <div className='flex items-center gap-1'>
                  <RoleStructure height='1vw' width='1vw'/>
                  <Text contentAlign='left' className='!text-[0.6vw]'>
                    Roles
                  </Text>
                </div>
                <Text
                  contentAlign='left'
                  className='block w-full truncate text-left'
                >
                  {selectedRole?.roleName}
                </Text>
              </div>
              <div
                className={clsx('w-[10%] transition-transform duration-300', {
                  'rotate-180': activeStage == 'role'
                })}
              >
                <GoChevronDown />
              </div>
            </>
          ) : (
            <div>
              <RoleStructure height='18' width='18' />
            </div>
          )}
        </button>
      </>
      {selectedProd?.psLogo && (
  <Image
    className={clsx('h-fit w-fit max-h-[3vh] flex-shrink-0', {  // 👈 add flex-shrink-0
      'border-l px-2': fullView,
      'border-t py-2': !fullView,
    })}
    width={100}
    height={100}
    src={getCdnImage(selectedProd?.psLogo)}
    alt='appLogo'
  />
)}
      <Popup
        key={activeStage}
        anchorRef={
          activeStage == 'role'
            ? rolePopupRef
            : activeStage == 'prod'
              ? prodPopupRef
              : orgPopupRef
        }
        open={activeStage !== null}
        onClose={() => setActiveStage(null)}
        size='xl'
        placement={
          popupPlacement
            ? popupPlacement
            : activeStage == 'role'
              ? 'bottom-start'
              : activeStage == 'prod'
                ? 'bottom'
                : 'bottom-end'
        }
        hasArrow={false}
      >
        {activeStage === 'role' && (
          <>
            <RenderRole
              roleGrpData={roles}
              selectedRole={selectedRole}
              onSelectRole={handleSelectRole}
              closeModal={() => setActiveStage(null)}
            />
          </>
        )}
        {activeStage === 'prod' && (
          <>
            <RenderProd
              prodGrpData={products}
              selectedProd={selectedProd}
              onSelectProd={handleSelectProd}
              closeModal={() => setActiveStage(null)}
            />
          </>
        )}
        {activeStage === 'org' && (
          <>
            <RenderOrg
              orgGrpData={assignOriginalIndex(
                (matchedAccessProfileData as any)?.orgGrp ?? []
              )}
              selectedOrg={selectedOrg}
              selectedSubOrg={selectedSubOrg}
              onSelectOrg={handleSelectOrg}
              onSelectSubOrg={handleSelectSubOrg}
              closeModal={() => setActiveStage(null)}
            />
          </>
        )}
      </Popup>
    </div>
  )
}

export default OPRTopNavSelector
