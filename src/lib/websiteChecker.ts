import axios, { AxiosRequestConfig } from 'axios';
import { WebsiteConfig, CheckResult } from './types';
import { DEFAULT_USER_AGENT, formatUrl } from './utils';

export async function checkWebsitePresence(
    siteConfig: WebsiteConfig,
    targetUsername: string,
): Promise<CheckResult> {
    const profileUrl = formatUrl(siteConfig.base_url, targetUsername);
    const config: AxiosRequestConfig = {
        url: profileUrl,
        method: 'GET', // Or appropriate method
        headers: {
            'User-Agent': DEFAULT_USER_AGENT,
            // Add other headers as needed
        },
        timeout: 15000, // Example timeout
        validateStatus: (status) => status >= 200 && status < 400, // Consider valid status codes
        // Add other axios config options as needed
    };

    try {
        const response = await axios(config);
        let isPresent = false;
        let isUncertain = false;
        let checkStatus: CheckResult['status'] = 'not_found';

        // ... (switch statement logic for errorType) ...
        // Modify the logic: instead of console.log/appendToFile, set checkStatus

        if (isPresent) {
            checkStatus = 'found';
        } else if (isUncertain) {
            checkStatus = 'uncertain';
        } else {
            checkStatus = 'not_found';
        }

        return {
            siteName: siteConfig.name,
            profileUrl: profileUrl, // Use the base URL for reporting
            status: checkStatus,
        };

    } catch (error: any) {
        return {
            siteName: siteConfig.name,
            profileUrl: profileUrl,
            status: 'error',
            error: error.message,
        };
    }
}