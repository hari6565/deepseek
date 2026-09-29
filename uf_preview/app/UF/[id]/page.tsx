'use client'
import React, { useEffect, useState } from 'react'
import NodeData from './previewscrn'
import axios from 'axios'

/**
 * Polls /next-api/preview for code most recently pushed there by the
 * deepseek-harness uf_preview plugin (which calls tgw-codeGeneration
 * server-side, so the auth token never reaches the browser). Replaces the
 * previous direct client-side call to tgw-codeGeneration -- that call
 * referenced an undefined `nodedata` and shipped a live bearer token in the
 * client bundle.
 */
const page = ({ params }: { params: Promise<{ id: string }> }) => {
  const [code, setCode] = useState('')

  async function getPreviewData() {
    const { id } = await params
    const res1 = await axios.get(`/next-api/preview/${id}`)
    setCode(res1?.data?.code||"")
  }

  useEffect(() => {
    getPreviewData()
  }, [])

  return (
    <div className='flex h-screen w-screen gap-5 overflow-hidden bg-slate-100 p-5'>
      <div className='flex h-full w-[100%] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='min-h-0 flex-1 overflow-auto p-5'>
          <NodeData previewCode={code} />
        </div>
      </div>
    </div>
  )
}

export default page

let fff = `function PagePreviewEmpV1({ onReady }: { onReady?: () => void } = {}) {
  const { isDark, isHighContrast, bgStyle, textStyle } : { isDark: boolean; isHighContrast: boolean; bgStyle: string; textStyle: string } = useTheme();
  const screenName:string = "";
  const [ encAppFalg,setEncAppFalg]= React.useState<boolean>(false);
  const [refetch, setRefetch] = React.useState<boolean>(false);
  const [memoryVariables, setMemoryVariables] = React.useState<Record<string, string>>({});
  const [lockedData, setLockedData] = React.useState<Record<string, any>>({});
  const [tableData, setTableData] = React.useState<Record<string, any>>([]);
  const [accessProfile, setAccessProfile] = React.useState<any>([]);
  const [ eventEmitterData,setEventEmitterData]= React.useState<any[] | null>(null);
  const [emp_v1Props, setemp_v1Props] = React.useState<any>(null);
  const [initialLoad, setInitialLoad] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const securityData : SecurityData = {};
  const code : string = "";
  const routes : AppRouterInstance = useRouter();
  const toast : Function = useInfoMsg();
  const [primaryTableData, setPrimaryTableData] = useState<PrimaryTableData>({primaryKey:"",value:"",compName:""});
  const [checkToAdd, setCheckToAdd] = useState<Record<string, any>>({});
  const encryptionFlagPage: boolean = false|| encAppFalg.flag;
  let encryptionDpd: string = "";
  encryptionDpd = encryptionDpd !=='' ? encryptionDpd: encAppFalg.dpd;
  let encryptionMethod: string = "";
  encryptionMethod  = encryptionMethod !=='' ? encryptionMethod: encAppFalg.method;
  let encryptionFlagPageData : EncryptionFlagPageData ={
    "flag":encryptionFlagPage,
    "dpd":encryptionDpd,
    "method":encryptionMethod
  }
  const [checkshipmentgroup,setCheckshipmentgroup,]=useState<boolean>(false);
  const [shipmentgroupac707, setshipmentgroupac707] = React.useState<any>({});
  const [paginationDetails, setpaginationDetails] = useState<Record<string, any>>({});
  const [paginationData,setPaginationData]=useState<PaginationData>({count:10,page:1})
    const prevRefreshRef = useRef<any>({
    });

  const logout = () => {
    localStorage.clear();
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  };

  async function securityCheck(): Promise<void> {
  }
  const handleClick = (): void => {
    routes.push("/");
  }

  const handleOnload = (): void => {
  }
  const parentRef:any = useRef(null);
  return (
    <>
     <div className={clsx("",
        "w-full",
        isDark ? 'text-white' : 'text-black',
        isProcessing && "pointer-events-none select-none"
      )}
      ref={parentRef}
     style={{
        gridColumn: '',
        gridRow: '',
        gridAutoRows: '4px',
        columnGap: '0px',
        rowGap: '0px',
        display: "grid",
        gridTemplateColumns: 'repeat(24, 1fr)',
        gridTemplateRows: '',
        height: '',
        overflow: '',
        backgroundColor:bgStyle,
        backgroundImage:'',
        backgroundPosition: '',
        backgroundSize: '',
        backgroundRepeat: '',
        backgroundAttachment: '',
        backgroundClip: '',
        backgroundBlendMode: '',
        color: textStyle,
        //minHeight: '100vh',
        ...(isHighContrast && {
          fontWeight: '500',
          borderWidth: '2px'
      })
      }}>
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-xl bg-neutral-900/80 px-6 py-4 text-sm text-white shadow-lg backdrop-blur">
            {/* Spinner */}
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

            {/* Text */}
            <span className="font-medium tracking-wide">
              Processing, please wait…
            </span>
          </div>
        </div>
      )}
      {<Groupshipmentgroup 
          lockedData={lockedData} 
          setLockedData={setLockedData} 
          primaryTableData={primaryTableData}
          tableData={tableData}
          setTableData={setTableData}
          setPrimaryTableData={setPrimaryTableData}
          checkToAdd={checkToAdd} 
          setCheckToAdd={setCheckToAdd}  
          refetch={refetch}
          setRefetch={setRefetch}
          encryptionFlagPageData={encryptionFlagPageData}
          paginationDetails={paginationDetails}
          setIsProcessing={setIsProcessing}        />}
      </div> 
    </>
  )
     








function Groupshipmentgroup({lockedData={},setLockedData,tableData=[],setTableData,primaryTableData={}, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,paginationDetails,encryptionFlagPageData, nodeData, setNodeData,isFormOpen=false}:any){
  const [refresh, setRefresh] = React.useState<any>(false);
  const [memoryVariables, setMemoryVariables] = React.useState<any>({});
  const [globalState, setGlobalState] = React.useState<any>({});
  const [accessProfile, setAccessProfile] = React.useState<any>({});
  const code:any = "";
  let idx = "";
  let item = "";
  const { isDark, isHighContrast, bgStyle, textStyle } = useTheme();
  const encryptionFlagComp: boolean = encryptionFlagPageData?.flag || false;
  let encryptionDpd: string = "";
  encryptionDpd = encryptionDpd !=='' ? encryptionDpd: encryptionFlagPageData?.dpd;
  let encryptionMethod: string = "";
  encryptionMethod  = encryptionMethod !=='' ? encryptionMethod: encryptionFlagPageData?.method;
  let encryptionFlagCompData :any ={
    "flag":encryptionFlagComp,
    "dpd":encryptionDpd,
    "method":encryptionMethod
  };
  const [showFlag, setShowFlag] = React.useState<string>("");
  const securityData:any={};
  const ruleData:any={};
  const prevRefreshRef = useRef(false);
  const handleOnloadCalledRef = useRef(false);
  const securityCheckPromiseRef = useRef<Promise<any> | null>(null);
  const [allowedComponent,setAllowedComponent]=useState<any>("");
  const toast=useInfoMsg();
  const confirmMsgFlag: boolean = false;
  const [allCode,setAllCode]=useState<any>("");
  const routes = useRouter();
  const [showProfileAsModalOpen, setShowProfileAsModalOpen] = React.useState(false);
  const [showElementAsPopupOpen, setShowElementAsPopupOpen] = React.useState(false);
  const [ButtonGoRuleData,setButtonGoRuleData]=useState<any>({});
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
 /////////////
   //another screen
  const [shipmentgroupac707, setshipmentgroupac707]= React.useState<any>({});   
  const [shipmentgroupac707Props, setshipmentgroupac707Props]= React.useState<any>({});   
  const [trackingnumberlabel262ed, settrackingnumberlabel262ed]= React.useState<any>({});   
  const [trackingnumberfa5d8, settrackingnumberfa5d8]= React.useState<any>({});   
  const [submit0fb95, setsubmit0fb95]= React.useState<any>({});   
  //////////////
  const [open, setOpen] = React.useState(false);
    const {emp_v1, setemp_v1} = React.useState<any>({});   
  async function securityCheck() {

  }

  async function subscreenCheck() {
  }


    const handleOnload=()=>{
  }
  const handleOnChange=()=>{

  }
  const handleOnClick= async (selectedItem:any, selectedIndex?: number)=>{

  }
  const shipmentgroupac707Ref = useRef<any>(null);
  const handleClearSearch = () => {
    shipmentgroupac707Ref.current?.setSearchParams();
    shipmentgroupac707Ref.current?.handleSearch({});
  };


  const renderBUttons=()=>{
    return (
      <></>
    )
  }
  return (
    <div 
      style={{          
        gridColumn: '1 / 25',
        gridRow: '2 / 59',
        display: 'grid',
        gridTemplateColumns: 'repeat(24, 1fr)',
        gridTemplateRows: 'repeat(auto-fill, minmax(4px, 1fr))',
        height: '100%',
        overflow: 'auto',
        gridAutoRows: '4px',
        columnGap: '0px',
        backgroundColor:'',
        backgroundImage:"url('')",
        backgroundPosition: '',
        backgroundSize: '',
        backgroundRepeat: '',
        backgroundAttachment: '',
        backgroundClip: '',
        backgroundBlendMode: ''
      }}
      className={'flex flex-col overflow-auto rounded-md '}
       onClick={(e:any)=>{e.stopPropagation()
        handleOnClick({}, 0);
          setemp_v1((pre:any)=>({...pre,_selectedGroup_:"shipmentgroup"}))
        }}
    >
        {<Labeltrackingnumberlabel   /* 262ed */ lockedData={lockedData} setLockedData={setLockedData}  checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<TextInputtrackingnumber   /* fa5d8 */ lockedData={lockedData} setLockedData={setLockedData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {            <Buttonsubmit tableData={tableData} setTableData={setTableData} lockedData={lockedData} setLockedData={setLockedData} primaryTableData={primaryTableData} setPrimaryTableData={setPrimaryTableData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData}  setIsProcessing={setIsProcessing}/>}            
    </div>
 )
}

 




function Labeltrackingnumberlabel({lockedData,setLockedData,encryptionFlagCompData,setIsProcessing}:any){
  const [globalState, setGlobalState] = React.useState<any>({});
  const [refresh, setRefresh] = React.useState<boolean>(false);
  const [accessProfile, setAccessProfile] = React.useState<any[]>([]);
  const [memoryVariables, setMemoryVariables] = React.useState<any>({});
  const encryptionFlagCont: boolean = encryptionFlagCompData.flag || false ;
  let encryptionDpd: string = "";
  encryptionDpd = encryptionDpd !=='' ? encryptionDpd: encryptionFlagCompData.dpd;
  let encryptionMethod: string = "";
  encryptionMethod  = encryptionMethod !=='' ? encryptionMethod: encryptionFlagCompData.method;
  const [allCode,setAllCode]=useState<string>("");
  const toast:Function=useInfoMsg();
  const routes: AppRouterInstance = useRouter();
 /////////////
   //another screen
  const [shipmentgroupac707, setshipmentgroupac707]= React.useState<any>({});
  const [shipmentgroupac707Props, setshipmentgroupac707Props]= React.useState<any>({});
  const [trackingnumberlabel262ed, settrackingnumberlabel262ed]= React.useState<any>({});
  const [trackingnumberfa5d8, settrackingnumberfa5d8]= React.useState<any>({});
  const [submit0fb95, setsubmit0fb95]= React.useState<any>({});
  //////////////


const handleClick =async(e:any)=>{
}


  if (trackingnumberlabel262ed?.isHidden) {
    return <></>
  }  

  return (
    <div 
      style={{gridColumn: '9 / 11',gridRow: '4 / 14', gap:'', height: '100%', overflow: 'hidden'}} >
      <Label 
        className=""
        disabled= {trackingnumberlabel262ed?.isDisabled ? true : false}
        theme="normal"
        interactive={false}
      onClick = {handleClick}
      >
      Tracking Number
      </Label>
    </div>
  )
}

 



///////////////
////////////

function TextInputtrackingnumber({lockedData,setLockedData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData,setIsProcessing}:any){
  const [globalState, setGlobalState] = useState<any>({});
  const [validateRefetch, setValidateRefetch] = useState<boolean>(false);
  const [validate, setValidate] = useState<Record<string, any>>({});
  const [accessProfile, setAccessProfile] = useState<any[]>([]);
  const [memoryVariables, setMemoryVariables] = useState<any>({});
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isRequredData,setIsRequredData]=useState<boolean>(false)
  const toast : Function = useInfoMsg()
  const keyset : Function = i18n.keyset("language");
  const [allCode,setAllCode]=useState<string>("");
  let schemaArray :string[] =[];
  const [dynamicStateandType,setDynamicStateandType]=useState<Record<string, any>>({name:'trackingnumber',type:"text"})
  const routes: AppRouterInstance = useRouter()
  const [showProfileAsModalOpen, setShowProfileAsModalOpen] = React.useState<boolean>(false);
  const [showElementAsPopupOpen, setShowElementAsPopupOpen] = React.useState<boolean>(false);
  const encryptionFlagCont: boolean = encryptionFlagCompData?.flag || false;
  let encryptionDpd: string = "";
  encryptionDpd = encryptionDpd !=='' ? encryptionDpd: encryptionFlagCompData?.dpd;
  let encryptionMethod: string = "";
  encryptionMethod  = encryptionMethod !=='' ? encryptionMethod: encryptionFlagCompData?.method;
  /////////////
   //another screen
  const [shipmentgroupac707, setshipmentgroupac707]= useState<any>(null);
  const [shipmentgroupac707Props, setshipmentgroupac707Props]= useState<any>(null);
  const [trackingnumberlabel262ed, settrackingnumberlabel262ed]= useState<any>(null);
  const [trackingnumberfa5d8, settrackingnumberfa5d8]= useState<any>(null);
  const [submit0fb95, setsubmit0fb95]= useState<any>(null);
  

  // Validation  
    const [error, setError] = useState<string>('');
    function SourceIdFilter(eventProperty:any,matchingSequence?:string){
    let ans : any[] = [];
    let id : string = "";
    if(eventProperty.name=='saveHandler' && eventProperty.sequence == matchingSequence)
    {
      return [eventProperty.id]
    }
    if(eventProperty.name=='eventEmitter' && eventProperty.sequence == matchingSequence)
    {
      return [eventProperty.id]
    }
    for(let i=0;i<eventProperty?.children?.length;i++)
    {
      let temp:any=SourceIdFilter(eventProperty?.children[i],matchingSequence)
      if(temp.length)
      {
        ans.push(eventProperty?.children[i].id)
        id=id+"|"+eventProperty?.children[i].id
        ans.push(...temp)
      }
    }
    return ans
  }
  const handleChange = async(e: any) => {
  }
  const handleValidate=async (e?:any) => {
  }

  const handleBlur=async (e?:any) => {
  }
  const handleMapperValue=async()=>{
  }
  const shipmentgroupac707Ref = useRef<any>(shipmentgroupac707);
  useEffect(() => { shipmentgroupac707Ref.current = shipmentgroupac707; }, [shipmentgroupac707]);
  if (trackingnumberfa5d8?.isHidden) {
    return <></>
  }
  return (   
    <div  
      style={{gridColumn: '9 / 16',gridRow: '18 / 28', gap:'', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column'}} >
        {isRequredData && <span style={{ color: 'red' }}>*</span>}
      <div style={{ flex: 1, minHeight: 0 }}>
      <TextInput
        require={isRequredData}
        className=""
        label={keyset("trackingnumber")}
        onChange= {handleChange}
        onBlur={handleBlur}
        itsHaveCurrency={false}
        type={dynamicStateandType.type}
        value={shipmentgroupac707?.trackingnumber||""}
         disabled= {trackingnumberfa5d8?.isDisabled ? true : false}
        pin='brick-brick'     
        placeholder='type here....'      
        view='normal'
        contentAlign={"left"}
      errorMessage={error}
        validationState={validate?.emp_v1?.trackingnumber ? "invalid" : undefined}
      />
      </div>
    </div> 
  )
}

 




    

function objectToQueryString(obj: any) {
}
 

function Buttonsubmit({ lockedData,setLockedData,primaryTableData, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData}: { lockedData:any,setLockedData:any,checkToAdd:any,setCheckToAdd:any,refetch:any,setRefetch:any,primaryTableData:any,setPrimaryTableData:any,encryptionFlagCompData:any,}){
  const [globalState, setGlobalState] = React.useState<any>({});
  const [validateRefetch, setValidateRefetch] = React.useState<boolean>(false);
  const [accessProfile, setAccessProfile] = React.useState<any[]>([]);
  const [refresh, setRefresh] = React.useState<boolean>(false);
  const [currentToken, setCurrentToken ] = React.useState<any>({});
  const [memoryVariables, setMemoryVariables] = React.useState<any>({});
  const [eventEmitterData, setEventEmitterData] = React.useState<any>(null);
  let code:string = "";
  let rule:string = "";
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [paginationData, setPaginationData] = React.useState({
    page: 0,
    pageSize: 0,
    total: 0,
  })
  const validationResolverRef = useRef<((value: any) => void) | null>(null);
  const savedData=useRef<Record<string, any>>({})
  const validateRef = useRef<any>(null);
  const keyset:any=i18n.keyset("language");
  const confirmMsgFlag: boolean = false; 
  const toast : Function = useInfoMsg();
  let dfKey: string | any;
  const [showFlag, setShowFlag] = React.useState<boolean>(true);
  const lockMode:any = lockedData?.lockMode;
  const [loading, setLoading] = useState<boolean>(false);
  const routes : AppRouterInstance = useRouter();
  const encryptionFlagCont: boolean = encryptionFlagCompData.flag || false;
  let encryptionDpd: string = "";
  encryptionDpd = encryptionDpd !=='' ? encryptionDpd: encryptionFlagCompData.dpd;
  let encryptionMethod: string = "";
  encryptionMethod  = encryptionMethod !=='' ? encryptionMethod: encryptionFlagCompData.method;
  let actionLockData :any = {"lockMode":"","name":"","ttl":""}
  const [gridPosition, setGridPosition] = useState<any>({ gridColumn: '1 / 3', gridRow: '1 / 12' });
  const [hiddenModalForTrigger, setHiddenModalForTrigger] = React.useState<boolean>(false);  
  //showComponentAsPopup || showArtifactAsModal
  const [assetDataReady, setAssetDataReady] = React.useState<boolean>(false); 
 /////////////
   //another screen

  const [shipmentgroupac707, setshipmentgroupac707] = React.useState<any>({});
  const [shipmentgroupac707Props, setshipmentgroupac707Props] = React.useState<any>({});
  const [trackingnumberlabel262ed, settrackingnumberlabel262ed] = React.useState<any>({});
  const [trackingnumberfa5d8, settrackingnumberfa5d8] = React.useState<any>({});
  const [submit0fb95, setsubmit0fb95] = React.useState<any>({});
  //////////////
  const pendingAutoSearch = useRef(false);
  const preloadDone = useRef(false);
  // keep update group state in ref to access latest state value
  const shipmentgroupac707Ref = useRef(shipmentgroupac707);
  useEffect(() => {
    shipmentgroupac707Ref.current = shipmentgroupac707;
    if (!pendingAutoSearch.current) return;
      pendingAutoSearch.current = false;
      handleClick(false);
  }, [shipmentgroupac707]);
  
  //group props in ref to access latest props value
  const shipmentgroupac707PropsRef = useRef(shipmentgroupac707Props);
  useEffect(() => {
    shipmentgroupac707PropsRef.current = shipmentgroupac707Props;
  }, [shipmentgroupac707Props]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let customCode:any;
  const handleCustomCode=async () => {
    if (code != '') {
      let codeStates: any = {};
        codeStates['shipmentgroup'] = shipmentgroupac707,
        codeStates['setshipmentgroup'] = setshipmentgroupac707,
        codeStates['shipmentgroupac707'] = shipmentgroupac707Props,
        codeStates['setshipmentgroupac707'] = setshipmentgroupac707Props,
        codeStates['trackingnumberlabel'] = trackingnumberlabel262ed,
        codeStates['settrackingnumberlabel'] = settrackingnumberlabel262ed,
        codeStates['trackingnumber'] = trackingnumberfa5d8,
        codeStates['settrackingnumber'] = settrackingnumberfa5d8,
        codeStates['submit'] = submit0fb95,
        codeStates['setsubmit'] = setsubmit0fb95,
      codeStates['response']  = savedData.current;
      customCode = codeExecution(code,codeStates);
      return customCode;
    }
  }
  const {emp_v1, setemp_v1} = React.useState<any>({});
  const handleMapper=async (data?:any) => {
    try{     
      data = {...shipmentgroupac707Ref.current,...data};
      let parentRowSpan = 57;
    }catch(err){
      console.log(err)
    }
  }


  function SourceIdFilter(eventProperty:any,matchingSequence?:string){
    let ans : any[] = [];
    let id : string = "";
    if(eventProperty.name=='saveHandler' && eventProperty.sequence == matchingSequence)
    {
      return [eventProperty.id];
    }
    if(eventProperty.name=='eventEmitter' && eventProperty.sequence == matchingSequence)
    {
      return [eventProperty.id];
    }
    for(let i=0;i<eventProperty?.children?.length;i++)
    {
      let temp:any=SourceIdFilter(eventProperty?.children[i],matchingSequence)
      if(temp.length)
      {
        ans.push(eventProperty?.children[i].id);
        id=id+"|"+eventProperty?.children[i].id;
        ans.push(...temp);
      }
    }
    return ans;
  }

  const handleClick=async(showModal: boolean = true)=>{
  }
  const handleAssetPageReady = () => {
    setAssetDataReady(true);
    setIsProcessing(false);
  }


 if (submit0fb95?.isHidden) {
    return <></>
  }

  return (
    <div
      style={{gridColumn: '9 / 11',gridRow: '40 / 56', gap:'', height: '100%', overflow: 'auto'}} 
 >
        {showFlag && <Button 
          ref={buttonRef}
          className=""
          onClick={handleClick}
          view='action'
          disabled= {submit0fb95?.isDisabled ? true : false}
          pin='circle-circle'
          contentAlign={"center"}
        >
          {keyset("submit")}
        </Button>}
      </div>
    
  )
}




 }`
