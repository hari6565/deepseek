// In-memory hand-off point for a locally-generated preview: the
// deepseek-harness uf_preview plugin POSTs generated code here after calling
// tgw-codeGeneration, and app/UF/page.tsx polls GET to pick it up. Single
// dev-server process only -- not durable, not for multi-instance deployment.
import { NextRequest, NextResponse } from 'next/server'

let latestCode:any = {}

export async function GET(request: Request) {
  // Get the id from the headers
  const id = request.headers.get('id'); // Change to 'x-id' if you are using a custom header prefix

  if (!id) {
    return NextResponse.json({ error: 'ID header is missing' }, { status: 400 });
  }

  return NextResponse.json({
    code: gg[id],
  });
}
export async function POST(req: NextRequest) {
  const body: unknown = await req.json().catch(() => null)
  const code = (body as { code?: unknown } | null)?.code
  if (typeof code !== 'string' || code.length === 0) {
    return NextResponse.json({ error: 'body.code must be a non-empty string' }, { status: 400 })
  }
  latestCode = code
  return NextResponse.json({ ok: true })
}


let gg:any={
  "aaaaa":` 
function PagePreviewEmpV1({ onReady }: { onReady?: () => void } = {}) {
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
  const securityData : SecurityData = {
  "emplyoee": {
    "blockedGroups": []
  },
  "Template": {
    "blockedGroups": []
  },
  "user": {
    "blockedGroups": []
  }
};
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
  const [checkbookinggroup,setCheckbookinggroup,]=useState<boolean>(false);
  const [checkbookingtable,setCheckbookingtable,]=useState<boolean>(false);
  const [bookinggroup685f1, setbookinggroup685f1] = React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9] = React.useState<any>({});
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
      {<Groupbookinggroup 
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
      {<Groupbookingtable 
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
     








function Groupbookinggroup({lockedData={},setLockedData,tableData=[],setTableData,primaryTableData={}, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,paginationDetails,encryptionFlagPageData, nodeData, setNodeData,isFormOpen=false}:any){
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
  const securityData:any={
  "emplyoee": {
    "allowedControls": [
      "headline",
      "guestnamelabel",
      "guestname",
      "roomtypelabel",
      "roomtype",
      "checkindatelabel",
      "checkindate",
      "book",
      "cancel"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  },
  "Template": {
    "allowedControls": [
      "headline",
      "guestnamelabel",
      "guestname",
      "roomtypelabel",
      "roomtype",
      "checkindatelabel",
      "checkindate",
      "book",
      "cancel"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  },
  "user": {
    "allowedControls": [
      "headline",
      "guestnamelabel",
      "guestname",
      "roomtypelabel",
      "roomtype",
      "checkindatelabel",
      "checkindate",
      "book",
      "cancel"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  }
};
  const ruleData:any={};
  const prevRefreshRef = useRef(false);
  const handleOnloadCalledRef = useRef(false);
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});   
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});   
  const [headline20c17, setheadline20c17]= React.useState<any>({});   
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});   
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});   
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});   
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});   
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});   
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});   
  const [book82d32, setbook82d32]= React.useState<any>({});   
  const [cancel1d281, setcancel1d281]= React.useState<any>({});   
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});   
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});   
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
  const bookinggroup685f1Ref = useRef<any>(null);
  const handleClearSearch = () => {
    bookinggroup685f1Ref.current?.setSearchParams();
    bookinggroup685f1Ref.current?.handleSearch({});
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
        gridRow: '2 / 138',
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
          setemp_v1((pre:any)=>({...pre,_selectedGroup_:"bookinggroup"}))
        }}
    >
          {<Textheadline   /* 20c17 */ isDynamic={false } index={idx} item={item} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<Labelguestnamelabel   /* f7e1e */ lockedData={lockedData} setLockedData={setLockedData}  checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<TextInputguestname   /* be64b */ lockedData={lockedData} setLockedData={setLockedData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<Labelroomtypelabel   /* f8eb4 */ lockedData={lockedData} setLockedData={setLockedData}  checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<TextInputroomtype   /* 98e13 */ lockedData={lockedData} setLockedData={setLockedData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<Labelcheckindatelabel   /* dbd13 */ lockedData={lockedData} setLockedData={setLockedData}  checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<TextInputcheckindate   /* 76a0c */ lockedData={lockedData} setLockedData={setLockedData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {            <Buttonbook tableData={tableData} setTableData={setTableData} lockedData={lockedData} setLockedData={setLockedData} primaryTableData={primaryTableData} setPrimaryTableData={setPrimaryTableData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData}  setIsProcessing={setIsProcessing}/>}            
        {            <Buttoncancel tableData={tableData} setTableData={setTableData} lockedData={lockedData} setLockedData={setLockedData} primaryTableData={primaryTableData} setPrimaryTableData={setPrimaryTableData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData}  setIsProcessing={setIsProcessing}/>}            
    </div>
 )
}

 


function Textheadline({encryptionFlagCompData,isDynamic,item,index,setIsProcessing}:any){
  const [accessProfile, setAccessProfile] = React.useState<any[]>([]);
  const keyset:any=i18n.keyset("language");
  const encryptionFlagCont: boolean = encryptionFlagCompData.flag || false ;
  let encryptionDpd: string = "";
  encryptionDpd = encryptionDpd !=='' ? encryptionDpd: encryptionFlagCompData.dpd
  let encryptionMethod: string = "";
  encryptionMethod  = encryptionMethod !=='' ? encryptionMethod: encryptionFlagCompData.method;
  /////////////
   //another screen
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});  
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});  
  const [headline20c17, setheadline20c17]= React.useState<any>({});  
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});  
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});  
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});  
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});  
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});  
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});  
  const [book82d32, setbook82d32]= React.useState<any>({});  
  const [cancel1d281, setcancel1d281]= React.useState<any>({});  
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});  
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});  
  const [headline20c17Props, setheadline20c17Props] = React.useState<Record<string, any>>({});
  //////////////

  const handleMapperValue=async(filterProps?:any,filterFlag?:boolean)=>{
  }


  if (headline20c17?.isHidden) {
    return <></>
  }

return (
  <div className="" style={{gridColumn: '9 / 16',gridRow: '4 / 23', gap:'', height: '100%'}} >
<Text
  contentAlign={"center"}
  className=""
  variant="display-3"
  color="primary"
>
      {keyset("Booking Form")}
</Text>
  </div>
  )
}

 




function Labelguestnamelabel({lockedData,setLockedData,encryptionFlagCompData,setIsProcessing}:any){
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});
  const [headline20c17, setheadline20c17]= React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});
  const [book82d32, setbook82d32]= React.useState<any>({});
  const [cancel1d281, setcancel1d281]= React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});
  //////////////


const handleClick =async(e:any)=>{
}


  if (guestnamelabelf7e1e?.isHidden) {
    return <></>
  }  

  return (
    <div 
      style={{gridColumn: '9 / 11',gridRow: '27 / 37', gap:'', height: '100%', overflow: 'hidden'}} >
      <Label 
        className=""
        disabled= {guestnamelabelf7e1e?.isDisabled ? true : false}
        theme="normal"
        interactive={false}
      onClick = {handleClick}
      >
      Guest Name
      </Label>
    </div>
  )
}

 



///////////////
////////////

function TextInputguestname({lockedData,setLockedData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData,setIsProcessing}:any){
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
  const [dynamicStateandType,setDynamicStateandType]=useState<Record<string, any>>({name:'guestname',type:"text"})
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
  const [bookinggroup685f1, setbookinggroup685f1]= useState<any>(null);
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= useState<any>(null);
  const [headline20c17, setheadline20c17]= useState<any>(null);
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= useState<any>(null);
  const [guestnamebe64b, setguestnamebe64b]= useState<any>(null);
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= useState<any>(null);
  const [roomtype98e13, setroomtype98e13]= useState<any>(null);
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= useState<any>(null);
  const [checkindate76a0c, setcheckindate76a0c]= useState<any>(null);
  const [book82d32, setbook82d32]= useState<any>(null);
  const [cancel1d281, setcancel1d281]= useState<any>(null);
  const [bookingtable4e8e9, setbookingtable4e8e9]= useState<any>(null);
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= useState<any>(null);
  

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
  const bookinggroup685f1Ref = useRef<any>(bookinggroup685f1);
  useEffect(() => { bookinggroup685f1Ref.current = bookinggroup685f1; }, [bookinggroup685f1]);
  if (guestnamebe64b?.isHidden) {
    return <></>
  }
  return (   
    <div  
      style={{gridColumn: '9 / 16',gridRow: '41 / 51', gap:'', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column'}} >
        {isRequredData && <span style={{ color: 'red' }}>*</span>}
      <div style={{ flex: 1, minHeight: 0 }}>
      <TextInput
        require={isRequredData}
        className=""
        label={keyset("guestname")}
        onChange= {handleChange}
        onBlur={handleBlur}
        itsHaveCurrency={false}
        type={dynamicStateandType.type}
        value={bookinggroup685f1?.guestname||""}
         disabled= {guestnamebe64b?.isDisabled ? true : false}
        pin='brick-brick'     
        placeholder='type here....'      
        view='normal'
        contentAlign={"left"}
      errorMessage={error}
        validationState={validate?.emp_v1?.guestname ? "invalid" : undefined}
      />
      </div>
    </div> 
  )
}

 




function Labelroomtypelabel({lockedData,setLockedData,encryptionFlagCompData,setIsProcessing}:any){
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});
  const [headline20c17, setheadline20c17]= React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});
  const [book82d32, setbook82d32]= React.useState<any>({});
  const [cancel1d281, setcancel1d281]= React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});
  //////////////


const handleClick =async(e:any)=>{
}


  if (roomtypelabelf8eb4?.isHidden) {
    return <></>
  }  

  return (
    <div 
      style={{gridColumn: '9 / 11',gridRow: '55 / 65', gap:'', height: '100%', overflow: 'hidden'}} >
      <Label 
        className=""
        disabled= {roomtypelabelf8eb4?.isDisabled ? true : false}
        theme="normal"
        interactive={false}
      onClick = {handleClick}
      >
      Room Type
      </Label>
    </div>
  )
}

 



///////////////
////////////

function TextInputroomtype({lockedData,setLockedData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData,setIsProcessing}:any){
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
  const [dynamicStateandType,setDynamicStateandType]=useState<Record<string, any>>({name:'roomtype',type:"text"})
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
  const [bookinggroup685f1, setbookinggroup685f1]= useState<any>(null);
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= useState<any>(null);
  const [headline20c17, setheadline20c17]= useState<any>(null);
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= useState<any>(null);
  const [guestnamebe64b, setguestnamebe64b]= useState<any>(null);
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= useState<any>(null);
  const [roomtype98e13, setroomtype98e13]= useState<any>(null);
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= useState<any>(null);
  const [checkindate76a0c, setcheckindate76a0c]= useState<any>(null);
  const [book82d32, setbook82d32]= useState<any>(null);
  const [cancel1d281, setcancel1d281]= useState<any>(null);
  const [bookingtable4e8e9, setbookingtable4e8e9]= useState<any>(null);
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= useState<any>(null);
  

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
  const bookinggroup685f1Ref = useRef<any>(bookinggroup685f1);
  useEffect(() => { bookinggroup685f1Ref.current = bookinggroup685f1; }, [bookinggroup685f1]);
  if (roomtype98e13?.isHidden) {
    return <></>
  }
  return (   
    <div  
      style={{gridColumn: '9 / 16',gridRow: '69 / 79', gap:'', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column'}} >
        {isRequredData && <span style={{ color: 'red' }}>*</span>}
      <div style={{ flex: 1, minHeight: 0 }}>
      <TextInput
        require={isRequredData}
        className=""
        label={keyset("roomtype")}
        onChange= {handleChange}
        onBlur={handleBlur}
        itsHaveCurrency={false}
        type={dynamicStateandType.type}
        value={bookinggroup685f1?.roomtype||""}
         disabled= {roomtype98e13?.isDisabled ? true : false}
        pin='brick-brick'     
        placeholder='type here....'      
        view='normal'
        contentAlign={"left"}
      errorMessage={error}
        validationState={validate?.emp_v1?.roomtype ? "invalid" : undefined}
      />
      </div>
    </div> 
  )
}

 




function Labelcheckindatelabel({lockedData,setLockedData,encryptionFlagCompData,setIsProcessing}:any){
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});
  const [headline20c17, setheadline20c17]= React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});
  const [book82d32, setbook82d32]= React.useState<any>({});
  const [cancel1d281, setcancel1d281]= React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});
  //////////////


const handleClick =async(e:any)=>{
}


  if (checkindatelabeldbd13?.isHidden) {
    return <></>
  }  

  return (
    <div 
      style={{gridColumn: '9 / 11',gridRow: '83 / 93', gap:'', height: '100%', overflow: 'hidden'}} >
      <Label 
        className=""
        disabled= {checkindatelabeldbd13?.isDisabled ? true : false}
        theme="normal"
        interactive={false}
      onClick = {handleClick}
      >
      Check In Date
      </Label>
    </div>
  )
}

 



///////////////
////////////

function TextInputcheckindate({lockedData,setLockedData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData,setIsProcessing}:any){
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
  const [dynamicStateandType,setDynamicStateandType]=useState<Record<string, any>>({name:'checkindate',type:"text"})
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
  const [bookinggroup685f1, setbookinggroup685f1]= useState<any>(null);
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= useState<any>(null);
  const [headline20c17, setheadline20c17]= useState<any>(null);
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= useState<any>(null);
  const [guestnamebe64b, setguestnamebe64b]= useState<any>(null);
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= useState<any>(null);
  const [roomtype98e13, setroomtype98e13]= useState<any>(null);
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= useState<any>(null);
  const [checkindate76a0c, setcheckindate76a0c]= useState<any>(null);
  const [book82d32, setbook82d32]= useState<any>(null);
  const [cancel1d281, setcancel1d281]= useState<any>(null);
  const [bookingtable4e8e9, setbookingtable4e8e9]= useState<any>(null);
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= useState<any>(null);
  

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
  const bookinggroup685f1Ref = useRef<any>(bookinggroup685f1);
  useEffect(() => { bookinggroup685f1Ref.current = bookinggroup685f1; }, [bookinggroup685f1]);
  if (checkindate76a0c?.isHidden) {
    return <></>
  }
  return (   
    <div  
      style={{gridColumn: '9 / 16',gridRow: '97 / 107', gap:'', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column'}} >
        {isRequredData && <span style={{ color: 'red' }}>*</span>}
      <div style={{ flex: 1, minHeight: 0 }}>
      <TextInput
        require={isRequredData}
        className=""
        label={keyset("checkindate")}
        onChange= {handleChange}
        onBlur={handleBlur}
        itsHaveCurrency={false}
        type={dynamicStateandType.type}
        value={bookinggroup685f1?.checkindate||""}
         disabled= {checkindate76a0c?.isDisabled ? true : false}
        pin='brick-brick'     
        placeholder='type here....'      
        view='normal'
        contentAlign={"left"}
      errorMessage={error}
        validationState={validate?.emp_v1?.checkindate ? "invalid" : undefined}
      />
      </div>
    </div> 
  )
}

 




    

function objectToQueryString(obj: any) {
}
 

function Buttonbook({ lockedData,setLockedData,primaryTableData, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData}: { lockedData:any,setLockedData:any,checkToAdd:any,setCheckToAdd:any,refetch:any,setRefetch:any,primaryTableData:any,setPrimaryTableData:any,encryptionFlagCompData:any,}){
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

  const [bookinggroup685f1, setbookinggroup685f1] = React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props] = React.useState<any>({});
  const [headline20c17, setheadline20c17] = React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e] = React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b] = React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4] = React.useState<any>({});
  const [roomtype98e13, setroomtype98e13] = React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13] = React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c] = React.useState<any>({});
  const [book82d32, setbook82d32] = React.useState<any>({});
  const [cancel1d281, setcancel1d281] = React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9] = React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props] = React.useState<any>({});
  //////////////
  const pendingAutoSearch = useRef(false);
  const preloadDone = useRef(false);
  // keep update group state in ref to access latest state value
  const bookinggroup685f1Ref = useRef(bookinggroup685f1);
  useEffect(() => {
    bookinggroup685f1Ref.current = bookinggroup685f1;
    if (!pendingAutoSearch.current) return;
      pendingAutoSearch.current = false;
      handleClick(false);
  }, [bookinggroup685f1]);
  
  //group props in ref to access latest props value
  const bookinggroup685f1PropsRef = useRef(bookinggroup685f1Props);
  useEffect(() => {
    bookinggroup685f1PropsRef.current = bookinggroup685f1Props;
  }, [bookinggroup685f1Props]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let customCode:any;
  const handleCustomCode=async () => {
    if (code != '') {
      let codeStates: any = {};
        codeStates['bookinggroup'] = bookinggroup685f1,
        codeStates['setbookinggroup'] = setbookinggroup685f1,
        codeStates['bookinggroup685f1'] = bookinggroup685f1Props,
        codeStates['setbookinggroup685f1'] = setbookinggroup685f1Props,
        codeStates['headline'] = headline20c17,
        codeStates['setheadline'] = setheadline20c17,
        codeStates['guestnamelabel'] = guestnamelabelf7e1e,
        codeStates['setguestnamelabel'] = setguestnamelabelf7e1e,
        codeStates['guestname'] = guestnamebe64b,
        codeStates['setguestname'] = setguestnamebe64b,
        codeStates['roomtypelabel'] = roomtypelabelf8eb4,
        codeStates['setroomtypelabel'] = setroomtypelabelf8eb4,
        codeStates['roomtype'] = roomtype98e13,
        codeStates['setroomtype'] = setroomtype98e13,
        codeStates['checkindatelabel'] = checkindatelabeldbd13,
        codeStates['setcheckindatelabel'] = setcheckindatelabeldbd13,
        codeStates['checkindate'] = checkindate76a0c,
        codeStates['setcheckindate'] = setcheckindate76a0c,
        codeStates['book'] = book82d32,
        codeStates['setbook'] = setbook82d32,
        codeStates['cancel'] = cancel1d281,
        codeStates['setcancel'] = setcancel1d281,
        codeStates['bookingtable'] = bookingtable4e8e9,
        codeStates['setbookingtable'] = setbookingtable4e8e9,
        codeStates['bookingtable4e8e9'] = bookingtable4e8e9Props,
        codeStates['setbookingtable4e8e9'] = setbookingtable4e8e9Props,
      codeStates['response']  = savedData.current;
      customCode = codeExecution(code,codeStates);
      return customCode;
    }
  }
  const {emp_v1, setemp_v1} = React.useState<any>({});
  const handleMapper=async (data?:any) => {
    try{     
      data = {...bookinggroup685f1Ref.current,...data};
      let parentRowSpan = 136;
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


 if (book82d32?.isHidden) {
    return <></>
  }

  return (
    <div
      style={{gridColumn: '9 / 11',gridRow: '119 / 135', gap:'', height: '100%', overflow: 'auto'}} 
 >
        {showFlag && <Button 
          ref={buttonRef}
          className=""
          onClick={handleClick}
          view='action'
          disabled= {book82d32?.isDisabled ? true : false}
          pin='circle-circle'
          contentAlign={"center"}
        >
          {keyset("book")}
        </Button>}
      </div>
    
  )
}



 




    

function objectToQueryString(obj: any) {
}
 

function Buttoncancel({ lockedData,setLockedData,primaryTableData, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData}: { lockedData:any,setLockedData:any,checkToAdd:any,setCheckToAdd:any,refetch:any,setRefetch:any,primaryTableData:any,setPrimaryTableData:any,encryptionFlagCompData:any,}){
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

  const [bookinggroup685f1, setbookinggroup685f1] = React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props] = React.useState<any>({});
  const [headline20c17, setheadline20c17] = React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e] = React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b] = React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4] = React.useState<any>({});
  const [roomtype98e13, setroomtype98e13] = React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13] = React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c] = React.useState<any>({});
  const [book82d32, setbook82d32] = React.useState<any>({});
  const [cancel1d281, setcancel1d281] = React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9] = React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props] = React.useState<any>({});
  //////////////
  const pendingAutoSearch = useRef(false);
  const preloadDone = useRef(false);
  // keep update group state in ref to access latest state value
  const bookinggroup685f1Ref = useRef(bookinggroup685f1);
  useEffect(() => {
    bookinggroup685f1Ref.current = bookinggroup685f1;
    if (!pendingAutoSearch.current) return;
      pendingAutoSearch.current = false;
      handleClick(false);
  }, [bookinggroup685f1]);
  
  //group props in ref to access latest props value
  const bookinggroup685f1PropsRef = useRef(bookinggroup685f1Props);
  useEffect(() => {
    bookinggroup685f1PropsRef.current = bookinggroup685f1Props;
  }, [bookinggroup685f1Props]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let customCode:any;
  const handleCustomCode=async () => {
    if (code != '') {
      let codeStates: any = {};
        codeStates['bookinggroup'] = bookinggroup685f1,
        codeStates['setbookinggroup'] = setbookinggroup685f1,
        codeStates['bookinggroup685f1'] = bookinggroup685f1Props,
        codeStates['setbookinggroup685f1'] = setbookinggroup685f1Props,
        codeStates['headline'] = headline20c17,
        codeStates['setheadline'] = setheadline20c17,
        codeStates['guestnamelabel'] = guestnamelabelf7e1e,
        codeStates['setguestnamelabel'] = setguestnamelabelf7e1e,
        codeStates['guestname'] = guestnamebe64b,
        codeStates['setguestname'] = setguestnamebe64b,
        codeStates['roomtypelabel'] = roomtypelabelf8eb4,
        codeStates['setroomtypelabel'] = setroomtypelabelf8eb4,
        codeStates['roomtype'] = roomtype98e13,
        codeStates['setroomtype'] = setroomtype98e13,
        codeStates['checkindatelabel'] = checkindatelabeldbd13,
        codeStates['setcheckindatelabel'] = setcheckindatelabeldbd13,
        codeStates['checkindate'] = checkindate76a0c,
        codeStates['setcheckindate'] = setcheckindate76a0c,
        codeStates['book'] = book82d32,
        codeStates['setbook'] = setbook82d32,
        codeStates['cancel'] = cancel1d281,
        codeStates['setcancel'] = setcancel1d281,
        codeStates['bookingtable'] = bookingtable4e8e9,
        codeStates['setbookingtable'] = setbookingtable4e8e9,
        codeStates['bookingtable4e8e9'] = bookingtable4e8e9Props,
        codeStates['setbookingtable4e8e9'] = setbookingtable4e8e9Props,
      codeStates['response']  = savedData.current;
      customCode = codeExecution(code,codeStates);
      return customCode;
    }
  }
  const {emp_v1, setemp_v1} = React.useState<any>({});
  const handleMapper=async (data?:any) => {
    try{     
      data = {...bookinggroup685f1Ref.current,...data};
      let parentRowSpan = 136;
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


 if (cancel1d281?.isHidden) {
    return <></>
  }

  return (
    <div
      style={{gridColumn: '14 / 16',gridRow: '119 / 135', gap:'', height: '100%', overflow: 'auto'}} 
 >
        {showFlag && <Button 
          ref={buttonRef}
          className=""
          onClick={handleClick}
          view='action'
          disabled= {cancel1d281?.isDisabled ? true : false}
          pin='circle-circle'
          contentAlign={"center"}
        >
          {keyset("cancel")}
        </Button>}
      </div>
    
  )
}



 








function Groupbookingtable({lockedData={},setLockedData,tableData=[],setTableData,primaryTableData={}, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,paginationDetails,encryptionFlagPageData, nodeData, setNodeData,isFormOpen=false}:any){
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
  const securityData:any={
  "emplyoee": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  },
  "Template": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  },
  "user": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  }
};
  const ruleData:any={};
  const prevRefreshRef = useRef(false);
  const handleOnloadCalledRef = useRef(false);
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});   
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});   
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});   
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});   
  const [guestname960a0, setguestname960a0]= React.useState<any>({});   
  const [roomtype2f091, setroomtype2f091]= React.useState<any>({});   
  const [checkindate03aac, setcheckindate03aac]= React.useState<any>({});   
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
  const bookingtable4e8e9Ref = useRef<any>(null);
  const handleClearSearch = () => {
    bookingtable4e8e9Ref.current?.setSearchParams();
    bookingtable4e8e9Ref.current?.handleSearch({});
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
        gridRow: '141 / 269',
        overflow: 'visible',
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
          setemp_v1((pre:any)=>({...pre,_selectedGroup_:"bookingtable"}))
        }}
    >
      <div className='flex flex-col h-full w-full min-w-0 overflow-auto'>
        <div className='flex flex-1 w-full min-h-0'>
       {<Tablebookingtable headerButtonsRenders={renderBUttons}
        tableData={tableData} setTableData={setTableData} lockedData={lockedData} setLockedData={setLockedData}  primaryTableData={primaryTableData} setPrimaryTableData={setPrimaryTableData}  refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} paginationDetails={paginationDetails} open={open} setOpen={setOpen} ref={bookingtable4e8e9Ref} ButtonGoRuleData={ButtonGoRuleData} setButtonGoRuleData ={setButtonGoRuleData} setIsProcessing={setIsProcessing}/>}
      </div>
      </div>
    </div>
 )
}

 
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
function Tablebookingtable({headerButtonsRenders=()=>{return<></>},headerPosition="",headerText="",lockedData,setLockedData,primaryTableData, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch, setRefetch,setData,encryptionFlagCompData,paginationDetails,open, setOpen, ref, ButtonGoRuleData, setButtonGoRuleData}: any){
  const {globalState , setGlobalState} = React.useState<any>({});
  const tableName = "bookingtable"
  const {validate , setValidate} = React.useState<any>({});
  const {validateRefetch , setValidateRefetch} = React.useState<any>({});
  const {refresh, setRefresh} = React.useState<boolean>(false);
  const {memoryVariables, setMemoryVariables} = React.useState<any>({});
  const {accessProfile, setAccessProfile} = React.useState<any>({});
  const [disable,setDisable] = useState(false);
  let colourIndicatorCols:any= [] ;
  let defaultColumns = [
  {
    "id": "guestname",
    "nodeid": "218c7b426bee4875baee5cd2e88960a0",
    "name": "guestname",
    "meta": {
      "sort": true
    },
    "className": "",
    "align": "left",
    "hide": false,
    "isSearch": false,
    "colourIndicator": []
  },
  {
    "id": "roomtype",
    "nodeid": "92ee0911894346cbb9dbb08f4332f091",
    "name": "roomtype",
    "meta": {
      "sort": true
    },
    "className": "",
    "align": "left",
    "hide": false,
    "isSearch": false,
    "colourIndicator": []
  },
  {
    "id": "checkindate",
    "nodeid": "fb698f0076f84213b5694781a6203aac",
    "name": "checkindate",
    "meta": {
      "sort": true
    },
    "className": "",
    "align": "left",
    "hide": false,
    "isSearch": false,
    "colourIndicator": []
  }
] ;
  for (let i = 0; i < defaultColumns.length; i++) {
    defaultColumns[i].id = defaultColumns[i].id.toLowerCase();
  }

  //////////


// Separate component for row actions to avoid hooks violations
const RowActionComponent = React.memo(({index, allData, setRefetch, encryptionFlagCompData,security=[]}: any) => {
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const popoverButtonElement = useRef(null);
  let filteredData: any = {};
  if (allData.length !== 0) {
    filteredData = allData[index] || {};
  }
  function handlePopupData() {
    return (
      <div className='flex flex-col gap-1'>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <Button ref={popoverButtonElement}  view='flat' pin="round-round" className="text-lg flex h-full !w-5 " onClick={() => setPopoverOpen(true)}><Icon data={"RxDotsVertical"} size={20} fillContainer={false}/></Button>
      <Popup
        anchorRef={popoverButtonElement}
        open={isPopoverOpen}
        onClose={() => setPopoverOpen(false)}
        disablePortal={false}
        placement='right'
        className='w-[11vw]'
      >
        {handlePopupData()}
      </Popup>
    </div>
  );
});
RowActionComponent.displayName = 'RowActionComponent';






  ///////////
  function inferFakerValue(column: any) {
  const id = column.id.toLowerCase();

  // 🎨 If colourIndicator is defined — choose a random key
  if (column.colourIndicator?.length) {
    const randomStatus = faker.helpers.arrayElement(column.colourIndicator);
    return randomStatus.key;
  }

  // 💬 Text fields
  if (id.includes('name') || id.includes('title')) return faker.commerce.productName();

  // 💰 Amount / total
  if (id.includes('amount') || id.includes('total') || id.includes('price'))
    return faker.finance.amount({ min: 100, max: 5000, dec: 2 });

  // 📅 Date or formatted date
  if (id.includes('date') || id.includes('time'))
    return faker.date.recent({ days: 30 }).toISOString().split('T')[0];

  // 🔢 Numbers / counts
  if (id.includes('count') || id.includes('num') || id.includes('id'))
    return faker.number.int({ min: 1, max: 1000 });

  // ✅ Booleans / status flags
  if (id.startsWith('is_') || id.includes('flag'))
    return faker.datatype.boolean();

  // 🧾 Default fallback
  return faker.lorem.word();
}

// Generate a single record
function generateMockRecord(schema: any[]) {
  const record: Record<string, any> = {};
  schema.forEach((col) => {
    record[col.id] = inferFakerValue(col);
  });
  return record;
}

// Generate multiple records
function generateMockData(schema: any[], count = 70) {
  return Array.from({ length: count }, () => generateMockRecord(schema));
}

let mockData = generateMockData(defaultColumns);
  const [translatedColumns,setTranslatedColumns]= useState<any>([])
  const securityData:any={
  "emplyoee": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "blockedControls": [],
    "readOnlyControls": []
  },
  "Template": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "blockedControls": [],
    "readOnlyControls": []
  },
  "user": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "blockedControls": [],
    "readOnlyControls": []
  }
}
  const encryptionFlagCont: boolean = encryptionFlagCompData?.flag || false ;
  let encryptionDpd: string = "";
  encryptionDpd = encryptionDpd !=='' ? encryptionDpd: encryptionFlagCompData?.dpd
  let encryptionMethod: string = "";
  encryptionMethod  = encryptionMethod !=='' ? encryptionMethod: encryptionFlagCompData?.method
  const upId: string | any = getCookie('upId')
  let dfKey: string | any
  let dfdType : string | any
  const toast =useInfoMsg()
  const [columns,setColumns]=useState<any>([])
    let orgDetails:any={}
  const [allCode, setAllCode] = React.useState(orgDetails?.code);
  const [paginationData, setPaginationData] = React.useState({
    page: 0,
    pageSize: 0,
    total: 0,
  })
  const routes = useRouter()
  const prevRefreshRef = useRef(false);
  const refreshInitRef = useRef(false);
  const prevSearchFilterRef = useRef("");
  const prevFilterPayloadRef = useRef("");
  const skipNextFilterPropsRef = useRef(false);
  const fetchDataAbortRef = useRef<AbortController | null>(null);
  const lastLockedDataRef = useRef<any>(null);
  const skipUnlockRef = useRef(false)
  const lockedDataRef = useRef(lockedData)
  const myLockedIdsRef = useRef<any[]>([])
  const [loading, setLoading]= useState<boolean>(false)
  const [allData, setAllData] = React.useState<any>([]);
  const [allDataObject, setAllDataObject] = React.useState<any>([]);
  const [showProfileAsModalOpen, setShowProfileAsModalOpen] = React.useState(false);
  const [showElementAsPopupOpen, setShowElementAsPopupOpen] = React.useState(false);
  const [assetDataReady, setAssetDataReady] = React.useState<boolean>(false);
  const [searchFilterFlag, setSearchFilterFlag] = useState(false);
  const keyset:any=i18n.keyset("language") 
  const [needLockingAndRule, setNeedLockingAndRule] = useState<any>({
    lockMode: 'Single',
    ttl: ''
  })
  const [DFkeyAndRule, setDFkeyAndRule] = React.useState({
    isRulePresent:false,
    dfKey:"",
    dfdType:""
  })
 /////////////
   //another screen
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});
  const [guestname960a0, setguestname960a0]= React.useState<any>({});
  const [roomtype2f091, setroomtype2f091]= React.useState<any>({});
  const [checkindate03aac, setcheckindate03aac]= React.useState<any>({});
  //////////////
  const [goruleData,setGoruleData]=useState<any>({})
  function getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  // Utility to get nested value
  function getValueByPathForNested(obj: any, path: string): any {
    const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.');
    return keys.reduce((acc, key) => acc?.[key], obj);
  }

  // Clean the mapper path
  function extractPath(sourcekey: string): string {
    const rawPath = sourcekey.split('|').pop() ?? '';
    // remove items.properties. since your actual data has direct keys
    return rawPath
      .replace(/items\.properties\./g, '')
      .replace(/items\./g, '')
      .replace(/properties\./g, '');
  }
    function getColumnTypeFromSchema(schemaNode: any, columnId: string): string {
    const nodeType = schemaNode?.nodeType;
    const schema = schemaNode?.schema;

    if (!schema || !columnId) return 'string';

    if (nodeType === 'datasetnode' || nodeType === 'datasetschemanode') {
      if (schema?.type === 'object') {
        return schema?.properties?.[columnId]?.type || 'string';
      } else if (schema?.type === 'array') {
        return schema?.items?.properties?.[columnId]?.type || 'string';
      }
    } else if (nodeType === 'apinode') {
      const responseSchema = schema?.responses?.["200"]?.content?.["application/json"]?.schema;
      if (responseSchema?.type === 'object') {
        return responseSchema?.properties?.[columnId]?.type || 'string';
      } else if (responseSchema?.type === 'array') {
        return responseSchema?.items?.properties?.[columnId]?.type || 'string';
      }
    } else if (nodeType === 'dbnode') {
      if (Array.isArray(schema)) {
        const col = schema.find((c: any) => c.name === columnId);
        return col?.type || 'string';
      }
    }

    return 'string';
  }

  function formatNumberWithCommas(value: any): string | any {
    if (value === null || value === undefined || value === '') return value;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || !isFinite(num)) return value;
    if (typeof value === 'string' && !/^-?\d+(\.\d+)?$/.test(value.trim())) return value;
    return num.toLocaleString('en-US');
  }
  const GetTableDetails = async () => {
    mapperData = [];
    schemaDataDFO = {};
    mappperNodeId = "";
    setGoruleData(goRuleData ||{})
    let schemaData:any = {}
    if(schemaDataDFO  && mappperNodeId){
      schemaDataDFO?.map((ele:any)=>{
        if(ele.nodeId==mappperNodeId){
          if (ele?.nodeType == 'datasetnode' || ele?.nodeType == 'datasetschemanode'){
          if (ele?.schema?.type == "object") {
              schemaData = ele?.schema?.properties;
          }else if (ele?.schema?.type == "array") {
              schemaData = ele?.schema?.items?.properties;
          }                            
          }else if (ele?.nodeType == 'apinode') {
          if (ele?.schema?.responses["200"].content["application/json"].schema?.type == "object") {
              schemaData = ele?.schema?.responses["200"].content["application/json"].schema?.properties;
          }else if (ele?.schema?.responses["200"].content["application/json"].schema?.type == "array") {
              schemaData = ele?.schema?.responses["200"].content["application/json"].schema?.items?.properties;
          }
          }else if (ele?.nodeType == 'dbnode') {
          let temp:any = {}
          if (Array.isArray(ele?.schema)) {
          ele?.schema.map((cols:any)=>{
              temp[cols.name]={type:cols.type}
          })
          }
          schemaData = temp;
          } 
        }
      })
    }
    let altertColumns:any=[];
    let allowesColumns:any=[];
    defaultColumns.map((cols:any)=>{
      let temp:any = cols
      {
        if(!(accessProfile in securityData) || !securityData[accessProfile]?.blockedControls?.includes(cols.id))
        {
          allowesColumns.push(temp)
        }
      }
    })
    setColumns(allowesColumns); 
    for (let i = 0; i < allowesColumns.length; i++) {
      for (let j = 0; j < mapperData.length; j++) {
        if (allowesColumns[i].id === mapperData[j]?.elementname.toLowerCase()) {
          let nodeId = mapperData[j]?.sourcekey.split("|")[1];
          let path = mapperData[j]?.sourcekey.split("|")[2];
          for (let k = 0; k < schemaDataDFO.length; k++) {
            if (schemaDataDFO[k].nodeId === nodeId) {                    
              const columnType = getColumnTypeFromSchema(schemaDataDFO[k], allowesColumns[i].id);
              altertColumns.push({...allowesColumns[i], type: columnType})
            }                 
          }
        }
      }
      if(allowesColumns[i].type== '__ActionDetails__')
      {
        altertColumns.push(allowesColumns[i])
      }            
    }
          // allowesColumns.map((defaultRenderItem:any)=>{
          //   if(defaultRenderItem.id in schemaData)
          //   {
          //     altertColumns.push({...defaultRenderItem,type:schemaData[defaultRenderItem.id].type || 'string'})
          //   }
          // })
    const translatedColumnsData = altertColumns.map((col:any) => ({
      ...col,
      name: keyset(col?.name), 
      }));
    setTranslatedColumns(translatedColumnsData)
    // for pagination data page ,count and dfkey
    setPaginationData((pre: any) => ({
      ...pre,
      page: 0,
      pageSize: 0
    }))

    setDFkeyAndRule((pre:any)=>({
      ...pre,
        isRulePresent:false,
        dfKey:"",
        dfdType:""
    }))

    dfKey = ""
    dfdType =""
  }

  const [SearchParams,setSearchParams] = useState<any>({})

  const latestLockStateRef = useRef({ needLockingAndRule, lockedData, allData, bookingtable4e8e9 })
  useEffect(() => {
    latestLockStateRef.current = { needLockingAndRule, lockedData, allData, bookingtable4e8e9 }
  })

    const setLockMode=async(ids:any)=>{
    const { needLockingAndRule, lockedData, allData, bookingtable4e8e9 } = latestLockStateRef.current
    /// setbookingtable4e8e9Props
    let postIds: any = []
    let processIds: any = []
    let selectedData:any=[];
    if(needLockingAndRule.lockMode=='Single'){
      // its for ui level selected list show for single select
      if (ids.length == 0) {
        setLockedData({
      ...lockedData,
      processIds: processIds,
      data:selectedData,
      primaryKeys: [],
      lockMode: needLockingAndRule,
      ttl: needLockingAndRule.ttl
    })
        lastLockedDataRef.current = { primaryKeys: [] }
        myLockedIdsRef.current = []
        lockedDataRef.current = { primaryKeys: [] }
        let keys:any
        setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:[]}))
        setLockedData((pre:any)=>({...pre,data:[]}))
        return
      }

      bookingtable4e8e9.filter((item:any,id:number)=>{
        if (ids.at(-1)==item.id){
          selectedData?.push(allData[id])
          postIds.push(item.id)
          processIds.push(item?.trs_process_id)
        }
      })

        let index = Number(ids[ids.length - 1])
        let row:any = {}
        allData?.map((data:any,i:any)=>{
          if(data?.id==ids[ids.length - 1])
          {
            index=i
            row=data
          }
        })

      //////////
      //////////
      setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:[ids[ids.length-1]]}))
    }
    else if(needLockingAndRule.lockMode==='Multi'){
      // its for ui level selected list show for multi select
      bookingtable4e8e9.filter((item:any,id:number)=>{
        if (ids.includes(item.id)){
          selectedData?.push(item)
          postIds.push(item.id) 
          processIds.push(item?.trs_process_id)
        } 
      })
      let index = Number(ids[ids.length - 1])
        let row:any = {}
        allData?.map((data:any,i:any)=>{
          if(data?.id==ids[ids.length - 1])
          {
            index=i
            row=data
          }
        })

      setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:ids}))
      if(ids?.length>0)
      {
                  }
    }
    let index = Number(ids[ids.length - 1])
      let row:any = {}
      allData?.map((data:any,i:any)=>{
        if(data?.id==ids[ids.length - 1])
        {
          index=i
          row=data
        }
      })
    let checkedData: any = selectedPaginationData
    if (checkedData.length) {
      let itsAlreadyThere: boolean = false
      selectedPaginationData.map((item: any) => {
        if (item.page == paginationData.page) {
          itsAlreadyThere = true
        }
      })
      if (itsAlreadyThere) {
        for (let i = 0; i < checkedData.length; i++) {
          if (checkedData[i].page == paginationData.page) {
            checkedData[i].data = ids
            break
          }
        }
      } else {
        checkedData = [
          ...checkedData,
          {
            page: paginationData.page,
            data: ids
          }
        ]
      }
    } else {
      checkedData.push({
        page: paginationData.page,
        data: ids
      })
    }
    setSelectedPaginationData(checkedData)

    setLockedData({
      ...lockedData,
      processIds: processIds,
      data:selectedData,
      primaryKeys: postIds,
      lockMode: needLockingAndRule,
      ttl: needLockingAndRule.ttl,
      selectedData:selectedData
    })
    lastLockedDataRef.current = { primaryKeys: postIds }
    myLockedIdsRef.current = postIds
    lockedDataRef.current = { primaryKeys: postIds }

    let customCode:any=""
    if (allCode != '') {
      let codeStates: any = {};
        codeStates['bookinggroup'] = bookinggroup685f1,
        codeStates['setbookinggroup'] = setbookinggroup685f1,
        codeStates['bookinggroup685f1'] = bookinggroup685f1Props,
        codeStates['setbookinggroup685f1'] = setbookinggroup685f1Props,
        codeStates['bookingtable'] = bookingtable4e8e9,
        codeStates['setbookingtable'] = setbookingtable4e8e9,
        codeStates['bookingtable4e8e9'] = bookingtable4e8e9Props,
        codeStates['setbookingtable4e8e9'] = setbookingtable4e8e9Props,
        codeStates['guestname'] = guestname960a0,
        codeStates['setguestname'] = setguestname960a0,
        codeStates['roomtype'] = roomtype2f091,
        codeStates['setroomtype'] = setroomtype2f091,
        codeStates['checkindate'] = checkindate03aac,
        codeStates['setcheckindate'] = setcheckindate03aac,
      customCode = codeExecution(allCode,codeStates);
      return customCode;
    }

  }
  const [selectedPaginationData, setSelectedPaginationData] = useState<any[]>(
      []
    )
  const [settings, setSettings] = useState<any>();
  const handleUpdate = (page:any, pageSize:any) =>{
    let searchParams:any = nullFilter(SearchParams);
    setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:[]}))
    let checkedData: any = selectedPaginationData
    if (checkedData.length) {
      for (let i = 0; i < checkedData.length; i++) {
        if (checkedData[i].page == page) {
          setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:checkedData[i].data}))
        }
      }
    }
    setPaginationData(prevState => ({ ...prevState, page, pageSize }))
    fetchData(page, pageSize,searchParams,DFkeyAndRule,DFkeyAndRule?.isRulePresent,false,filterPropsData,filterPropsData?true:false)
  }

  async function fetchData(page:any = 1, pageSize:any = 10, searchParams = {},dfKey:any,isRulePresent:any=false,isOnLoad = false,filterProps?:any,itsFromRefreshHandler:any=false,sortingDetails:any={}){
  }
////////////////////////////////
  const RowAction = async({item,index,nodeName}: any) => {
    let filteredData:any={}
    if(allData.length!=0)
    {
      let index =-1
      let row:any = {}
      allData?.map((data:any,i:any)=>{
        if(data?.id==item?.id)
        {
          index=i
          row=data
        }
      })
      filteredData=flattenKeepInner(allData[index]||{})
    }
  };

////////////////////////
 const colurIndicator = (keyValue:any=[], comingValue:any, indicatorType?:string) => {
    // Default colors: green, red, orange
    const defaultColors = ['#22c55e', '#ef4444', '#f97316'];

    let customeUI: JSX.Element | null = null;

    // Normalize the incoming value for comparison
    const normalizedComingValue = String(comingValue).trim();

    // Find matching configuration
    for (let i = 0; i < keyValue.length; i++) {
      const normalizedKey = String(keyValue[i]?.key || '').trim();

      if (normalizedKey === normalizedComingValue) {
        // Use configured color or color based on index
        const backgroundColor = keyValue[i]?.colorCode || defaultColors[i % defaultColors.length];
        const icon = keyValue[i]?.icon;

        if (indicatorType === 'rounded') {
            customeUI = (
              <div 
              className="flex rounded-full aspect-square h-5 w-5 justify-center items-center shrink-0"
              style={{ backgroundColor }}>
              </div>
            );
        } else if (indicatorType === 'rectangle') {
          // For rectangle type, show colored background with icon or text
          customeUI = (
            <div
              className="flex h-full p-2 justify-center w-[20%]"
              style={{ backgroundColor }}
            >
              {icon && icon.trim() !== '' ? (
                <Icon data={icon} size={20} fillContainer={false}/>
              ) : (
                comingValue
              )}
            </div>
          );
        } else {
          // Default: show colored background with icon or text
          customeUI = (
              <div 
              className="flex rounded-full aspect-square h-5 w-5 justify-center items-center shrink-0"
              style={{ backgroundColor }}>
              </div>
            );
        }
        break;
      }
    }
    if(!customeUI)
    {
      return comingValue
    }

    return customeUI;
  };


  async function UpdatedDataHandle(filterProps?: any) { 
  }
  


  const handlePrimaryTable = () => {
    let findData = bookingtable4e8e9Props?.selectedIds[bookingtable4e8e9Props?.selectedIds?.length-1]
    if(Array.isArray(bookingtable4e8e9) && bookingtable4e8e9.length>0)
    {
      let data = bookingtable4e8e9.find((data:any)=>(data?.id==findData))||{}
      setPrimaryTableData({
        ...primaryTableData,
        primaryKey: "id",
        value: data["id"],
        parentData: data
      })
    }
  }



  const handleAssetPageReady = () => {
    setAssetDataReady(true);
    setIsProcessing(false);
  }
  const handleOnRowClick=async(data?:any,ids?:any)=>{
  }

  function onButtonSecurityHandle(data: any) {
  }

 const bindPreviousAndNext=(currectIndex:any,forEvent:any,setData:string,parentTrigger:any="",currectPage:any)=>{
    if(currectPage!=paginationData?.page)
    {
    if(forEvent&&setData)
    {
      currectIndex=-1
      if(bookingtable4e8e9?.length==0)
      {
        eventBus.emit(parentTrigger, { message: "no data" });
        return
      }
      if(forEvent=="next"&&bookingtable4e8e9?.at((+currectIndex)+1))
      {
        const newIndex = (+currectIndex)+1;
        allState[setData](bookingtable4e8e9?.at(newIndex))
        eventBus.emit(parentTrigger, { index: newIndex, data: bookingtable4e8e9?.at(newIndex) ,currectPage:paginationData?.page});
        return newIndex
      }
      if(forEvent=="previous"&&((+currectIndex)-1)>=0&&bookingtable4e8e9?.at((+currectIndex)-1))
      {
        const newIndex = (+currectIndex)-1;
        allState[setData](bookingtable4e8e9?.at(newIndex))
        eventBus.emit(parentTrigger, { index: newIndex, data: bookingtable4e8e9?.at(newIndex) ,currectPage:paginationData?.page});
        return newIndex
      } 
    }
    }else{
    if(forEvent&&setData)
    {
      if(bookingtable4e8e9?.length==0)
      {
        eventBus.emit(parentTrigger, { message: "no data" });
        return
      }
      if(forEvent=="next"&&bookingtable4e8e9?.at((+currectIndex)+1))
      {
        const newIndex = (+currectIndex)+1;
        allState[setData](bookingtable4e8e9?.at(newIndex))
        eventBus.emit(parentTrigger, { index: newIndex, data: bookingtable4e8e9?.at(newIndex) ,currectPage:paginationData?.page});
        return newIndex
      }
      if(forEvent=="previous"&&((+currectIndex)-1)>=0&&bookingtable4e8e9?.at((+currectIndex)-1))
      {
        const newIndex = (+currectIndex)-1;
        allState[setData](bookingtable4e8e9?.at(newIndex))
        eventBus.emit(parentTrigger, { index: newIndex, data: bookingtable4e8e9?.at(newIndex) ,currectPage:paginationData?.page});
        return newIndex
      } 
    }
    }
    
  }
  //////
  ////
  if (bookingtable4e8e9?.isHidden) {
    return <></>
  }
  // Process data to apply color indicators
  const processedData = Array.isArray(mockData) ? mockData.map((row: any) => {
    const processedRow = { ...row };

    defaultColumns.forEach((col: any) => {
      if (col.isColourIndicator === true && Array.isArray(col.colourIndicator) && col.colourIndicator.length > 0) {
        const cellValue = row[col.id];
        if (cellValue !== undefined && cellValue !== null) {
          const indicator = colurIndicator(col.colourIndicator, cellValue, col.ColourIndicatorType);
          if (indicator !== null) {
            processedRow[col.id] = indicator;
          }
        }
      }
    });

    return processedRow;
  }) : [];
  return(
    <div className='w-full h-full'>
            <div className=' w-full h-full flex flex-row border-2'>
            <Table
              className=" width-[100%]"
              data={processedData}
              columns={defaultColumns}
              primaryKey="id"
              edgePadding={true}
              disable={disable}
              selectedIds={bookingtable4e8e9Props?.selectedIds}  
              onSelectionChange={setLockMode} 
              wordWrap={true}
              onRowClick={onButtonSecurityHandle}
            isRowclick={false}
            showPagination={true}
            pagination={{
              page:1,
              pageSize:10,
              pageSizeOptions:[5, 10, 20, 50, 100],
              total:processedData?.length ||1,
              onUpdate:(e:any)=>handleUpdate(e.page,e.pageSize)
            }}
            headerButtonsRenders={headerButtonsRenders()}
            headerText={headerText}
            headerPosition={headerPosition}
          />
          </div>
    </div>
  )
}



 }`,
  "bbbb":` 
function PagePreviewEmpV1({ onReady }: { onReady?: () => void } = {}) {
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
  const securityData : SecurityData = {
  "emplyoee": {
    "blockedGroups": []
  },
  "Template": {
    "blockedGroups": []
  },
  "user": {
    "blockedGroups": []
  }
};
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
  const [checkbookinggroup,setCheckbookinggroup,]=useState<boolean>(false);
  const [checkbookingtable,setCheckbookingtable,]=useState<boolean>(false);
  const [bookinggroup685f1, setbookinggroup685f1] = React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9] = React.useState<any>({});
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
      {<Groupbookinggroup 
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
      {<Groupbookingtable 
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
     








function Groupbookinggroup({lockedData={},setLockedData,tableData=[],setTableData,primaryTableData={}, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,paginationDetails,encryptionFlagPageData, nodeData, setNodeData,isFormOpen=false}:any){
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
  const securityData:any={
  "emplyoee": {
    "allowedControls": [
      "headline",
      "guestnamelabel",
      "guestname",
      "roomtypelabel",
      "roomtype",
      "checkindatelabel",
      "checkindate",
      "book",
      "cancel"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  },
  "Template": {
    "allowedControls": [
      "headline",
      "guestnamelabel",
      "guestname",
      "roomtypelabel",
      "roomtype",
      "checkindatelabel",
      "checkindate",
      "book",
      "cancel"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  },
  "user": {
    "allowedControls": [
      "headline",
      "guestnamelabel",
      "guestname",
      "roomtypelabel",
      "roomtype",
      "checkindatelabel",
      "checkindate",
      "book",
      "cancel"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  }
};
  const ruleData:any={};
  const prevRefreshRef = useRef(false);
  const handleOnloadCalledRef = useRef(false);
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});   
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});   
  const [headline20c17, setheadline20c17]= React.useState<any>({});   
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});   
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});   
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});   
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});   
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});   
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});   
  const [book82d32, setbook82d32]= React.useState<any>({});   
  const [cancel1d281, setcancel1d281]= React.useState<any>({});   
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});   
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});   
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
  const bookinggroup685f1Ref = useRef<any>(null);
  const handleClearSearch = () => {
    bookinggroup685f1Ref.current?.setSearchParams();
    bookinggroup685f1Ref.current?.handleSearch({});
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
        gridRow: '2 / 138',
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
          setemp_v1((pre:any)=>({...pre,_selectedGroup_:"bookinggroup"}))
        }}
    >
          {<Textheadline   /* 20c17 */ isDynamic={false } index={idx} item={item} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<Labelguestnamelabel   /* f7e1e */ lockedData={lockedData} setLockedData={setLockedData}  checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<TextInputguestname   /* be64b */ lockedData={lockedData} setLockedData={setLockedData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<Labelroomtypelabel   /* f8eb4 */ lockedData={lockedData} setLockedData={setLockedData}  checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<TextInputroomtype   /* 98e13 */ lockedData={lockedData} setLockedData={setLockedData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<Labelcheckindatelabel   /* dbd13 */ lockedData={lockedData} setLockedData={setLockedData}  checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {<TextInputcheckindate   /* 76a0c */ lockedData={lockedData} setLockedData={setLockedData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} setIsProcessing={setIsProcessing} />}
        {            <Buttonbook tableData={tableData} setTableData={setTableData} lockedData={lockedData} setLockedData={setLockedData} primaryTableData={primaryTableData} setPrimaryTableData={setPrimaryTableData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData}  setIsProcessing={setIsProcessing}/>}            
        {            <Buttoncancel tableData={tableData} setTableData={setTableData} lockedData={lockedData} setLockedData={setLockedData} primaryTableData={primaryTableData} setPrimaryTableData={setPrimaryTableData} checkToAdd={checkToAdd} setCheckToAdd={setCheckToAdd} refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData}  setIsProcessing={setIsProcessing}/>}            
    </div>
 )
}

 


function Textheadline({encryptionFlagCompData,isDynamic,item,index,setIsProcessing}:any){
  const [accessProfile, setAccessProfile] = React.useState<any[]>([]);
  const keyset:any=i18n.keyset("language");
  const encryptionFlagCont: boolean = encryptionFlagCompData.flag || false ;
  let encryptionDpd: string = "";
  encryptionDpd = encryptionDpd !=='' ? encryptionDpd: encryptionFlagCompData.dpd
  let encryptionMethod: string = "";
  encryptionMethod  = encryptionMethod !=='' ? encryptionMethod: encryptionFlagCompData.method;
  /////////////
   //another screen
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});  
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});  
  const [headline20c17, setheadline20c17]= React.useState<any>({});  
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});  
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});  
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});  
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});  
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});  
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});  
  const [book82d32, setbook82d32]= React.useState<any>({});  
  const [cancel1d281, setcancel1d281]= React.useState<any>({});  
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});  
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});  
  const [headline20c17Props, setheadline20c17Props] = React.useState<Record<string, any>>({});
  //////////////

  const handleMapperValue=async(filterProps?:any,filterFlag?:boolean)=>{
  }


  if (headline20c17?.isHidden) {
    return <></>
  }

return (
  <div className="" style={{gridColumn: '9 / 16',gridRow: '4 / 23', gap:'', height: '100%'}} >
<Text
  contentAlign={"center"}
  className=""
  variant="display-3"
  color="primary"
>
      {keyset("Booking Form")}
</Text>
  </div>
  )
}

 




function Labelguestnamelabel({lockedData,setLockedData,encryptionFlagCompData,setIsProcessing}:any){
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});
  const [headline20c17, setheadline20c17]= React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});
  const [book82d32, setbook82d32]= React.useState<any>({});
  const [cancel1d281, setcancel1d281]= React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});
  //////////////


const handleClick =async(e:any)=>{
}


  if (guestnamelabelf7e1e?.isHidden) {
    return <></>
  }  

  return (
    <div 
      style={{gridColumn: '9 / 11',gridRow: '27 / 37', gap:'', height: '100%', overflow: 'hidden'}} >
      <Label 
        className=""
        disabled= {guestnamelabelf7e1e?.isDisabled ? true : false}
        theme="normal"
        interactive={false}
      onClick = {handleClick}
      >
      Guest Name
      </Label>
    </div>
  )
}

 



///////////////
////////////

function TextInputguestname({lockedData,setLockedData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData,setIsProcessing}:any){
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
  const [dynamicStateandType,setDynamicStateandType]=useState<Record<string, any>>({name:'guestname',type:"text"})
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
  const [bookinggroup685f1, setbookinggroup685f1]= useState<any>(null);
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= useState<any>(null);
  const [headline20c17, setheadline20c17]= useState<any>(null);
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= useState<any>(null);
  const [guestnamebe64b, setguestnamebe64b]= useState<any>(null);
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= useState<any>(null);
  const [roomtype98e13, setroomtype98e13]= useState<any>(null);
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= useState<any>(null);
  const [checkindate76a0c, setcheckindate76a0c]= useState<any>(null);
  const [book82d32, setbook82d32]= useState<any>(null);
  const [cancel1d281, setcancel1d281]= useState<any>(null);
  const [bookingtable4e8e9, setbookingtable4e8e9]= useState<any>(null);
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= useState<any>(null);
  

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
  const bookinggroup685f1Ref = useRef<any>(bookinggroup685f1);
  useEffect(() => { bookinggroup685f1Ref.current = bookinggroup685f1; }, [bookinggroup685f1]);
  if (guestnamebe64b?.isHidden) {
    return <></>
  }
  return (   
    <div  
      style={{gridColumn: '9 / 16',gridRow: '41 / 51', gap:'', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column'}} >
        {isRequredData && <span style={{ color: 'red' }}>*</span>}
      <div style={{ flex: 1, minHeight: 0 }}>
      <TextInput
        require={isRequredData}
        className=""
        label={keyset("guestname")}
        onChange= {handleChange}
        onBlur={handleBlur}
        itsHaveCurrency={false}
        type={dynamicStateandType.type}
        value={bookinggroup685f1?.guestname||""}
         disabled= {guestnamebe64b?.isDisabled ? true : false}
        pin='brick-brick'     
        placeholder='type here....'      
        view='normal'
        contentAlign={"left"}
      errorMessage={error}
        validationState={validate?.emp_v1?.guestname ? "invalid" : undefined}
      />
      </div>
    </div> 
  )
}

 




function Labelroomtypelabel({lockedData,setLockedData,encryptionFlagCompData,setIsProcessing}:any){
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});
  const [headline20c17, setheadline20c17]= React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});
  const [book82d32, setbook82d32]= React.useState<any>({});
  const [cancel1d281, setcancel1d281]= React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});
  //////////////


const handleClick =async(e:any)=>{
}


  if (roomtypelabelf8eb4?.isHidden) {
    return <></>
  }  

  return (
    <div 
      style={{gridColumn: '9 / 11',gridRow: '55 / 65', gap:'', height: '100%', overflow: 'hidden'}} >
      <Label 
        className=""
        disabled= {roomtypelabelf8eb4?.isDisabled ? true : false}
        theme="normal"
        interactive={false}
      onClick = {handleClick}
      >
      Room Type
      </Label>
    </div>
  )
}

 



///////////////
////////////

function TextInputroomtype({lockedData,setLockedData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData,setIsProcessing}:any){
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
  const [dynamicStateandType,setDynamicStateandType]=useState<Record<string, any>>({name:'roomtype',type:"text"})
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
  const [bookinggroup685f1, setbookinggroup685f1]= useState<any>(null);
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= useState<any>(null);
  const [headline20c17, setheadline20c17]= useState<any>(null);
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= useState<any>(null);
  const [guestnamebe64b, setguestnamebe64b]= useState<any>(null);
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= useState<any>(null);
  const [roomtype98e13, setroomtype98e13]= useState<any>(null);
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= useState<any>(null);
  const [checkindate76a0c, setcheckindate76a0c]= useState<any>(null);
  const [book82d32, setbook82d32]= useState<any>(null);
  const [cancel1d281, setcancel1d281]= useState<any>(null);
  const [bookingtable4e8e9, setbookingtable4e8e9]= useState<any>(null);
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= useState<any>(null);
  

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
  const bookinggroup685f1Ref = useRef<any>(bookinggroup685f1);
  useEffect(() => { bookinggroup685f1Ref.current = bookinggroup685f1; }, [bookinggroup685f1]);
  if (roomtype98e13?.isHidden) {
    return <></>
  }
  return (   
    <div  
      style={{gridColumn: '9 / 16',gridRow: '69 / 79', gap:'', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column'}} >
        {isRequredData && <span style={{ color: 'red' }}>*</span>}
      <div style={{ flex: 1, minHeight: 0 }}>
      <TextInput
        require={isRequredData}
        className=""
        label={keyset("roomtype")}
        onChange= {handleChange}
        onBlur={handleBlur}
        itsHaveCurrency={false}
        type={dynamicStateandType.type}
        value={bookinggroup685f1?.roomtype||""}
         disabled= {roomtype98e13?.isDisabled ? true : false}
        pin='brick-brick'     
        placeholder='type here....'      
        view='normal'
        contentAlign={"left"}
      errorMessage={error}
        validationState={validate?.emp_v1?.roomtype ? "invalid" : undefined}
      />
      </div>
    </div> 
  )
}

 




function Labelcheckindatelabel({lockedData,setLockedData,encryptionFlagCompData,setIsProcessing}:any){
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});
  const [headline20c17, setheadline20c17]= React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b]= React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= React.useState<any>({});
  const [roomtype98e13, setroomtype98e13]= React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c]= React.useState<any>({});
  const [book82d32, setbook82d32]= React.useState<any>({});
  const [cancel1d281, setcancel1d281]= React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});
  //////////////


const handleClick =async(e:any)=>{
}


  if (checkindatelabeldbd13?.isHidden) {
    return <></>
  }  

  return (
    <div 
      style={{gridColumn: '9 / 11',gridRow: '83 / 93', gap:'', height: '100%', overflow: 'hidden'}} >
      <Label 
        className=""
        disabled= {checkindatelabeldbd13?.isDisabled ? true : false}
        theme="normal"
        interactive={false}
      onClick = {handleClick}
      >
      Check In Date
      </Label>
    </div>
  )
}

 



///////////////
////////////

function TextInputcheckindate({lockedData,setLockedData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData,setIsProcessing}:any){
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
  const [dynamicStateandType,setDynamicStateandType]=useState<Record<string, any>>({name:'checkindate',type:"text"})
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
  const [bookinggroup685f1, setbookinggroup685f1]= useState<any>(null);
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= useState<any>(null);
  const [headline20c17, setheadline20c17]= useState<any>(null);
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e]= useState<any>(null);
  const [guestnamebe64b, setguestnamebe64b]= useState<any>(null);
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4]= useState<any>(null);
  const [roomtype98e13, setroomtype98e13]= useState<any>(null);
  const [checkindatelabeldbd13, setcheckindatelabeldbd13]= useState<any>(null);
  const [checkindate76a0c, setcheckindate76a0c]= useState<any>(null);
  const [book82d32, setbook82d32]= useState<any>(null);
  const [cancel1d281, setcancel1d281]= useState<any>(null);
  const [bookingtable4e8e9, setbookingtable4e8e9]= useState<any>(null);
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= useState<any>(null);
  

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
  const bookinggroup685f1Ref = useRef<any>(bookinggroup685f1);
  useEffect(() => { bookinggroup685f1Ref.current = bookinggroup685f1; }, [bookinggroup685f1]);
  if (checkindate76a0c?.isHidden) {
    return <></>
  }
  return (   
    <div  
      style={{gridColumn: '9 / 16',gridRow: '97 / 107', gap:'', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column'}} >
        {isRequredData && <span style={{ color: 'red' }}>*</span>}
      <div style={{ flex: 1, minHeight: 0 }}>
      <TextInput
        require={isRequredData}
        className=""
        label={keyset("checkindate")}
        onChange= {handleChange}
        onBlur={handleBlur}
        itsHaveCurrency={false}
        type={dynamicStateandType.type}
        value={bookinggroup685f1?.checkindate||""}
         disabled= {checkindate76a0c?.isDisabled ? true : false}
        pin='brick-brick'     
        placeholder='type here....'      
        view='normal'
        contentAlign={"left"}
      errorMessage={error}
        validationState={validate?.emp_v1?.checkindate ? "invalid" : undefined}
      />
      </div>
    </div> 
  )
}

 




    

function objectToQueryString(obj: any) {
}
 

function Buttonbook({ lockedData,setLockedData,primaryTableData, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData}: { lockedData:any,setLockedData:any,checkToAdd:any,setCheckToAdd:any,refetch:any,setRefetch:any,primaryTableData:any,setPrimaryTableData:any,encryptionFlagCompData:any,}){
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

  const [bookinggroup685f1, setbookinggroup685f1] = React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props] = React.useState<any>({});
  const [headline20c17, setheadline20c17] = React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e] = React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b] = React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4] = React.useState<any>({});
  const [roomtype98e13, setroomtype98e13] = React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13] = React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c] = React.useState<any>({});
  const [book82d32, setbook82d32] = React.useState<any>({});
  const [cancel1d281, setcancel1d281] = React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9] = React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props] = React.useState<any>({});
  //////////////
  const pendingAutoSearch = useRef(false);
  const preloadDone = useRef(false);
  // keep update group state in ref to access latest state value
  const bookinggroup685f1Ref = useRef(bookinggroup685f1);
  useEffect(() => {
    bookinggroup685f1Ref.current = bookinggroup685f1;
    if (!pendingAutoSearch.current) return;
      pendingAutoSearch.current = false;
      handleClick(false);
  }, [bookinggroup685f1]);
  
  //group props in ref to access latest props value
  const bookinggroup685f1PropsRef = useRef(bookinggroup685f1Props);
  useEffect(() => {
    bookinggroup685f1PropsRef.current = bookinggroup685f1Props;
  }, [bookinggroup685f1Props]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let customCode:any;
  const handleCustomCode=async () => {
    if (code != '') {
      let codeStates: any = {};
        codeStates['bookinggroup'] = bookinggroup685f1,
        codeStates['setbookinggroup'] = setbookinggroup685f1,
        codeStates['bookinggroup685f1'] = bookinggroup685f1Props,
        codeStates['setbookinggroup685f1'] = setbookinggroup685f1Props,
        codeStates['headline'] = headline20c17,
        codeStates['setheadline'] = setheadline20c17,
        codeStates['guestnamelabel'] = guestnamelabelf7e1e,
        codeStates['setguestnamelabel'] = setguestnamelabelf7e1e,
        codeStates['guestname'] = guestnamebe64b,
        codeStates['setguestname'] = setguestnamebe64b,
        codeStates['roomtypelabel'] = roomtypelabelf8eb4,
        codeStates['setroomtypelabel'] = setroomtypelabelf8eb4,
        codeStates['roomtype'] = roomtype98e13,
        codeStates['setroomtype'] = setroomtype98e13,
        codeStates['checkindatelabel'] = checkindatelabeldbd13,
        codeStates['setcheckindatelabel'] = setcheckindatelabeldbd13,
        codeStates['checkindate'] = checkindate76a0c,
        codeStates['setcheckindate'] = setcheckindate76a0c,
        codeStates['book'] = book82d32,
        codeStates['setbook'] = setbook82d32,
        codeStates['cancel'] = cancel1d281,
        codeStates['setcancel'] = setcancel1d281,
        codeStates['bookingtable'] = bookingtable4e8e9,
        codeStates['setbookingtable'] = setbookingtable4e8e9,
        codeStates['bookingtable4e8e9'] = bookingtable4e8e9Props,
        codeStates['setbookingtable4e8e9'] = setbookingtable4e8e9Props,
      codeStates['response']  = savedData.current;
      customCode = codeExecution(code,codeStates);
      return customCode;
    }
  }
  const {emp_v1, setemp_v1} = React.useState<any>({});
  const handleMapper=async (data?:any) => {
    try{     
      data = {...bookinggroup685f1Ref.current,...data};
      let parentRowSpan = 136;
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


 if (book82d32?.isHidden) {
    return <></>
  }

  return (
    <div
      style={{gridColumn: '9 / 11',gridRow: '119 / 135', gap:'', height: '100%', overflow: 'auto'}} 
 >
        {showFlag && <Button 
          ref={buttonRef}
          className=""
          onClick={handleClick}
          view='action'
          disabled= {book82d32?.isDisabled ? true : false}
          pin='circle-circle'
          contentAlign={"center"}
        >
          {keyset("book")}
        </Button>}
      </div>
    
  )
}



 




    

function objectToQueryString(obj: any) {
}
 

function Buttoncancel({ lockedData,setLockedData,primaryTableData, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,encryptionFlagCompData}: { lockedData:any,setLockedData:any,checkToAdd:any,setCheckToAdd:any,refetch:any,setRefetch:any,primaryTableData:any,setPrimaryTableData:any,encryptionFlagCompData:any,}){
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

  const [bookinggroup685f1, setbookinggroup685f1] = React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props] = React.useState<any>({});
  const [headline20c17, setheadline20c17] = React.useState<any>({});
  const [guestnamelabelf7e1e, setguestnamelabelf7e1e] = React.useState<any>({});
  const [guestnamebe64b, setguestnamebe64b] = React.useState<any>({});
  const [roomtypelabelf8eb4, setroomtypelabelf8eb4] = React.useState<any>({});
  const [roomtype98e13, setroomtype98e13] = React.useState<any>({});
  const [checkindatelabeldbd13, setcheckindatelabeldbd13] = React.useState<any>({});
  const [checkindate76a0c, setcheckindate76a0c] = React.useState<any>({});
  const [book82d32, setbook82d32] = React.useState<any>({});
  const [cancel1d281, setcancel1d281] = React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9] = React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props] = React.useState<any>({});
  //////////////
  const pendingAutoSearch = useRef(false);
  const preloadDone = useRef(false);
  // keep update group state in ref to access latest state value
  const bookinggroup685f1Ref = useRef(bookinggroup685f1);
  useEffect(() => {
    bookinggroup685f1Ref.current = bookinggroup685f1;
    if (!pendingAutoSearch.current) return;
      pendingAutoSearch.current = false;
      handleClick(false);
  }, [bookinggroup685f1]);
  
  //group props in ref to access latest props value
  const bookinggroup685f1PropsRef = useRef(bookinggroup685f1Props);
  useEffect(() => {
    bookinggroup685f1PropsRef.current = bookinggroup685f1Props;
  }, [bookinggroup685f1Props]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let customCode:any;
  const handleCustomCode=async () => {
    if (code != '') {
      let codeStates: any = {};
        codeStates['bookinggroup'] = bookinggroup685f1,
        codeStates['setbookinggroup'] = setbookinggroup685f1,
        codeStates['bookinggroup685f1'] = bookinggroup685f1Props,
        codeStates['setbookinggroup685f1'] = setbookinggroup685f1Props,
        codeStates['headline'] = headline20c17,
        codeStates['setheadline'] = setheadline20c17,
        codeStates['guestnamelabel'] = guestnamelabelf7e1e,
        codeStates['setguestnamelabel'] = setguestnamelabelf7e1e,
        codeStates['guestname'] = guestnamebe64b,
        codeStates['setguestname'] = setguestnamebe64b,
        codeStates['roomtypelabel'] = roomtypelabelf8eb4,
        codeStates['setroomtypelabel'] = setroomtypelabelf8eb4,
        codeStates['roomtype'] = roomtype98e13,
        codeStates['setroomtype'] = setroomtype98e13,
        codeStates['checkindatelabel'] = checkindatelabeldbd13,
        codeStates['setcheckindatelabel'] = setcheckindatelabeldbd13,
        codeStates['checkindate'] = checkindate76a0c,
        codeStates['setcheckindate'] = setcheckindate76a0c,
        codeStates['book'] = book82d32,
        codeStates['setbook'] = setbook82d32,
        codeStates['cancel'] = cancel1d281,
        codeStates['setcancel'] = setcancel1d281,
        codeStates['bookingtable'] = bookingtable4e8e9,
        codeStates['setbookingtable'] = setbookingtable4e8e9,
        codeStates['bookingtable4e8e9'] = bookingtable4e8e9Props,
        codeStates['setbookingtable4e8e9'] = setbookingtable4e8e9Props,
      codeStates['response']  = savedData.current;
      customCode = codeExecution(code,codeStates);
      return customCode;
    }
  }
  const {emp_v1, setemp_v1} = React.useState<any>({});
  const handleMapper=async (data?:any) => {
    try{     
      data = {...bookinggroup685f1Ref.current,...data};
      let parentRowSpan = 136;
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


 if (cancel1d281?.isHidden) {
    return <></>
  }

  return (
    <div
      style={{gridColumn: '14 / 16',gridRow: '119 / 135', gap:'', height: '100%', overflow: 'auto'}} 
 >
        {showFlag && <Button 
          ref={buttonRef}
          className=""
          onClick={handleClick}
          view='action'
          disabled= {cancel1d281?.isDisabled ? true : false}
          pin='circle-circle'
          contentAlign={"center"}
        >
          {keyset("cancel")}
        </Button>}
      </div>
    
  )
}



 








function Groupbookingtable({lockedData={},setLockedData,tableData=[],setTableData,primaryTableData={}, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch,setRefetch,paginationDetails,encryptionFlagPageData, nodeData, setNodeData,isFormOpen=false}:any){
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
  const securityData:any={
  "emplyoee": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  },
  "Template": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  },
  "user": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "allowedGroups": [],
    "blockedControls": [],
    "readOnlyControls": [],
    "blockedGroups": []
  }
};
  const ruleData:any={};
  const prevRefreshRef = useRef(false);
  const handleOnloadCalledRef = useRef(false);
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
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});   
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});   
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});   
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});   
  const [guestname960a0, setguestname960a0]= React.useState<any>({});   
  const [roomtype2f091, setroomtype2f091]= React.useState<any>({});   
  const [checkindate03aac, setcheckindate03aac]= React.useState<any>({});   
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
  const bookingtable4e8e9Ref = useRef<any>(null);
  const handleClearSearch = () => {
    bookingtable4e8e9Ref.current?.setSearchParams();
    bookingtable4e8e9Ref.current?.handleSearch({});
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
        gridRow: '141 / 269',
        overflow: 'visible',
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
          setemp_v1((pre:any)=>({...pre,_selectedGroup_:"bookingtable"}))
        }}
    >
      <div className='flex flex-col h-full w-full min-w-0 overflow-auto'>
        <div className='flex flex-1 w-full min-h-0'>
       {<Tablebookingtable headerButtonsRenders={renderBUttons}
        tableData={tableData} setTableData={setTableData} lockedData={lockedData} setLockedData={setLockedData}  primaryTableData={primaryTableData} setPrimaryTableData={setPrimaryTableData}  refetch={refetch} setRefetch={setRefetch} encryptionFlagCompData={encryptionFlagCompData} paginationDetails={paginationDetails} open={open} setOpen={setOpen} ref={bookingtable4e8e9Ref} ButtonGoRuleData={ButtonGoRuleData} setButtonGoRuleData ={setButtonGoRuleData} setIsProcessing={setIsProcessing}/>}
      </div>
      </div>
    </div>
 )
}

 
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
function Tablebookingtable({headerButtonsRenders=()=>{return<></>},headerPosition="",headerText="",lockedData,setLockedData,primaryTableData, setPrimaryTableData,checkToAdd,setCheckToAdd,refetch, setRefetch,setData,encryptionFlagCompData,paginationDetails,open, setOpen, ref, ButtonGoRuleData, setButtonGoRuleData}: any){
  const {globalState , setGlobalState} = React.useState<any>({});
  const tableName = "bookingtable"
  const {validate , setValidate} = React.useState<any>({});
  const {validateRefetch , setValidateRefetch} = React.useState<any>({});
  const {refresh, setRefresh} = React.useState<boolean>(false);
  const {memoryVariables, setMemoryVariables} = React.useState<any>({});
  const {accessProfile, setAccessProfile} = React.useState<any>({});
  const [disable,setDisable] = useState(false);
  let colourIndicatorCols:any= [] ;
  let defaultColumns = [
  {
    "id": "guestname",
    "nodeid": "218c7b426bee4875baee5cd2e88960a0",
    "name": "guestname",
    "meta": {
      "sort": true
    },
    "className": "",
    "align": "left",
    "hide": false,
    "isSearch": false,
    "colourIndicator": []
  },
  {
    "id": "roomtype",
    "nodeid": "92ee0911894346cbb9dbb08f4332f091",
    "name": "roomtype",
    "meta": {
      "sort": true
    },
    "className": "",
    "align": "left",
    "hide": false,
    "isSearch": false,
    "colourIndicator": []
  },
  {
    "id": "checkindate",
    "nodeid": "fb698f0076f84213b5694781a6203aac",
    "name": "checkindate",
    "meta": {
      "sort": true
    },
    "className": "",
    "align": "left",
    "hide": false,
    "isSearch": false,
    "colourIndicator": []
  }
] ;
  for (let i = 0; i < defaultColumns.length; i++) {
    defaultColumns[i].id = defaultColumns[i].id.toLowerCase();
  }

  //////////


// Separate component for row actions to avoid hooks violations
const RowActionComponent = React.memo(({index, allData, setRefetch, encryptionFlagCompData,security=[]}: any) => {
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const popoverButtonElement = useRef(null);
  let filteredData: any = {};
  if (allData.length !== 0) {
    filteredData = allData[index] || {};
  }
  function handlePopupData() {
    return (
      <div className='flex flex-col gap-1'>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <Button ref={popoverButtonElement}  view='flat' pin="round-round" className="text-lg flex h-full !w-5 " onClick={() => setPopoverOpen(true)}><Icon data={"RxDotsVertical"} size={20} fillContainer={false}/></Button>
      <Popup
        anchorRef={popoverButtonElement}
        open={isPopoverOpen}
        onClose={() => setPopoverOpen(false)}
        disablePortal={false}
        placement='right'
        className='w-[11vw]'
      >
        {handlePopupData()}
      </Popup>
    </div>
  );
});
RowActionComponent.displayName = 'RowActionComponent';






  ///////////
  function inferFakerValue(column: any) {
  const id = column.id.toLowerCase();

  // 🎨 If colourIndicator is defined — choose a random key
  if (column.colourIndicator?.length) {
    const randomStatus = faker.helpers.arrayElement(column.colourIndicator);
    return randomStatus.key;
  }

  // 💬 Text fields
  if (id.includes('name') || id.includes('title')) return faker.commerce.productName();

  // 💰 Amount / total
  if (id.includes('amount') || id.includes('total') || id.includes('price'))
    return faker.finance.amount({ min: 100, max: 5000, dec: 2 });

  // 📅 Date or formatted date
  if (id.includes('date') || id.includes('time'))
    return faker.date.recent({ days: 30 }).toISOString().split('T')[0];

  // 🔢 Numbers / counts
  if (id.includes('count') || id.includes('num') || id.includes('id'))
    return faker.number.int({ min: 1, max: 1000 });

  // ✅ Booleans / status flags
  if (id.startsWith('is_') || id.includes('flag'))
    return faker.datatype.boolean();

  // 🧾 Default fallback
  return faker.lorem.word();
}

// Generate a single record
function generateMockRecord(schema: any[]) {
  const record: Record<string, any> = {};
  schema.forEach((col) => {
    record[col.id] = inferFakerValue(col);
  });
  return record;
}

// Generate multiple records
function generateMockData(schema: any[], count = 70) {
  return Array.from({ length: count }, () => generateMockRecord(schema));
}

let mockData = generateMockData(defaultColumns);
  const [translatedColumns,setTranslatedColumns]= useState<any>([])
  const securityData:any={
  "emplyoee": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "blockedControls": [],
    "readOnlyControls": []
  },
  "Template": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "blockedControls": [],
    "readOnlyControls": []
  },
  "user": {
    "allowedControls": [
      "guestname",
      "roomtype",
      "checkindate"
    ],
    "blockedControls": [],
    "readOnlyControls": []
  }
}
  const encryptionFlagCont: boolean = encryptionFlagCompData?.flag || false ;
  let encryptionDpd: string = "";
  encryptionDpd = encryptionDpd !=='' ? encryptionDpd: encryptionFlagCompData?.dpd
  let encryptionMethod: string = "";
  encryptionMethod  = encryptionMethod !=='' ? encryptionMethod: encryptionFlagCompData?.method
  const upId: string | any = getCookie('upId')
  let dfKey: string | any
  let dfdType : string | any
  const toast =useInfoMsg()
  const [columns,setColumns]=useState<any>([])
    let orgDetails:any={}
  const [allCode, setAllCode] = React.useState(orgDetails?.code);
  const [paginationData, setPaginationData] = React.useState({
    page: 0,
    pageSize: 0,
    total: 0,
  })
  const routes = useRouter()
  const prevRefreshRef = useRef(false);
  const refreshInitRef = useRef(false);
  const prevSearchFilterRef = useRef("");
  const prevFilterPayloadRef = useRef("");
  const skipNextFilterPropsRef = useRef(false);
  const fetchDataAbortRef = useRef<AbortController | null>(null);
  const lastLockedDataRef = useRef<any>(null);
  const skipUnlockRef = useRef(false)
  const lockedDataRef = useRef(lockedData)
  const myLockedIdsRef = useRef<any[]>([])
  const [loading, setLoading]= useState<boolean>(false)
  const [allData, setAllData] = React.useState<any>([]);
  const [allDataObject, setAllDataObject] = React.useState<any>([]);
  const [showProfileAsModalOpen, setShowProfileAsModalOpen] = React.useState(false);
  const [showElementAsPopupOpen, setShowElementAsPopupOpen] = React.useState(false);
  const [assetDataReady, setAssetDataReady] = React.useState<boolean>(false);
  const [searchFilterFlag, setSearchFilterFlag] = useState(false);
  const keyset:any=i18n.keyset("language") 
  const [needLockingAndRule, setNeedLockingAndRule] = useState<any>({
    lockMode: 'Single',
    ttl: ''
  })
  const [DFkeyAndRule, setDFkeyAndRule] = React.useState({
    isRulePresent:false,
    dfKey:"",
    dfdType:""
  })
 /////////////
   //another screen
  const [bookinggroup685f1, setbookinggroup685f1]= React.useState<any>({});
  const [bookinggroup685f1Props, setbookinggroup685f1Props]= React.useState<any>({});
  const [bookingtable4e8e9, setbookingtable4e8e9]= React.useState<any>({});
  const [bookingtable4e8e9Props, setbookingtable4e8e9Props]= React.useState<any>({});
  const [guestname960a0, setguestname960a0]= React.useState<any>({});
  const [roomtype2f091, setroomtype2f091]= React.useState<any>({});
  const [checkindate03aac, setcheckindate03aac]= React.useState<any>({});
  //////////////
  const [goruleData,setGoruleData]=useState<any>({})
  function getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  // Utility to get nested value
  function getValueByPathForNested(obj: any, path: string): any {
    const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.');
    return keys.reduce((acc, key) => acc?.[key], obj);
  }

  // Clean the mapper path
  function extractPath(sourcekey: string): string {
    const rawPath = sourcekey.split('|').pop() ?? '';
    // remove items.properties. since your actual data has direct keys
    return rawPath
      .replace(/items\.properties\./g, '')
      .replace(/items\./g, '')
      .replace(/properties\./g, '');
  }
    function getColumnTypeFromSchema(schemaNode: any, columnId: string): string {
    const nodeType = schemaNode?.nodeType;
    const schema = schemaNode?.schema;

    if (!schema || !columnId) return 'string';

    if (nodeType === 'datasetnode' || nodeType === 'datasetschemanode') {
      if (schema?.type === 'object') {
        return schema?.properties?.[columnId]?.type || 'string';
      } else if (schema?.type === 'array') {
        return schema?.items?.properties?.[columnId]?.type || 'string';
      }
    } else if (nodeType === 'apinode') {
      const responseSchema = schema?.responses?.["200"]?.content?.["application/json"]?.schema;
      if (responseSchema?.type === 'object') {
        return responseSchema?.properties?.[columnId]?.type || 'string';
      } else if (responseSchema?.type === 'array') {
        return responseSchema?.items?.properties?.[columnId]?.type || 'string';
      }
    } else if (nodeType === 'dbnode') {
      if (Array.isArray(schema)) {
        const col = schema.find((c: any) => c.name === columnId);
        return col?.type || 'string';
      }
    }

    return 'string';
  }

  function formatNumberWithCommas(value: any): string | any {
    if (value === null || value === undefined || value === '') return value;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || !isFinite(num)) return value;
    if (typeof value === 'string' && !/^-?\d+(\.\d+)?$/.test(value.trim())) return value;
    return num.toLocaleString('en-US');
  }
  const GetTableDetails = async () => {
    mapperData = [];
    schemaDataDFO = {};
    mappperNodeId = "";
    setGoruleData(goRuleData ||{})
    let schemaData:any = {}
    if(schemaDataDFO  && mappperNodeId){
      schemaDataDFO?.map((ele:any)=>{
        if(ele.nodeId==mappperNodeId){
          if (ele?.nodeType == 'datasetnode' || ele?.nodeType == 'datasetschemanode'){
          if (ele?.schema?.type == "object") {
              schemaData = ele?.schema?.properties;
          }else if (ele?.schema?.type == "array") {
              schemaData = ele?.schema?.items?.properties;
          }                            
          }else if (ele?.nodeType == 'apinode') {
          if (ele?.schema?.responses["200"].content["application/json"].schema?.type == "object") {
              schemaData = ele?.schema?.responses["200"].content["application/json"].schema?.properties;
          }else if (ele?.schema?.responses["200"].content["application/json"].schema?.type == "array") {
              schemaData = ele?.schema?.responses["200"].content["application/json"].schema?.items?.properties;
          }
          }else if (ele?.nodeType == 'dbnode') {
          let temp:any = {}
          if (Array.isArray(ele?.schema)) {
          ele?.schema.map((cols:any)=>{
              temp[cols.name]={type:cols.type}
          })
          }
          schemaData = temp;
          } 
        }
      })
    }
    let altertColumns:any=[];
    let allowesColumns:any=[];
    defaultColumns.map((cols:any)=>{
      let temp:any = cols
      {
        if(!(accessProfile in securityData) || !securityData[accessProfile]?.blockedControls?.includes(cols.id))
        {
          allowesColumns.push(temp)
        }
      }
    })
    setColumns(allowesColumns); 
    for (let i = 0; i < allowesColumns.length; i++) {
      for (let j = 0; j < mapperData.length; j++) {
        if (allowesColumns[i].id === mapperData[j]?.elementname.toLowerCase()) {
          let nodeId = mapperData[j]?.sourcekey.split("|")[1];
          let path = mapperData[j]?.sourcekey.split("|")[2];
          for (let k = 0; k < schemaDataDFO.length; k++) {
            if (schemaDataDFO[k].nodeId === nodeId) {                    
              const columnType = getColumnTypeFromSchema(schemaDataDFO[k], allowesColumns[i].id);
              altertColumns.push({...allowesColumns[i], type: columnType})
            }                 
          }
        }
      }
      if(allowesColumns[i].type== '__ActionDetails__')
      {
        altertColumns.push(allowesColumns[i])
      }            
    }
          // allowesColumns.map((defaultRenderItem:any)=>{
          //   if(defaultRenderItem.id in schemaData)
          //   {
          //     altertColumns.push({...defaultRenderItem,type:schemaData[defaultRenderItem.id].type || 'string'})
          //   }
          // })
    const translatedColumnsData = altertColumns.map((col:any) => ({
      ...col,
      name: keyset(col?.name), 
      }));
    setTranslatedColumns(translatedColumnsData)
    // for pagination data page ,count and dfkey
    setPaginationData((pre: any) => ({
      ...pre,
      page: 0,
      pageSize: 0
    }))

    setDFkeyAndRule((pre:any)=>({
      ...pre,
        isRulePresent:false,
        dfKey:"",
        dfdType:""
    }))

    dfKey = ""
    dfdType =""
  }

  const [SearchParams,setSearchParams] = useState<any>({})

  const latestLockStateRef = useRef({ needLockingAndRule, lockedData, allData, bookingtable4e8e9 })
  useEffect(() => {
    latestLockStateRef.current = { needLockingAndRule, lockedData, allData, bookingtable4e8e9 }
  })

    const setLockMode=async(ids:any)=>{
    const { needLockingAndRule, lockedData, allData, bookingtable4e8e9 } = latestLockStateRef.current
    /// setbookingtable4e8e9Props
    let postIds: any = []
    let processIds: any = []
    let selectedData:any=[];
    if(needLockingAndRule.lockMode=='Single'){
      // its for ui level selected list show for single select
      if (ids.length == 0) {
        setLockedData({
      ...lockedData,
      processIds: processIds,
      data:selectedData,
      primaryKeys: [],
      lockMode: needLockingAndRule,
      ttl: needLockingAndRule.ttl
    })
        lastLockedDataRef.current = { primaryKeys: [] }
        myLockedIdsRef.current = []
        lockedDataRef.current = { primaryKeys: [] }
        let keys:any
        setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:[]}))
        setLockedData((pre:any)=>({...pre,data:[]}))
        return
      }

      bookingtable4e8e9.filter((item:any,id:number)=>{
        if (ids.at(-1)==item.id){
          selectedData?.push(allData[id])
          postIds.push(item.id)
          processIds.push(item?.trs_process_id)
        }
      })

        let index = Number(ids[ids.length - 1])
        let row:any = {}
        allData?.map((data:any,i:any)=>{
          if(data?.id==ids[ids.length - 1])
          {
            index=i
            row=data
          }
        })

      //////////
      //////////
      setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:[ids[ids.length-1]]}))
    }
    else if(needLockingAndRule.lockMode==='Multi'){
      // its for ui level selected list show for multi select
      bookingtable4e8e9.filter((item:any,id:number)=>{
        if (ids.includes(item.id)){
          selectedData?.push(item)
          postIds.push(item.id) 
          processIds.push(item?.trs_process_id)
        } 
      })
      let index = Number(ids[ids.length - 1])
        let row:any = {}
        allData?.map((data:any,i:any)=>{
          if(data?.id==ids[ids.length - 1])
          {
            index=i
            row=data
          }
        })

      setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:ids}))
      if(ids?.length>0)
      {
                  }
    }
    let index = Number(ids[ids.length - 1])
      let row:any = {}
      allData?.map((data:any,i:any)=>{
        if(data?.id==ids[ids.length - 1])
        {
          index=i
          row=data
        }
      })
    let checkedData: any = selectedPaginationData
    if (checkedData.length) {
      let itsAlreadyThere: boolean = false
      selectedPaginationData.map((item: any) => {
        if (item.page == paginationData.page) {
          itsAlreadyThere = true
        }
      })
      if (itsAlreadyThere) {
        for (let i = 0; i < checkedData.length; i++) {
          if (checkedData[i].page == paginationData.page) {
            checkedData[i].data = ids
            break
          }
        }
      } else {
        checkedData = [
          ...checkedData,
          {
            page: paginationData.page,
            data: ids
          }
        ]
      }
    } else {
      checkedData.push({
        page: paginationData.page,
        data: ids
      })
    }
    setSelectedPaginationData(checkedData)

    setLockedData({
      ...lockedData,
      processIds: processIds,
      data:selectedData,
      primaryKeys: postIds,
      lockMode: needLockingAndRule,
      ttl: needLockingAndRule.ttl,
      selectedData:selectedData
    })
    lastLockedDataRef.current = { primaryKeys: postIds }
    myLockedIdsRef.current = postIds
    lockedDataRef.current = { primaryKeys: postIds }

    let customCode:any=""
    if (allCode != '') {
      let codeStates: any = {};
        codeStates['bookinggroup'] = bookinggroup685f1,
        codeStates['setbookinggroup'] = setbookinggroup685f1,
        codeStates['bookinggroup685f1'] = bookinggroup685f1Props,
        codeStates['setbookinggroup685f1'] = setbookinggroup685f1Props,
        codeStates['bookingtable'] = bookingtable4e8e9,
        codeStates['setbookingtable'] = setbookingtable4e8e9,
        codeStates['bookingtable4e8e9'] = bookingtable4e8e9Props,
        codeStates['setbookingtable4e8e9'] = setbookingtable4e8e9Props,
        codeStates['guestname'] = guestname960a0,
        codeStates['setguestname'] = setguestname960a0,
        codeStates['roomtype'] = roomtype2f091,
        codeStates['setroomtype'] = setroomtype2f091,
        codeStates['checkindate'] = checkindate03aac,
        codeStates['setcheckindate'] = setcheckindate03aac,
      customCode = codeExecution(allCode,codeStates);
      return customCode;
    }

  }
  const [selectedPaginationData, setSelectedPaginationData] = useState<any[]>(
      []
    )
  const [settings, setSettings] = useState<any>();
  const handleUpdate = (page:any, pageSize:any) =>{
    let searchParams:any = nullFilter(SearchParams);
    setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:[]}))
    let checkedData: any = selectedPaginationData
    if (checkedData.length) {
      for (let i = 0; i < checkedData.length; i++) {
        if (checkedData[i].page == page) {
          setbookingtable4e8e9Props((pre:any)=>({...pre, selectedIds:checkedData[i].data}))
        }
      }
    }
    setPaginationData(prevState => ({ ...prevState, page, pageSize }))
    fetchData(page, pageSize,searchParams,DFkeyAndRule,DFkeyAndRule?.isRulePresent,false,filterPropsData,filterPropsData?true:false)
  }

  async function fetchData(page:any = 1, pageSize:any = 10, searchParams = {},dfKey:any,isRulePresent:any=false,isOnLoad = false,filterProps?:any,itsFromRefreshHandler:any=false,sortingDetails:any={}){
  }
////////////////////////////////
  const RowAction = async({item,index,nodeName}: any) => {
    let filteredData:any={}
    if(allData.length!=0)
    {
      let index =-1
      let row:any = {}
      allData?.map((data:any,i:any)=>{
        if(data?.id==item?.id)
        {
          index=i
          row=data
        }
      })
      filteredData=flattenKeepInner(allData[index]||{})
    }
  };

////////////////////////
 const colurIndicator = (keyValue:any=[], comingValue:any, indicatorType?:string) => {
    // Default colors: green, red, orange
    const defaultColors = ['#22c55e', '#ef4444', '#f97316'];

    let customeUI: JSX.Element | null = null;

    // Normalize the incoming value for comparison
    const normalizedComingValue = String(comingValue).trim();

    // Find matching configuration
    for (let i = 0; i < keyValue.length; i++) {
      const normalizedKey = String(keyValue[i]?.key || '').trim();

      if (normalizedKey === normalizedComingValue) {
        // Use configured color or color based on index
        const backgroundColor = keyValue[i]?.colorCode || defaultColors[i % defaultColors.length];
        const icon = keyValue[i]?.icon;

        if (indicatorType === 'rounded') {
            customeUI = (
              <div 
              className="flex rounded-full aspect-square h-5 w-5 justify-center items-center shrink-0"
              style={{ backgroundColor }}>
              </div>
            );
        } else if (indicatorType === 'rectangle') {
          // For rectangle type, show colored background with icon or text
          customeUI = (
            <div
              className="flex h-full p-2 justify-center w-[20%]"
              style={{ backgroundColor }}
            >
              {icon && icon.trim() !== '' ? (
                <Icon data={icon} size={20} fillContainer={false}/>
              ) : (
                comingValue
              )}
            </div>
          );
        } else {
          // Default: show colored background with icon or text
          customeUI = (
              <div 
              className="flex rounded-full aspect-square h-5 w-5 justify-center items-center shrink-0"
              style={{ backgroundColor }}>
              </div>
            );
        }
        break;
      }
    }
    if(!customeUI)
    {
      return comingValue
    }

    return customeUI;
  };


  async function UpdatedDataHandle(filterProps?: any) { 
  }
  


  const handlePrimaryTable = () => {
    let findData = bookingtable4e8e9Props?.selectedIds[bookingtable4e8e9Props?.selectedIds?.length-1]
    if(Array.isArray(bookingtable4e8e9) && bookingtable4e8e9.length>0)
    {
      let data = bookingtable4e8e9.find((data:any)=>(data?.id==findData))||{}
      setPrimaryTableData({
        ...primaryTableData,
        primaryKey: "id",
        value: data["id"],
        parentData: data
      })
    }
  }



  const handleAssetPageReady = () => {
    setAssetDataReady(true);
    setIsProcessing(false);
  }
  const handleOnRowClick=async(data?:any,ids?:any)=>{
  }

  function onButtonSecurityHandle(data: any) {
  }

 const bindPreviousAndNext=(currectIndex:any,forEvent:any,setData:string,parentTrigger:any="",currectPage:any)=>{
    if(currectPage!=paginationData?.page)
    {
    if(forEvent&&setData)
    {
      currectIndex=-1
      if(bookingtable4e8e9?.length==0)
      {
        eventBus.emit(parentTrigger, { message: "no data" });
        return
      }
      if(forEvent=="next"&&bookingtable4e8e9?.at((+currectIndex)+1))
      {
        const newIndex = (+currectIndex)+1;
        allState[setData](bookingtable4e8e9?.at(newIndex))
        eventBus.emit(parentTrigger, { index: newIndex, data: bookingtable4e8e9?.at(newIndex) ,currectPage:paginationData?.page});
        return newIndex
      }
      if(forEvent=="previous"&&((+currectIndex)-1)>=0&&bookingtable4e8e9?.at((+currectIndex)-1))
      {
        const newIndex = (+currectIndex)-1;
        allState[setData](bookingtable4e8e9?.at(newIndex))
        eventBus.emit(parentTrigger, { index: newIndex, data: bookingtable4e8e9?.at(newIndex) ,currectPage:paginationData?.page});
        return newIndex
      } 
    }
    }else{
    if(forEvent&&setData)
    {
      if(bookingtable4e8e9?.length==0)
      {
        eventBus.emit(parentTrigger, { message: "no data" });
        return
      }
      if(forEvent=="next"&&bookingtable4e8e9?.at((+currectIndex)+1))
      {
        const newIndex = (+currectIndex)+1;
        allState[setData](bookingtable4e8e9?.at(newIndex))
        eventBus.emit(parentTrigger, { index: newIndex, data: bookingtable4e8e9?.at(newIndex) ,currectPage:paginationData?.page});
        return newIndex
      }
      if(forEvent=="previous"&&((+currectIndex)-1)>=0&&bookingtable4e8e9?.at((+currectIndex)-1))
      {
        const newIndex = (+currectIndex)-1;
        allState[setData](bookingtable4e8e9?.at(newIndex))
        eventBus.emit(parentTrigger, { index: newIndex, data: bookingtable4e8e9?.at(newIndex) ,currectPage:paginationData?.page});
        return newIndex
      } 
    }
    }
    
  }
  //////
  ////
  if (bookingtable4e8e9?.isHidden) {
    return <></>
  }
  // Process data to apply color indicators
  const processedData = Array.isArray(mockData) ? mockData.map((row: any) => {
    const processedRow = { ...row };

    defaultColumns.forEach((col: any) => {
      if (col.isColourIndicator === true && Array.isArray(col.colourIndicator) && col.colourIndicator.length > 0) {
        const cellValue = row[col.id];
        if (cellValue !== undefined && cellValue !== null) {
          const indicator = colurIndicator(col.colourIndicator, cellValue, col.ColourIndicatorType);
          if (indicator !== null) {
            processedRow[col.id] = indicator;
          }
        }
      }
    });

    return processedRow;
  }) : [];
  return(
    <div className='w-full h-full'>
            <div className=' w-full h-full flex flex-row border-2'>
            <Table
              className=" width-[100%]"
              data={processedData}
              columns={defaultColumns}
              primaryKey="id"
              edgePadding={true}
              disable={disable}
              selectedIds={bookingtable4e8e9Props?.selectedIds}  
              onSelectionChange={setLockMode} 
              wordWrap={true}
              onRowClick={onButtonSecurityHandle}
            isRowclick={false}
            showPagination={true}
            pagination={{
              page:1,
              pageSize:10,
              pageSizeOptions:[5, 10, 20, 50, 100],
              total:processedData?.length ||1,
              onUpdate:(e:any)=>handleUpdate(e.page,e.pageSize)
            }}
            headerButtonsRenders={headerButtonsRenders()}
            headerText={headerText}
            headerPosition={headerPosition}
          />
          </div>
    </div>
  )
}



 }`
}
