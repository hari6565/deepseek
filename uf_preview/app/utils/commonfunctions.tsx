
'use client'
import { TotalContext, TotalContextProps } from "@/app/globalContext";
import { useContext } from "react";
import setSearchfilterEventDetails from "@/context/setSearchfilterEventDetails.json"
export function normalToDynamicArrayCopyFormData(copiedData:any,type:any,state:any,setState:any=()=>{})
{

    if(type=='object')
    {
        setState({...state,...copiedData})
    }else{

    }
}

export function useHandleGroupArrayCopyFormData(){
    const AllStates:any = useContext(TotalContext) as TotalContextProps;
    return(copiedData:any,type:any,arraygroupName:any)=>{
    }
}


export function flattenKeepInner(obj:any, result:any = {}) {
  for (let key in obj) {
    const value = obj[key];

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result[key] = value; // keep the parent key
      flattenKeepInner(value, result); // also spread inner keys
    } else {
      result[key] = value;
    }
  }
  return result;
}


export function clearSetSarchFilterData(
  data: any = [],
  nodeDetails: any[] = []
) {
  let nodeRecords = data || []
  let allSearchFilterData: any = setSearchfilterEventDetails || {}
  let groupIdsToApply: any[] = nodeDetails || []

  // Walk each groupId we were asked to apply.
  groupIdsToApply.forEach(groupId => {
    // Skip any groupId that has no matching rule set.
    if (!(groupId in allSearchFilterData)) return

    // A groupId can have more than one rule set; apply every one of them.
    allSearchFilterData[groupId].forEach((rule: any) => {
      // "key" isn't a nodeId, drop it so only nodeId entries remain below.
      delete rule.key
      // Every remaining key in the rule is a nodeId this rule targets.
      const nodeIdsInRule = Object.keys(rule)

      // Walk each nodeId this rule targets.
      nodeIdsInRule.forEach(nodeId => {
        // Find the node record that matches this nodeId.
        const record = nodeRecords.find((r: any) => r.nodeId === nodeId)
        // Skip if we have no record for this nodeId.
        if (!record) return

        // The keys inside rule[nodeId] are the property names to delete.
        const propertiesToRemove = Object.keys(rule[nodeId])
        // Delete each of those properties from the matching record.
        propertiesToRemove.forEach(propertyKey => {
          delete record[propertyKey]
        })
      })
    })
  })

  return nodeRecords
}
