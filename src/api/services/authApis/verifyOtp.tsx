import { API_CONFIG } from "@/api/config";
import axios from "axios";


export const verifyOtpApi = async (data: any) => {
    const baseUrl = API_CONFIG.BASE_URL;

    const url = data?.userId
        ? `${baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password/verify-otp?userId=${data?.userId}`
        : `${baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password/verify-otp`;

    const response = await axios.post(url, data);

    return response;
};