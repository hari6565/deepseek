import UOmapperData from '@/context/dfdmapperContolnames.json'


export function getRouteScreenDetails(key: string, artfactName: string,other:string=''): string {
  let assemblerKeys: any = [
  {
    "screenName": "dddd",
    "screensName": "dddd-v1",
    "ufKey": "CK:CT001:FNGK:AF:FNK:UF-UFW:CATK:TGW01:AFGK:TGW004:AFK:barchart:AFVK:v1"
  }
]

  let routeScreen: string = artfactName
  let isKeyInAssem:boolean=false

  assemblerKeys.forEach((item: any) => {
    if (item.ufKey == key) {
      routeScreen = item.screensName.replace('-v','_v')
      isKeyInAssem=true
    }
  })
  if(other!=''&&isKeyInAssem==false)
  {
    return 'not in assembler'
  }

  return routeScreen
}

export function getFilterProps(filterProps:any=[],mainData:any={}) {
  let result:any = [];  
  try{
  filterProps?.map((dfdData:any)=>{
    dfdData?.nodeBasedData?.map((nodes:any)=>{
      let filterObj:any = {}
      Object.keys(nodes?.object||{}).map((keys:any)=>{
        const mapperEntry = nodes?.object[keys]
        const mapperData = (UOmapperData as Record<string, any>)[mapperEntry]
        if (!mapperData) return
        const value = mainData[mapperData["source"]]
        if (value !== undefined) filterObj[keys] = value
      })
      result.push({
      DFDkey:dfdData.key,
      nodeId:nodes.nodeId,
      ...filterObj
    })
    }) 
  })
  return result;
}catch(e){
  console.log(e);
}
}

