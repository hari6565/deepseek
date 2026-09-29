"use server"
import { AxiosService } from '../components/axiosService'

export const fetchAMDKey = async (
  key: string,
  token: string,
  preferedResponseType: '' | {} | [] = {}
) => {
  try {
    const response = await AxiosService.get(`UF/readAMDKey`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        key: key
      },
      validateStatus: () => true
    })
    if (response.status == 200) {
      return response.data ?? preferedResponseType
    } else {
      return preferedResponseType
    }
  } catch (error) {
    console.error('Error fetching languages:', error)
  }
}
