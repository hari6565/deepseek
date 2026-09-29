import { AxiosService } from '@/app/components/axiosService';
import { logout } from '../components/utils';

export const fetchBatchData = async (
  key: string,
  accessProfile: any,
  from: string,
  token: string,
  encryptionFlagPageData?: any
) => {
  const payload = {
    key,
    accessProfile,
    from,
    ...(encryptionFlagPageData?.flag
      ? {
          dpdKey: encryptionFlagPageData?.dpd,
          method: encryptionFlagPageData?.method
        }
      : {})
  }
  try {
    const response: any = await AxiosService.post(
      '/UF/OrchestrationBatch',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response?.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching batch data:", error);
    if(error?.status === 401){
      logout();
    }
    return null;
  }
};

/**
 * Get group-level orchestration data by componentId
 * Use this for group components to get security, allowedGroups, readableControls, etc.
 */
export const getGroupOrchestrationData = (
  groupData: any,
  componentId: string
) => {
  if (!groupData) {
    return null;
  }
  return { data: groupData[componentId] || null };
}

/**
 * Get control-level orchestration data by componentId and controlId
 * Use this for individual controllers to get their specific orchestration data
 */
export const getControlOrchestrationData = (
  controlData: any,
  componentId: string,
  controlId: string
) => {
  if (!controlData || !componentId || !controlId) {
    return null;
  }
  return { data: controlData[componentId]?.[controlId] || null }
}

/**
 * @deprecated Use getGroupOrchestrationData or getControlOrchestrationData instead
 */
export const getorchestrationDataByComponentId = (
  controlData: any,
  componentId: string
) => {
  if (!controlData) {
    return null;
  }
  return { data: controlData[componentId] || null }
}
