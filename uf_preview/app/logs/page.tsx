

'use client'
import React, { useState, useEffect, useMemo, useDeferredValue, useContext } from 'react'
import { AxiosService } from '@/app/components/axiosService'
import TableHeader from './components/LogTable'
import decodeToken from '@/app/components/decodeToken'
import Artifactdetails from './components/ArtifactDetails'
import { TotalContext, TotalContextProps } from '../globalContext'
import { useRouter } from 'next/navigation'
import { useGlobal } from '@/context/GlobalContext'

const ParentComponent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'process' | 'torus'>('process')
  const [nodeData, setNodeData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [app, setApp] = useState({
    code: 'TGW004',
    name: 'TGW4'
  })
  const [appGroup, setappGroup] = useState({
    code: 'TGW01',
    name: 'TGW'
  })
  const { token } = useGlobal();
  const decodedToken: any = decodeToken(token)
  const [user, setUser] = useState<string[]>([decodedToken?.loginId])
  const { encAppFalg,setEncAppFalg}= useContext(TotalContext) as TotalContextProps
   const today = new Date();
  // 7 days back
  const past = new Date();
  past.setDate(today.getDate() - 7);
  const formatTwoDigit = (value: number) => 
  String(value).padStart(2, "0");
  const [range, setRange] = useState<any>({
    start: {
      year: past.getFullYear(),
      month: formatTwoDigit(past.getMonth()+1),
      day: formatTwoDigit(past.getDate())
    },
    end: {
      year: today.getFullYear(),
      month: formatTwoDigit(today.getMonth()+1),
      day: formatTwoDigit(today.getDate())
    }
  });
  const [ fabrics , setFabrics ] = useState<Array<string>>([])
  const [jsonViewerData, setJsonViewerData] = useState({})
  const router = useRouter()
  let landingScreen:string = 'User Screen';
  const encryptionFlagApp: boolean = false;    
  const [jsonData, setJsonData] = useState({
    data: [],
    page: 1,
    limit: 10,
    totalDocuments: 0,
    totalPages: 0
  })
  const search = useDeferredValue(searchTerm)
  const suffixes: any = {
    DF: ['DFD'],
    UF: ['UFM', 'UFW'],
    PF: ['PFD', 'CAFD', 'PAFD'],
    API: ['MSD', 'ERD', 'APIPD', 'APICD'],
    AIF: ['AIFD'],
    CDF: ['DPD', 'IFD']
  };
  const [localSortOrder, setLocalSortOrder] = useState<string>('Newest')
  const getDate = (date: any) =>{
    if(!date) return ""
    const { year, month, day } = date
    return `${year}-${month}-${day}`
  }
  let payload:any = useMemo(() => {
    return {
      tenant: 'CT001',
       fabric: fabrics.length > 0 ? fabrics.flatMap((prefix: any) =>
            suffixes[prefix]
              ? suffixes[prefix].map((suffix: any) => `${prefix}-${suffix}`)
              : []
          ) : [],
      appgroup: appGroup,
      app: app,
      user: user,
      FromDate: range && range?.start ? getDate(range.start) : '',
      ToDate: range && range?.end ? getDate(range.end) : '',
      page: jsonData.page,
      limit: jsonData.limit,
      sortOrder: localSortOrder.toLowerCase(),
      searchParam: search
    }
  }, [activeTab, jsonData, search , range , fabrics, user, localSortOrder])

  const fetchData = async (signal: AbortSignal) => {
    try {
      if (encAppFalg.flag) {
        payload['dpdKey'] = encAppFalg.dpd;
        payload['method'] = 'vault';
      }

      setLoading(true)
      const response = await AxiosService.post(
        `/${activeTab === 'torus' ? 'expLog' : 'prcLog'}`,
        payload,
        {
          headers : {
            Authorization : `Bearer ${token}`
          },
          signal: signal
        }
      )

      const result = response.data
      if (activeTab === 'torus') {
        if (result && typeof result === 'object' && 'data' in result) {
          const systemLogResult :any  = [];
          
      for (const item of response.data.data) {
        const { AFK, CATK, AFGK, AFVK, FNK , AFSK } = item;

          const { sessionInfo, errorDetails, DateAndTime } = AFSK;

          systemLogResult.push({
            artifact: AFK,
            grpDetails: `${CATK} > ${AFGK}`,
            version: AFVK,
            fabric: FNK,
            user: sessionInfo.user,
            accessProfile: sessionInfo.accessProfile,
            profile: sessionInfo.profile,
            timeStamp: DateAndTime,
            errorCode: errorDetails.T_ErrorCode,
            errorDescription: typeof errorDetails.errorDetail === "string" ? errorDetails.errorDetail : "Get More Info",
            errorDetails,
          });
      }
      if(systemLogResult.length && systemLogResult[0].errorDetails){
        setJsonViewerData(systemLogResult[0].errorDetails)
      }else{
        setJsonViewerData({})
      }
          setJsonData(prevData => ({
            ...prevData,
            data: systemLogResult,
            page: result.page,
            limit: result.limit,
            totalDocuments: result.totalDocuments,
            totalPages: result.totalPages
          }))
        } else {
          setJsonData(prevData => ({
            ...prevData,
            data: [],
            page: 1,
            limit: 10,
            totalDocuments: 0,
            totalPages: 0
          }))
        }
      } else {
        if (result && typeof result === 'object' && 'data' in result) {
          const res = result?.data?.map((item: any) => {
            const processId = Object.keys(item['AFSK'])[0]
            const artifactKey = `CK:${item['CK']}:FNGK:AF:FNK:${item['FNK']}:CATK:${item['CATK']}:AFGK:${item['AFGK']}:AFK:${item['AFK']}:AFVK:${item['AFVK']}`
            const nodes = item['AFSK'][processId]
            const artifact = item['AFK']
            const grpDetails = `${item['CATK']} > ${item['AFGK']}`
            const fabric = item['FNK'].includes('PF')
              ? 'PROCESS'
              : item['FNK'].includes('DF')
                ? 'DATA'
                : 'UI'
            let overallStatus = 'Success'

            // Map nodes and check status in a single pass
            const nodeDetails = nodes.map((nodeObj: any) => {
              const { processInfo, DateAndTime, errorDetails } = nodeObj
              const nodeStatus = processInfo.status

              // Update the overall status if any node fails
              if (nodeStatus === 'Failed') overallStatus = 'Failed'

              return {
                nodeData: {
                  name: processInfo.nodeName,
                  request: processInfo.request,
                  queue: processInfo?.queue,
                  response: processInfo.response,
                  subFlowInfo : processInfo.subFlowInfo ? processInfo.subFlowInfo : undefined,
                  time: DateAndTime,
                  status: nodeStatus,
                  exception: errorDetails
                },
                status: nodeStatus,
                time: DateAndTime,
                processId
              }
            })

            return {
              artifactName: {
                artifact,
                grpDetails,
                processId,
                artifactKey
              },
              fabric,
              version: item['AFVK'],
              status: overallStatus,
              user : item['USER'],
              node: nodeDetails.map((node: any) => node.nodeData),
              time: nodeDetails.map((node: any) => node.time),
              processId,
              artifact,
              grpDetails
            }
          })

          setJsonData(prevData => ({
            ...prevData,
            data: res,
            page: result.page,
            limit: result.limit,
            totalDocuments: result.totalDocuments,
            totalPages: result.totalPages
          }))
        } else {
          setJsonData(prevData => ({
            ...prevData,
            data: [],
            page: 1,
            limit: 10,
            totalDocuments: 0,
            totalPages: 0
          }))
        }
      }
      setLoading(false)
    } catch (error: any) {
        setLoading(false)
        setJsonViewerData({})
        setJsonData(prevData => ({
          ...prevData,
          data: [],
          page: 1,
          limit: 10,
          totalDocuments: 0,
          totalPages: 0
        }))
    }
  }
  
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    fetchData(signal)

    //cleanup function
    return () => {
      controller.abort()
    }
  }, [jsonData.page, jsonData.limit, search, activeTab , range, fabrics , user])

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setJsonData(prev => ({
      ...prev,
      page: newPage,
      limit: newPageSize
    }))
  }
 
  const logout = () => {
    localStorage.clear();
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const from = encodeURIComponent(`${basePath}/`);
    window.location.href = `${basePath}/next-api/auth/logout?from=${from}`;
  };

   const securityCheck = async () => {
     try {
     const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
     const res = await fetch(`${basePath}/next-api/auth/introspect?key=Logs Screen`)
     if (!res.ok) {
       logout()
       return
     }
     router.refresh()
 
     if (!decodedToken.selectedAccessProfile) {
       router.push('/select-context')
     }
       
     } catch (err: any) {
       logout()
     }
   }
 
   useEffect(() => {
     if (token) {
       securityCheck()
     }
   }, [])

  return (
    <>
      {nodeData ? (
        <Artifactdetails nodeData={nodeData} setNodeData={setNodeData} />
      ) : (
        <TableHeader
          loading={loading}
          jsonData={jsonData}
          setJsonData={setJsonData}
          onPageChange={handlePageChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setNodeData={setNodeData}
          range={range}
          setRange={setRange}
          fabrics={fabrics}
          setFabrics={setFabrics}
          user={user}
          setUser={setUser}
          jsonViewerData={jsonViewerData}
          setJsonViewerData={setJsonViewerData}
          localSortOrder={localSortOrder}
          setLocalSortOrder={setLocalSortOrder}
        />
      )}
    </>
  )
}

export default ParentComponent
