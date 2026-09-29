//dropdown
export interface getMapperDetailsDto{
  ufkey?:string;
  componentId?:string;
  controlId?:string;
  category?:string;
  code?:any;
  bindtranValue?:any;
} 

//group,page
export interface uf_authorizationCheckDto{
    key:string;
    nodeId?:string;
    isTable?:boolean;
    screenNames?:string;
    accessProfile?:[];
    dpdKey?: string;
    method?:string;
}
  //table
export interface uf_fetchActionDetailsDto{
    key?:string;
    groupId?:string;
    controlId?:string;
  }
export interface uf_fetchRuleDetailsDto{
    key?:string;
    groupId?:string;
    controlId?:string;
  }
export interface te_refreshDto{
    key?:string;
    upId?:string;
    refreshFlag?: string;
    dpdKey?: string;
    method?:string;
    count?:number;
    page?:number;
    filterData?:any[];
  }
export interface api_paginationDto{
    key?:string;
    page?:number;
    count?:number;
    filterDetails?:any;
    searchFilter?:any
    dpdKey?:string;
    method?:string;
    filterData?:any[];
    sortingDetails?:any;
  }
export interface uf_paginationDataFilterDto{
    data?:any;
    key?:string;
    dfdType?:string;
    dpdKey?:string;
    method?:string;
    primaryKey?:string
  }
  //button
export interface uf_getPFDetailsDto{
  key?:string;
  groupId?:string;
  controlId?:string;
  isTable?:Boolean;
  accessProfile?:[];
}
export interface uf_initiatePfDto{
  dpdKey?:string;
  method?:string;
  key:string;
  sourceId:string;
}
export interface te_eventEmitterDto {
  dpdKey?:string;
  method?:string;
  data?:any;
  event?:string;
  sourceId?:string;
  url?:string;
  key?:any;
  breakPoint?:string;
  nodeId?:string;
  nodeName?:string;
  nodeType?:string;
  controlName?:string;
  upId?:string | string[];
  lock?:any;
  childTables?:string[];
  childTableData?:any[];
  ssKey?:string[];
  tableName?:string;
}
export interface uf_ifoDto{
  dpdKey?:string;
  method?:string;
  formData?:any;
  key?:string;
  groupId?:string;
  controlId?:string;
  isTable?:Boolean;
}

export interface te_updateDto{
  data?:any;
  key?:string;
  upId?:string;
  tableName?:string;
  primaryKey?:number[];
  lockDetails?:any;
  param?:string;
  url?:string;
}
//page
export interface te_peStreamDto{
    key:string;
    name:string;
    mode:string;
}

export interface te_dfDto{
    key:string;
  }

export interface TopContentProps {
    columns?: any;
    filterValue?: string;
    setRefetch?: any;
    setFilterValue?: any;
    setPage?: any;
    filterColumn?: string;
    setFilterColumn?: any;
    paginationData?:any;
    onSearch?:any;
  }

export interface api_signinDto {
    tenant: string;
    username: string;
    password: string;
    key?:string;
    ufClientType?:string
    app_tenant?:string
    app_tenant_id?:number
}

export interface api_screenRouteDto {
  keys:any[];
}

export interface ScreenDetail {
  name: string;
  key: string;
  label?: string;
  static?:boolean;
  icon?:string;
  restrictedAccessProfile:any;
}

export interface MenuItem {
  menuGroup?: string; // Optional since it's not always present
  menuGroupLabel: string;
  screenDetails: ScreenDetail[];
  items?: MenuItem[]; // Recursive definition to allow nesting
  icon?:string;
}
 
export type MenuStructure = MenuItem[];


