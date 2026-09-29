import { getData } from "../redis/utils/redisFunction";
import evaluateDecisionTable from './evaluateDecisionTable'

/**
 * Retrieves schema values from dynamic input data based on user context
 * Matches both the key field AND condition value against the user context
 *
 * @param userContext - User context object containing fields like psName, orgName, etc.
 * @param data - The dynamic input data structure (similar to sampleData.json)
 * @returns Object containing matched schemas grouped by condition, or null if no match found
 *
 * @example
 * // If userContext.psName = "RemiFast", only returns schemas where:
 * // - key.value = "psName" (exists in userContext)
 * // - condition.value = "RemiFast" (matches userContext.psName)
 */
export async function getSchemaByKeyAndCondition(
  userContext: UserContext,
  data: any,
  goruleData:any = {},
  groupData:any = {}
): Promise<Record<string, any> | null> {
 let mainRuleKey: any = ''
  if (
    goruleData != null &&
    Object.keys(goruleData).length !== 0 &&
    goruleData?.nodes
  ) {
    let isCheckedByGorule: any =
      evaluateDecisionTable(goruleData?.nodes, groupData, userContext) || false
    if (
      'output' in isCheckedByGorule &&
      isCheckedByGorule['output'].includes(':NDP')
    ) {
      mainRuleKey = isCheckedByGorule['output']
    }
  }
  // Validate input
  let res

  if (mainRuleKey != '') {
    // Fetch data from Redis using the schemaValue as key
    const redisData = await getData(mainRuleKey, 'ReJSON-RL')
    let pfRuleData: any = {}
    Object.keys(redisData)?.map(eachKey => {
      if (redisData[eachKey]?.json) {
        pfRuleData = redisData[eachKey]?.json
      }
    })

    return pfRuleData || {}
  }

  if (!userContext || typeof userContext !== 'object') {
    console.error('User context is required and must be an object');
    return null;
  }

  if (!data || !data.items || !Array.isArray(data.items)) {
    console.error('Invalid data structure: expected data.items to be an array');
    return null;
  }

  const result: Record<string, any> = {};

  // Search through items to find matching keys and conditions from user context
  for (const item of data.items) {
    if (!item.key || !item.value) {
      continue;
    }

    const keyFieldName = item.key.value; // e.g., "psName"

    // If keyFieldName is "all", directly fetch schema without condition checking
    if(keyFieldName === 'all'){
      // Check if value has items array
      if (!item.value.items || !Array.isArray(item.value.items)) {
        continue;
      }

      // Get the first schema item directly without condition matching
      for (const valueItem of item.value.items) {
        if (!valueItem.schema) {
          continue;
        }

        const schemaValue = valueItem.schema.value;
        if (schemaValue) {
          // Fetch data from Redis using the schemaValue as key
          const redisData = await getData(schemaValue, 'ReJSON-RL');
          const conditionValue = valueItem.condition?.value || 'all';
          result[conditionValue] = redisData;
          let nodeID:any = Object.values(redisData)[0];
          res = nodeID?.json;
          break; // Take the first schema and exit
        }
      }
      continue; // Move to next item
    }
else{
    // Check if the key field exists in user context
    if (!(keyFieldName in userContext)) {
      continue;
    }

    const userContextValue = userContext[keyFieldName]; // e.g., "RemiFast"

    // Check if value has items array
    if (!item.value.items || !Array.isArray(item.value.items)) {
      continue;
    }

    // Only collect schemas where condition matches the user context value
    for (const valueItem of item.value.items) {
      if (!valueItem.condition || !valueItem.schema) {
        continue;
      }

      const conditionValue = valueItem.condition.value; // e.g., "RemiFast" or "Torus"
      const schemaValue = valueItem.schema.value;

      // Match condition value with user context value for this key
      if (conditionValue === userContextValue && schemaValue) {
        // Fetch data from Redis using the schemaValue as key
        const redisData = await getData(schemaValue, 'ReJSON-RL');
        result[conditionValue] = redisData;
        let nodeID:any = Object.values(redisData)[0];
        res =  nodeID?.json;
      }
    }}
  }

  // Return null if no schemas found
  if (Object.keys(result).length === 0) {
    console.warn('No schemas found for the provided user context');
    return null;
  }
  
  return res;
}

/**
 * Retrieves a specific schema based on user context and condition
 *
 * @param userContext - User context object containing psName and other user details
 * @param data - The dynamic input data structure (similar to sampleData.json)
 * @param conditionValue - The specific condition to filter by (e.g., "RTP", "FEDNOW")
 * @returns The schema value for the specified condition, or null if not found
 */
export async function getSchemaByCondition(
  userContext: UserContext,
  data: any,
  conditionValue: string
): Promise<any | null> {
  const allSchemas = await getSchemaByKeyAndCondition(userContext, data);

  if (!allSchemas) {
    return null;
  }

  return allSchemas[conditionValue] || null;
}

/**
 * Type-safe version with interface definitions
 *
 * @param userContext - User context object
 * @param data - The dynamic input data structure
 * @returns Object containing all schemas grouped by condition
 */
export async function getSchemaByKeyAndConditionTyped<T = any>(
  userContext: UserContext,
  data: DynamicInputData
): Promise<Record<string, T> | null> {
  return await getSchemaByKeyAndCondition(userContext, data) as Record<string, T> | null;
}

// Type definitions for the data structure
export interface UserContext {
  loginId?: string;
  isAppAdmin?: boolean;
  client?: string;
  type?: string;
  ag?: string;
  app?: string;
  userCode?: string;
  orgGrpCode?: string;
  selectedAccessProfile?: string;
  dap?: string;
  orgGrpName?: string;
  orgCode?: string;
  orgName?: string;
  subOrgGrpCode?: string;
  subOrgGrpName?: string;
  subOrgCode?: string;
  subOrgName?: string;
  psGrpCode?: string;
  psGrpName?: string;
  psCode?: string;
  psName?: string;
  roleGrpCode?: string;
  roleGrpName?: string;
  roleCode?: string;
  roleName?: string;
  sid?: string;
  iat?: number;
  exp?: number;
  [key: string]: any; // Allow for additional dynamic fields
}

export interface DynamicInputData {
  name: string;
  _label: string;
  _type: string;
  items: DynamicInputItem[];
  value: any;
  enabled: boolean;
}

export interface DynamicInputItem {
  key: {
    name: string;
    _label: string;
    _type: string;
    value: string;
    enabled: boolean;
  };
  value: {
    name: string;
    _label: string;
    _type: string;
    items: ValueItem[];
    value?: string;
  };
}

export interface ValueItem {
  condition: {
    name: string;
    _label: string;
    _type: string;
    value: string;
    enabled: boolean;
  };
  schema: {
    name: string;
    _label: string;
    _type: string;
    value: any;
    enabled: boolean;
  };
}
 