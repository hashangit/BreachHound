import axios from 'axios';
import { ApiCheckResult, ProxyNovaApiResponse } from '../types';
import { DEFAULT_USER_AGENT } from '../utils';
// ... import ProxyNova specific types ...

export async function checkProxyNova(targetUsername: string): Promise<ApiCheckResult> {
    // Construct the correct API URL
    const url = `https://api.proxynova.com/comb?query=${encodeURIComponent(targetUsername)}`;
    try {
        const response = await axios.get<ProxyNovaApiResponse>(url, {
            headers: { 'User-Agent': DEFAULT_USER_AGENT },
            timeout: 15000, // Add a reasonable timeout
        });
        // ... logic to parse response ...
        const found = response.data.found > 0; // Assuming response structure
        return {
            service: 'ProxyNova',
            status: 'checked',
            found: found,
            details: response.data, // Return the raw data or a structured summary
        };
    } catch (error: any) {
        return {
            service: 'ProxyNova',
            status: 'error',
            found: false,
            error: error.message,
        };
    }
}