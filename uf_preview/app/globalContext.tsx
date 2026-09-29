


"use client"
import React, { useEffect } from 'react';
import { getCookie } from './components/cookieMgment';
import { usePathname } from 'next/navigation'
export interface TotalContextProps {
  currentToken: any 
  setCurrentToken: React.Dispatch<React.SetStateAction<any>>
  matchedAccessProfileData: any;
  setMatchedAccessProfileData: React.Dispatch<React.SetStateAction<any>>
  group951d8: any 
  setgroup951d8: React.Dispatch<React.SetStateAction<any>>
  group951d8Props: any 
  setgroup951d8Props: React.Dispatch<React.SetStateAction<any>>
  tabled733f: any 
  settabled733f: React.Dispatch<React.SetStateAction<any>>
  tabled733fProps: any 
  settabled733fProps: React.Dispatch<React.SetStateAction<any>>
  comboboxb853a: any,
  setcomboboxb853a:React.Dispatch<React.SetStateAction<any>>
  comboboxb853aProps: any 
  setcomboboxb853aProps: React.Dispatch<React.SetStateAction<any>>
  button7807e: any,
  setbutton7807e:React.Dispatch<React.SetStateAction<any>>
  button7807eProps: any 
  setbutton7807eProps: React.Dispatch<React.SetStateAction<any>>
  piechart0bf98: any,
  setpiechart0bf98:React.Dispatch<React.SetStateAction<any>>
  piechart0bf98Props: any 
  setpiechart0bf98Props: React.Dispatch<React.SetStateAction<any>>
  barchartf25ad: any,
  setbarchartf25ad:React.Dispatch<React.SetStateAction<any>>
  barchartf25adProps: any 
  setbarchartf25adProps: React.Dispatch<React.SetStateAction<any>>
  country0215e: any,
  setcountry0215e:React.Dispatch<React.SetStateAction<any>>
  country0215eProps: any 
  setcountry0215eProps: React.Dispatch<React.SetStateAction<any>>

////// screen states 
  barchart_v1: any 
  setbarchart_v1: React.Dispatch<React.SetStateAction<any>>
  barchart_v1Props: any 
  setbarchart_v1Props: React.Dispatch<React.SetStateAction<any>>

///////// dfd
  dfd_chart_v1Props: any 
  setdfd_chart_v1Props: React.Dispatch<React.SetStateAction<any>>
  dfd_country_code_dfd_v1Props: any 
  setdfd_country_code_dfd_v1Props: React.Dispatch<React.SetStateAction<any>>

  refetch: any,
  setRefetch: React.Dispatch<React.SetStateAction<any>>
  searchParam: string,
  setSearchParam: React.Dispatch<React.SetStateAction<string>>
  disableParam: Record<string, boolean>,
  setDisableParam: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  globalState: Record<string, any>,
  setGlobalState: React.Dispatch<React.SetStateAction<Record<string, any>>>
  // for all textInput validation
  validate: Record<string, any>,
  setValidate: React.Dispatch<React.SetStateAction<Record<string, any>>>

  //its used for validate once again on button click
  validateRefetch: { value: boolean; init: number },
  setValidateRefetch: React.Dispatch<React.SetStateAction<{ value: boolean; init: number }>>
  accessProfile:any,
  setAccessProfile: React.Dispatch<React.SetStateAction<any>>
  memoryVariables: Record<string, string>
  setMemoryVariables: React.Dispatch<React.SetStateAction<Record<string, string>>>
  property: Record<string, any>
  setProperty: React.Dispatch<React.SetStateAction<Record<string, any>>>
  refresh: Record<string, boolean>,
  setRefresh: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  lockedData: Record<string, any>,
  setLockedData: React.Dispatch<React.SetStateAction<Record<string, any>>>
  tableData: Record<string, any>,
  setTableData: React.Dispatch<React.SetStateAction<Record<string, any>>>    
  paginationDetails: Record<string, any>,
  setpaginationDetails: React.Dispatch<React.SetStateAction<Record<string, any>>>
  eventEmitterData: any,
  setEventEmitterData: React.Dispatch<React.SetStateAction<any>>
  userDetails: Record<string, any>,
  setUserDetails: React.Dispatch<React.SetStateAction<Record<string, any>>>
  encAppFalg: Record<string, any>,
  setEncAppFalg: React.Dispatch<React.SetStateAction<Record<string, any>>>
}

export const TotalContext = React.createContext<TotalContextProps | {}>({})

