export async function eventFunction(eventProperty: any) {
  let eventsDetails: any = [];
  const eventDetailsArray: any[] = [];
  let eventDetailsObj: any = {};
  function addEventDetailsArray(data:any) {
    let url:any="";
    let status:any="";
    let primaryKey:any="";
    let tableName:any="";
    let updateColumns:any;
    if (data?.length > 0) {
      data.forEach((item:any) => {
        if(item?.hlr){
          item?.hlr?.params?.forEach((param:any) =>{
            if(param?.name === "url"){
              url = param?.value
            }
            if(param?.name === "primaryKey"){
              primaryKey = param?.value
            }
            if(param?.name === "status"){
              status = param?.value
            }
            if(param?.name === "tableName"){
              tableName = param?.value
            }
            if(param.name === "Update Columns"){
              updateColumns = param.items
            }
          })
        }
        eventDetailsArray.push({
          id: item?.id,
          name: item?.name,
          type: item?.type,
          eventContext: item?.eventContext,
          targetKey: item?.targetKey,
          sequence: item?.sequence,
          key: item?.key,
          url: url,
          status: status,
          primaryKey: primaryKey,
          tableName: tableName||"",
          hlr: item?.hlr,
          updateColumns: updateColumns
        });
        if (item?.children?.length > 0) {
          addEventDetailsArray(item?.children);
        }
      });
    }
  }
  function addeventDetailsObj(data:any) {
    if (data.length > 0) {
      data.forEach((item:any) => {
        eventDetailsObj = {
          ...eventDetailsObj,
          [`${item.id}`]: {
            id: item.id,
            name: item.name,
            type: item.type,
            sequence: item.sequence,
          },
        };
        if (item.children?.length > 0) {
          addeventDetailsObj(item.children);
        }
      });
    }
  }
  addEventDetailsArray([{ ...eventProperty }]);
  addeventDetailsObj([{ ...eventProperty }]);
  eventsDetails.push(eventDetailsArray);
  eventsDetails.push(eventDetailsObj);
  return eventsDetails;
}

export function commonSepareteDataFromTheObject(path: string, data: any) {
  return path.split(".").reduce((acc, key) => {
    // Split segment like "data[0]" into ["data", "[0]", ""]
    const cleanKey = key.replace(/\?\.?/g, "");
    if (!cleanKey) return acc;
    const parts = cleanKey.split(/(\[\d+\])/);
    return parts.reduce((innerAcc, part) => {
      if (!part) return innerAcc;
      const arrayIndex = part.match(/^\[(\d+)\]$/);
      return arrayIndex ? innerAcc?.[Number(arrayIndex[1])] : innerAcc?.[part];
    }, acc);
  }, data);
}


export function filterByKeys<T extends Record<string, unknown>>(
  data: T,
  keys: string[],
  caseInsensitive = false
): Partial<T> {
  const keySet = caseInsensitive
    ? new Set(keys.map((k) => k.toLowerCase()))
    : new Set(keys);

  return Object.fromEntries(
    Object.entries(data).filter(([key]) =>
      caseInsensitive ? keySet.has(key.toLowerCase()) : keySet.has(key)
    )
  ) as Partial<T>;
}