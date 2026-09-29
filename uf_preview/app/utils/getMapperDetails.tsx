export async function getDropdownDetailsNew(
  dfData: any, 
  mapperValue: string, 
  mapperText: string, 
  bindtranValue: any, 
  code: any, 
  getSourceFilterColumn: string, 
  copySourceFilterColumn: string) {
    
  const findMatch = (val: any) => dfData.find((item: any) => Object.values(item).includes(val));

  if (dfData && mapperValue && !bindtranValue && !code) {
    return dfData.map((item: any) => item[mapperValue]);
  } else if (code && bindtranValue && copySourceFilterColumn) {
    return findMatch(bindtranValue)?.[copySourceFilterColumn];
  } else if (code && bindtranValue) {
    return findMatch(bindtranValue)?.[mapperText];
  } else if (code && getSourceFilterColumn) {
    return dfData.filter((item: any) => item[getSourceFilterColumn] === code).map((item: any) => item[mapperValue]);
  } else if (code) {
    return dfData.filter((item: any) => Object.values(item).includes(code)).map((item: any) => item[mapperValue]);
  } else if (bindtranValue && copySourceFilterColumn) {
    return findMatch(bindtranValue)?.[copySourceFilterColumn];
  } else if (bindtranValue) {
    return findMatch(bindtranValue)?.[mapperText];
  } else {
    return dfData.filter((item: any) => item[mapperValue] !== undefined).map((item: any) => item[mapperValue]);
  }
}
