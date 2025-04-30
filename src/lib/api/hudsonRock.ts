import axios from 'axios';
import { ApiCheckResult, HudsonRockApiResponse } from '../types';
import { DEFAULT_USER_AGENT } from '../utils';
// ... import HudsonRock specific types ...

export async function checkHudsonRock(
    targetUsername: string,
    apiKey: string | undefined // Keep signature consistent, though key is unused now
): Promise<ApiCheckResult> {
    // Use the URL from the GoSearch source code
    const url = `https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-username?username=${encodeURIComponent(targetUsername)}`;
    try {
        // No API key seems needed for this endpoint based on GoSearch code
        const headers: Record<string, string> = { 'User-Agent': DEFAULT_USER_AGENT };

        const response = await axios.get<HudsonRockApiResponse>(url, {
            headers: headers, // Pass headers without API key
            timeout: 15000, // Add a reasonable timeout
        });
        // ... logic to parse response ...
        const found = !!(response.data.stealers && response.data.stealers.length > 0);
        return {
            service: 'HudsonRock',
            status: 'checked',
            found: found,
            details: response.data, // Return the raw data or a structured summary
        };
    } catch (error: any) {
        return {
            service: 'HudsonRock',
            status: 'error',
            found: false,
            error: error.message,
        };
    }
}