const GlobalContext = ({children} : {children: React.ReactNode}) => {
    const [currentToken, setCurrentToken ] = React.useState<any>({})
    const [matchedAccessProfileData, setMatchedAccessProfileData] = React.useState<any>({})
    const pathname = usePathname()
      //////////
        const [group951d8, setgroup951d8 ] = React.useState<any>({}) 
    const [group951d8Props, setgroup951d8Props ] = React.useState<any>({
      validation:false,
      required:false,
      refetch:false,
      refresh:false, // if change this value to true group array refresh will not work
      isDisabled: false,
      presetValues: '',
      isHidden: false,
      selectedIds:[],
      controls:[
            "combobox",
            "combobox",
            "button",
            "name",
            "name",
      ]
      }) 
    
    const [tabled733f, settabled733f ] = React.useState<any>([]) 
    const [tabled733fProps, settabled733fProps ] = React.useState<any>({
      validation:false,
      required:false,
      refetch:false,
      isDisabled: false,
      presetValues: '',
      isHidden: false,
      selectedIds:[],
      refresh:false,
      filterInitalLoad: false,
      }) 
   const [comboboxb853a,setcomboboxb853a] = React.useState<any>({
    isDisabled: null,
    presetValues: '',
    isHidden: false,
    refetch:false,
    refresh:false,
    trigger: null,
    currentIndex: 0,
    totalFiles: 0
    }) 
   const [comboboxb853aProps,setcomboboxb853aProps] = React.useState<any>({}) 
   const [button7807e,setbutton7807e] = React.useState<any>({
    isDisabled: null,
    presetValues: '',
    isHidden: false,
    refetch:false,
    refresh:false,
    trigger: null,
    currentIndex: 0,
    totalFiles: 0
    }) 
   const [button7807eProps,setbutton7807eProps] = React.useState<any>({}) 
   const [piechart0bf98,setpiechart0bf98] = React.useState<any>({
    isDisabled: null,
    presetValues: '',
    isHidden: false,
    refetch:false,
    refresh:false,
    trigger: null,
    currentIndex: 0,
    totalFiles: 0
    }) 
   const [piechart0bf98Props,setpiechart0bf98Props] = React.useState<any>({}) 
   const [barchartf25ad,setbarchartf25ad] = React.useState<any>({
    isDisabled: null,
    presetValues: '',
    isHidden: false,
    refetch:false,
    refresh:false,
    trigger: null,
    currentIndex: 0,
    totalFiles: 0
    }) 
   const [barchartf25adProps,setbarchartf25adProps] = React.useState<any>({}) 
   const [country0215e,setcountry0215e] = React.useState<any>({
    isDisabled: null,
    presetValues: '',
    isHidden: false,
    refetch:false,
    refresh:false,
    trigger: null,
    currentIndex: 0,
    totalFiles: 0
    }) 
   const [country0215eProps,setcountry0215eProps] = React.useState<any>({}) 
    ///////////
    const [refresh, setRefresh] = React.useState<Record<string, boolean>>({       comboboxcomboboxb853a:false,
       buttonbutton7807e:false,
       piechartpiechart0bf98:false,
       barchartbarchartf25ad:false,
       columncountry0215e:false,
       groupgroup951d8:false,
       tabletabled733f:false,
      })

  ////// screen states 
  const [barchart_v1,setbarchart_v1] = React.useState<any>({
    _selectedGroup_:"",
    _selectionColor_:"!bg-blue-200"
    })
  const [barchart_v1Props,setbarchart_v1Props] = React.useState<any>({})

///////// dfd
  const [dfd_chart_v1Props,setdfd_chart_v1Props] = React.useState<any>([])
  const [dfd_country_code_dfd_v1Props,setdfd_country_code_dfd_v1Props] = React.useState<any>([])
    const [searchParam , setSearchParam] = React.useState<string>("")
    const [disableParam , setDisableParam] = React.useState<Record<string, boolean>>({})
    const [globalState , setGlobalState] = React.useState<Record<string, any>>({})
    const [refetch, setRefetch] = React.useState<any>(false)
    const [validate, setValidate] = React.useState<Record<string, any>>({});
    const [validateRefetch, setValidateRefetch] = React.useState<{ value: boolean; init: number }>({
      value:false,
      init:0
    })
    const [accessProfile, setAccessProfile] = React.useState<any>([])
    const [property, setProperty] = React.useState<any>({})
    const [memoryVariables, setMemoryVariables] = React.useState<any>({})
    const [lockedData, setLockedData] = React.useState<any>({})
    const [tableData, setTableData] = React.useState<any>({})      
    const [paginationDetails, setpaginationDetails] = React.useState<any>({})

    const [eventEmitterData,setEventEmitterData] = React.useState<any>([])
    const [userDetails , setUserDetails] = React.useState<any>({})
    const [encAppFalg , setEncAppFalg] = React.useState<any>({})
    const theme = getCookie('cfg_theme')


  const emptifyStateValues=()=>{ // for refresh disable key values exapmle app RTGS
    setValidateRefetch({
      value:false,
      init:0
    })
    setValidate({})
    setcomboboxb853a(
                          {
                            isDisabled: null,
                            presetValues: '',
                            isHidden: false,
                            refetch:false,
                            refresh:false,
                            trigger: false
                          }) 
    setbutton7807e(
                          {
                            isDisabled: null,
                            presetValues: '',
                            isHidden: false,
                            refetch:false,
                            refresh:false,
                            trigger: false
                          }) 
    setpiechart0bf98(
                          {
                            isDisabled: null,
                            presetValues: '',
                            isHidden: false,
                            refetch:false,
                            refresh:false,
                            trigger: false
                          }) 
    setbarchartf25ad(
                          {
                            isDisabled: null,
                            presetValues: '',
                            isHidden: false,
                            refetch:false,
                            refresh:false,
                            trigger: false
                          }) 
    setcountry0215e(
                          {
                            isDisabled: null,
                            presetValues: '',
                            isHidden: false,
                            refetch:false,
                            refresh:false,
                            trigger: false
                          }) 

        setgroup951d8({}) 
    setgroup951d8Props({
      validation:false,
      required:false,
      refetch:false,
      refresh:false,
      isDisabled: false,
      presetValues: '',
      isHidden: false,
      selectedIds:[],
      controls:[
            "combobox",
            "combobox",
            "button",
            "name",
            "name",
      ]
      }) 
    
    settabled733f([]) 
    settabled733fProps({
      validation:false,
      required:false,
      refetch:false,
      isDisabled: false,
      presetValues: '',
      isHidden: false,
      selectedIds:[],
      primaryColunm: '',
      refresh:false,
      filterInitalLoad: false,
      }) 
  }
  useEffect(() => {
    if (pathname?.includes('select-context')) {
      emptifyStateValues()
    }
  }, [pathname])
    
  return (
    <TotalContext.Provider 
      value={
      {
      //
        currentToken,
        setCurrentToken,
        matchedAccessProfileData,
        setMatchedAccessProfileData,
        group951d8, 
        setgroup951d8,
        group951d8Props, 
        setgroup951d8Props,
        tabled733f, 
        settabled733f,
        tabled733fProps, 
        settabled733fProps,
        comboboxb853a,
        setcomboboxb853a, 
        comboboxb853aProps,
        setcomboboxb853aProps,
        button7807e,
        setbutton7807e, 
        button7807eProps,
        setbutton7807eProps,
        piechart0bf98,
        setpiechart0bf98, 
        piechart0bf98Props,
        setpiechart0bf98Props,
        barchartf25ad,
        setbarchartf25ad, 
        barchartf25adProps,
        setbarchartf25adProps,
        country0215e,
        setcountry0215e, 
        country0215eProps,
        setcountry0215eProps,
        ////// screen states 
          barchart_v1,
          setbarchart_v1,
          barchart_v1Props,
          setbarchart_v1Props,
        //////////

        ///////// dfd
        dfd_chart_v1Props,
        setdfd_chart_v1Props,
        dfd_country_code_dfd_v1Props,
        setdfd_country_code_dfd_v1Props,
        refetch,
        setRefetch,
        searchParam,
        setSearchParam,
        disableParam,
        setDisableParam,
        globalState,
        setGlobalState,
        validate,
        setValidate,
        validateRefetch,
        setValidateRefetch,
        accessProfile,
        setAccessProfile,
        property,
        setProperty,
        setRefresh,
        refresh,
        memoryVariables,
        setMemoryVariables,
        lockedData,
        setLockedData,
        tableData,
        setTableData,
        paginationDetails,
        setpaginationDetails,
        eventEmitterData,
        setEventEmitterData,
        userDetails,
        setUserDetails,
        encAppFalg,
        setEncAppFalg
        }}
      >
      {children}
    </TotalContext.Provider>
  )
}

export default GlobalContext