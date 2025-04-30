import axios from 'axios';
import { ConfigData } from './types';
import { DEFAULT_USER_AGENT } from './utils';

const CONFIG_URL = 'https://raw.githubusercontent.com/ibnaleem/gosearch/main/data.json';

export async function fetchWebsiteConfig(): Promise<ConfigData | null> {
    try {
        // console.log(`[*] Fetching config from ${CONFIG_URL}...`); // Library shouldn't log directly
        const response = await axios.get<ConfigData>(CONFIG_URL, {
            headers: { 'User-Agent': DEFAULT_USER_AGENT },
            timeout: 15000,
        });
        if (response.status === 200 && response.data?.websites) {
            return response.data;
        }
        console.error(`[-] Failed to fetch valid config. Status: ${response.status}`); // Log errors
        return null;
    } catch (error: any) {
        console.error('[-] Error fetching website configuration:', error.message);
        return null;
    }
}